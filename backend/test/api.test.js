import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/errors.js';
import { createByokLocalizer } from '../src/localization/byok.js';
import { input } from '../test-support/localization.js';

let server;
let baseUrl;

before(async () => {
  server = createApp({
    localize: createByokLocalizer({
      fetchImpl: () => { assert.fail('API tests must not call external model services'); },
    }),
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});

const post = (body, contentType = 'application/json') => fetch(`${baseUrl}/api/localize`, {
  method: 'POST',
  headers: { 'Content-Type': contentType },
  body,
});

test('health check works without model credentials', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { status: 'ok' } });
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('localize reports missing BYOK configuration without making a network request', async () => {
  const response = await post(JSON.stringify(input));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'MODEL_CONFIG_INVALID');
});

test('invalid fields fail before checking credentials or calling the model', async () => {
  for (const body of [{}, { ...input, targetCountry: 'JP' }, { ...input, sourceCopy: ' ' }]) {
    const response = await post(JSON.stringify(body));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'VALIDATION_ERROR');
  }
});

test('malformed JSON returns a safe validation error', async () => {
  const response = await post('{"privateInput":');
  assert.equal(response.status, 400);
  const result = await response.json();
  assert.equal(result.error.code, 'VALIDATION_ERROR');
  assert.ok(!JSON.stringify(result).includes('privateInput'));
});

test('oversized JSON returns a structured 413 error', async () => {
  const response = await post(JSON.stringify({ sourceCopy: 'a'.repeat(33 * 1024) }));
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error.code, 'PAYLOAD_TOO_LARGE');
});

test('non-JSON content is rejected', async () => {
  const response = await post('sourceCopy=test', 'text/plain');
  assert.equal(response.status, 415);
  assert.equal((await response.json()).error.code, 'UNSUPPORTED_MEDIA_TYPE');
});

test('unknown endpoints return JSON instead of an HTML page', async () => {
  const response = await fetch(`${baseUrl}/api/missing`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, 'NOT_FOUND');
});

test('unexpected errors never expose internal messages or stack traces', async () => {
  const app = express();
  app.get('/', () => { throw new Error('secret-upstream-detail'); });
  app.use(errorHandler);
  const errorServer = app.listen(0, '127.0.0.1');
  await new Promise(resolve => errorServer.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${errorServer.address().port}`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: { code: 'INTERNAL_ERROR', message: '服务发生异常，请重试。' },
    });
  } finally {
    errorServer.closeAllConnections();
    await new Promise(resolve => errorServer.close(resolve));
  }
});
