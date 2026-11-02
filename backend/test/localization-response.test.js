import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCompletion } from '../src/localization/response.js';
import { completion, result } from '../test-support/localization.js';

test('valid output is trimmed and extra fields never leave the adapter', () => {
  assert.deepEqual(parseCompletion(completion({
    ...result, localizedCopy: ` ${result.localizedCopy} `,
    culturalNotes: result.culturalNotes.map(note => ` ${note} `), extra: 'private',
  })), result);
});

test('malformed, empty, truncated or structurally invalid output is rejected', async t => {
  const variants = [
    null, {}, { choices: [] },
    { choices: [{ finish_reason: 'stop', message: { content: '   ' } }] },
    { choices: [{ finish_reason: 'stop', message: { content: '{invalid' } }] },
    { choices: [{ finish_reason: 'stop', message: { content: '```json\n{}\n```' } }] },
    completion(result, 'length'), completion(result, 'content_filter'),
    completion(null), completion([]), completion({ ...result, localizedCopy: '' }),
    completion({ ...result, chineseTranslation: 42 }),
    completion({ ...result, culturalNotes: ['only one'] }),
    completion({ ...result, culturalNotes: Array(5).fill('too many') }),
    completion({ ...result, culturalNotes: ['valid', '   '] }),
    completion({ ...result, culturalNotes: ['valid', null] }),
    completion({ localizedCopy: 'copy', culturalNotes: ['a', 'b'] }),
  ];
  for (const [index, variant] of variants.entries()) {
    await t.test(`invalid response ${index + 1}`, () => {
      assert.throws(() => parseCompletion(variant), { code: 'INVALID_MODEL_RESPONSE', status: 502 });
    });
  }
});
