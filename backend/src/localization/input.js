import { ApiError } from '../errors.js';

export const markets = Object.freeze({
  US: Object.freeze({ country: '美国', language: 'en-US', languageName: '英语（美国）' }),
  JP: Object.freeze({ country: '日本', language: 'ja-JP', languageName: '日语' }),
  DE: Object.freeze({ country: '德国', language: 'de-DE', languageName: '德语' }),
});

export function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApiError(400, 'VALIDATION_ERROR', '请求体必须为 JSON 对象。');
  }

  const result = {};
  for (const [field, label, max] of [
    ['productName', '商品名称', 100],
    ['sourceCopy', '原始营销文案', 2000],
  ]) {
    const value = typeof input[field] === 'string' ? input[field].trim() : '';
    if (!value || Array.from(value).length > max) {
      throw new ApiError(400, 'VALIDATION_ERROR', `${label}须为 1～${max} 个字符。`);
    }
    result[field] = value;
  }

  const market = typeof input.targetCountry === 'string' && Object.hasOwn(markets, input.targetCountry)
    ? markets[input.targetCountry] : null;
  if (typeof input.targetCountry !== 'string' || !market || input.targetLanguage !== market.language) {
    throw new ApiError(400, 'VALIDATION_ERROR', '请选择支持的国家及其对应语言。');
  }

  return { ...result, targetCountry: input.targetCountry, targetLanguage: market.language };
}
