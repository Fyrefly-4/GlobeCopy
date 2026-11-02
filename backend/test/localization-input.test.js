import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateInput } from '../src/localization/input.js';
import { buildMessages } from '../src/localization/prompt.js';
import { input } from '../test-support/localization.js';

test('all three markets map to the intended target in the prompt', () => {
  for (const [targetCountry, targetLanguage, label] of [
    ['US', 'en-US', '英语（美国）'], ['JP', 'ja-JP', '日语'], ['DE', 'de-DE', '德语'],
  ]) {
    const valid = validateInput({ ...input, targetCountry, targetLanguage });
    assert.equal(JSON.parse(buildMessages(valid)[1].content).targetLanguage, targetLanguage);
    assert.equal(JSON.parse(buildMessages(valid)[1].content).targetMarket, { US: '美国', JP: '日本', DE: '德国' }[targetCountry]);
    assert.equal(JSON.parse(buildMessages(valid)[1].content).targetLanguageName, label);
    assert.ok(buildMessages(valid)[1].content.includes(targetCountry));
  }
});

test('trims inputs, counts Unicode code points and removes unknown input fields', () => {
  const valid = validateInput({
    ...input, productName: ` ${'😀'.repeat(100)} `, sourceCopy: '中'.repeat(2000), extra: 'ignore',
  });
  assert.equal(Array.from(valid.productName).length, 100);
  assert.equal(valid.sourceCopy.length, 2000);
  assert.equal(Object.hasOwn(valid, 'extra'), false);
});

test('invalid body, fields, lengths and market combinations are rejected', () => {
  for (const invalid of [
    undefined, null, [], 'text', {}, { ...input, productName: '  ' },
    { ...input, productName: 1 }, { ...input, sourceCopy: '\n ' },
    { ...input, productName: '😀'.repeat(101) }, { ...input, sourceCopy: '中'.repeat(2001) },
    { ...input, targetCountry: '__proto__' }, { ...input, targetCountry: ['US'] },
    { ...input, targetCountry: 'GB' }, { ...input, targetLanguage: 'ja-JP' },
  ]) {
    assert.throws(() => validateInput(invalid), { code: 'VALIDATION_ERROR', status: 400 });
  }
});
