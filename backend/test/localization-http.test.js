import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { createApp } from '../src/app.js';
import { createLocalizer } from '../src/localization/client.js';
import { completion, input, llmConfig, result } from '../test-support/localization.js';

test('HTTP pipeline uses a local compatible service, never a real provider', async t => {
  let mode = 'success';
  const requests = [];
  const upstream = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    requests.push({ path: req.url, authorization: req.headers.authorization, body: JSON.parse(body) });

    if (mode === 'http-error') {
      res.writeHead(401).end('private-provider-details');
    } else if (mode === 'timeout') {
      // Send headers, then stall the response body to verify real fetch cancellation.
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.flushHeaders();
      res.write(' ');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(mode === 'invalid-json' ? '<html>private-provider-details</html>'
        : JSON.stringify(mode === 'invalid-fields' ? completion({ ...result, culturalNotes: [] }) : completion()));
    }
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const localize = createLocalizer({
    ...llmConfig, baseUrl: `http://127.0.0.1:${upstream.address().port}/v1`, timeoutMs: 200,
  });
  const api = createApp({ localize }).listen(0, '127.0.0.1');
  await new Promise(resolve => api.once('listening', resolve));

  const post = value => fetch(`http://127.0.0.1:${api.address().port}/api/localize`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value),
  });

  try {
    for (const [targetCountry, targetLanguage] of [['US', 'en-US'], ['JP', 'ja-JP'], ['DE', 'de-DE']]) {
      await t.test(`success envelope for ${targetCountry}`, async () => {
        const response = await post({ ...input, targetCountry, targetLanguage });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { data: result });
        const received = requests.at(-1);
        assert.equal(received.path, '/v1/chat/completions');
        assert.equal(received.authorization, `Bearer ${llmConfig.apiKey}`);
        assert.equal(JSON.parse(received.body.messages[1].content).targetLanguage, targetLanguage);
      });
    }

    await t.test('invalid input never reaches upstream', async () => {
      const count = requests.length;
      const response = await post({ ...input, targetLanguage: 'de-DE' });
      assert.equal(response.status, 400);
      assert.equal(requests.length, count);
    });

    for (const [scenario, status, code] of [
      ['http-error', 502, 'UPSTREAM_ERROR'],
      ['invalid-json', 502, 'INVALID_MODEL_RESPONSE'],
      ['invalid-fields', 502, 'INVALID_MODEL_RESPONSE'],
      ['timeout', 504, 'UPSTREAM_TIMEOUT'],
    ]) {
      await t.test(scenario, async () => {
        mode = scenario;
        const count = requests.length;
        const response = await post(input);
        const body = await response.json();
        assert.equal(response.status, status);
        assert.equal(body.error.code, code);
        assert.equal(requests.length, count + 1, 'One request only; no automatic retries');
        assert.ok(!JSON.stringify(body).includes('private-provider-details'));
        assert.ok(!JSON.stringify(body).includes(llmConfig.apiKey));
      });
    }
  } finally {
    api.closeAllConnections();
    upstream.closeAllConnections();
    await Promise.all([
      new Promise(resolve => api.close(resolve)),
      new Promise(resolve => upstream.close(resolve)),
    ]);
  }
});
