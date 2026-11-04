import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createByokLocalizer } from '../../backend/src/localization/byok.js';
import { createApp } from '../../backend/src/app.js';
import { input, completion, result } from '../backend-support/localization.js';

const modelConfig = { provider: 'deepseek', model: 'user-model', apiKey: 'test-user-key' };

test('BYOK restricts destinations and never forwards configuration in prompts', async () => {
  for (const [provider, endpoint] of [
    ['deepseek', 'https://api.deepseek.com/chat/completions'],
    ['siliconflow', 'https://api.siliconflow.cn/v1/chat/completions'],
    ['openrouter', 'https://openrouter.ai/api/v1/chat/completions'],
  ]) {
    const localize = createByokLocalizer({ fetchImpl: async (url, options) => {
      assert.equal(url.href, endpoint);
      assert.equal(options.headers.Authorization, `Bearer ${modelConfig.apiKey}`);
      const body = JSON.parse(options.body);
      assert.equal(body.model, modelConfig.model);
      assert.ok(!JSON.stringify(body.messages).includes(modelConfig.apiKey));
      assert.equal(options.redirect, 'error');
      return Response.json(completion());
    } });
    assert.deepEqual(await localize({ ...input, modelConfig: { ...modelConfig, provider } }), result);
  }
});

test('invalid credentials or arbitrary URLs fail before any upstream request', async () => {
  const localize = createByokLocalizer({ fetchImpl: () => assert.fail('No upstream request expected') });
  for (const config of [
    undefined, null, [], {}, { ...modelConfig, provider: '__proto__' },
    { ...modelConfig, provider: 'custom' }, { ...modelConfig, apiKey: ' ' },
    { ...modelConfig, apiKey: 'a\r\nb' }, { ...modelConfig, apiKey: 'a'.repeat(4097) },
    { ...modelConfig, model: '' }, { ...modelConfig, baseUrl: 'http://127.0.0.1' },
    { ...modelConfig, url: 'https://attacker.example' },
  ]) {
    await assert.rejects(localize({ ...input, modelConfig: config }), { status: 400, code: 'MODEL_CONFIG_INVALID' });
  }
});

test('concurrent users have isolated request credentials and models', async () => {
  const observed = [];
  const localize = createByokLocalizer({ fetchImpl: async (url, options) => {
    observed.push([options.headers.Authorization, JSON.parse(options.body).model]);
    await new Promise(resolve => setTimeout(resolve, 5));
    return Response.json(completion());
  } });
  await Promise.all(['alice', 'bob'].map(name => localize({
    ...input, modelConfig: { ...modelConfig, apiKey: `test-${name}`, model: `model-${name}` },
  })));
  assert.deepEqual(observed.sort(), [['Bearer test-alice', 'model-alice'], ['Bearer test-bob', 'model-bob']]);
});

test('HTTP BYOK never returns keys, including upstream failures', async () => {
  let fail = false;
  const localize = createByokLocalizer({ fetchImpl: async () => fail
    ? new Response(`private ${modelConfig.apiKey}`, { status: 401 }) : Response.json(completion()) });
  const server = createApp({ localize }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    for (const failure of [false, true]) {
      fail = failure;
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/localize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, modelConfig }),
      });
      assert.equal(response.status, failure ? 502 : 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.text();
      assert.ok(!body.includes(modelConfig.apiKey));
      assert.ok(!body.includes('private'));
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
