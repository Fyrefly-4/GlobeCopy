import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { requestLocalization, ApiRequestError } from '../src/services/api.js';

describe('frontend api service', () => {
  it('rejects empty text and invalid cultural notes before rendering', async () => {
    const originalFetch = globalThis.fetch;
    const valid = { localizedCopy: 'copy', chineseTranslation: '对照', culturalNotes: ['说明一', '说明二'] };
    try {
      for (const data of [
        { ...valid, localizedCopy: ' ' },
        { ...valid, culturalNotes: [] },
        { ...valid, culturalNotes: ['说明', { unexpected: 'object' }] },
      ]) {
        globalThis.fetch = async () => Response.json({ data });
        await assert.rejects(requestLocalization({
          productName: '杯子', sourceCopy: '便携', targetCountry: 'US', targetLanguage: 'en-US',
        }), { code: 'INVALID_MODEL_RESPONSE' });
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('sends trimmed fields and receives localized result', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, options) => {
        assert.equal(url, '/api/localize');
        assert.equal(options.method, 'POST');
        assert.equal(options.headers['Content-Type'], 'application/json');

        const body = JSON.parse(options.body);
        assert.equal(body.productName, '保温杯');
        assert.equal(body.sourceCopy, '轻巧便携');
        assert.equal(body.targetCountry, 'US');
        assert.equal(body.targetLanguage, 'en-US');

        return new Response(
          JSON.stringify({
            data: {
              localizedCopy: 'Lightweight and portable flask.',
              chineseTranslation: '轻巧便携的保温杯。',
              culturalNotes: ['突出便携通勤场景。', '保留原始商品信息。'],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      };

      const result = await requestLocalization({
        productName: '  保温杯  ',
        sourceCopy: '  轻巧便携  ',
        targetCountry: 'US',
        targetLanguage: 'en-US',
      });

      assert.equal(result.localizedCopy, 'Lightweight and portable flask.');
      assert.equal(result.chineseTranslation, '轻巧便携的保温杯。');
      assert.equal(result.culturalNotes.length, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('handles backend validation errors', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: '商品名称须为 1～100 个字符。',
            },
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );

      await assert.rejects(
        () =>
          requestLocalization({
            productName: '',
            sourceCopy: '文案',
            targetCountry: 'US',
            targetLanguage: 'en-US',
          }),
        (err) => {
          assert.ok(err instanceof ApiRequestError);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.equal(err.message, '商品名称须为 1～100 个字符。');
          return true;
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('handles network failure', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch');
      };

      await assert.rejects(
        () =>
          requestLocalization({
            productName: '测试',
            sourceCopy: '文案',
            targetCountry: 'US',
            targetLanguage: 'en-US',
          }),
        (err) => {
          assert.ok(err instanceof ApiRequestError);
          assert.equal(err.code, 'NETWORK_ERROR');
          return true;
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('handles malformed success response', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            data: {
              localizedCopy: 'only this field',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );

      await assert.rejects(
        () =>
          requestLocalization({
            productName: '测试',
            sourceCopy: '文案',
            targetCountry: 'US',
            targetLanguage: 'en-US',
          }),
        (err) => {
          assert.ok(err instanceof ApiRequestError);
          assert.equal(err.code, 'INVALID_MODEL_RESPONSE');
          return true;
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
