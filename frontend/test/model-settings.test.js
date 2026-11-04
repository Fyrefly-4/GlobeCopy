import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PROVIDERS, validateModelSettings } from '../src/constants/providers.js';
import { providers } from '../../backend/src/localization/providers.js';

test('frontend destinations match the backend allowlist', () => {
  assert.deepEqual(Object.keys(PROVIDERS).sort(), Object.keys(providers).sort());
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    assert.equal(provider.baseUrl, providers[id].baseUrl);
    assert.equal(provider.name, providers[id].name);
  }
});

test('model settings require a known provider, model and printable key', () => {
  const valid = { provider: 'deepseek', model: 'user/model:free', apiKey: 'test-key' };
  assert.equal(validateModelSettings(valid), '');
  for (const config of [undefined, { ...valid, provider: 'custom' }, { ...valid, model: '' },
    { ...valid, apiKey: '' }, { ...valid, apiKey: 'key\r\nheader' }]) {
    assert.ok(validateModelSettings(config));
  }
});
