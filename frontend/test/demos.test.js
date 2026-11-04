import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDemo, DEMO_SCENARIOS } from '../src/constants/demos.js';
import { MARKETS } from '../src/constants/markets.js';

test('six demos keep market, input and result aligned without network or credentials', () => {
  for (const scenario of Object.keys(DEMO_SCENARIOS)) {
    for (const country of Object.keys(MARKETS)) {
      const demo = getDemo(scenario, country);
      assert.equal(demo.formData.targetLanguage, MARKETS[country].language);
      assert.equal(demo.market.code, country);
      assert.ok(demo.formData.productName && demo.formData.sourceCopy);
      assert.ok(demo.result.localizedCopy && demo.result.chineseTranslation);
      assert.ok(demo.result.culturalNotes.length >= 2 && demo.result.culturalNotes.length <= 4);
      assert.ok(demo.result.localizedCopy.includes('99'));
      if (scenario === 'organizer') {
        for (const fact of ['3', '2', '10', '1', '7']) assert.ok(demo.result.localizedCopy.includes(fact));
      } else {
        assert.ok(demo.result.localizedCopy.includes('500'));
      }
      assert.equal(Object.hasOwn(demo.formData, 'modelConfig'), false);
    }
  }
});

test('unsupported demo selections cannot return mismatched results', () => {
  assert.throws(() => getDemo('missing', 'US'), RangeError);
  assert.throws(() => getDemo('cup', 'GB'), RangeError);
});
