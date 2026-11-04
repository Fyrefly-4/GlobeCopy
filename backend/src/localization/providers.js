import { ApiError } from '../errors.js';

export const providers = Object.freeze({
  deepseek: Object.freeze({ name: 'DeepSeek', baseUrl: 'https://api.deepseek.com' }),
  siliconflow: Object.freeze({ name: '硅基流动', baseUrl: 'https://api.siliconflow.cn/v1' }),
  openrouter: Object.freeze({ name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' }),
});

export function resolveModelConfig(input) {
  const invalid = () => new ApiError(400, 'MODEL_CONFIG_INVALID', '请填写支持的供应商、模型名称和 API Key。');
  if (!input || typeof input !== 'object' || Array.isArray(input)
      || typeof input.provider !== 'string' || !Object.hasOwn(providers, input.provider)
      || Object.hasOwn(input, 'baseUrl') || Object.hasOwn(input, 'url')) throw invalid();

  const apiKey = typeof input.apiKey === 'string' ? input.apiKey.trim() : '';
  const model = typeof input.model === 'string' ? input.model.trim() : '';
  if (!/^[\x21-\x7e]{1,4096}$/.test(apiKey) || !/^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,199}$/.test(model)) {
    throw invalid();
  }
  return { apiKey, model, baseUrl: providers[input.provider].baseUrl, timeoutMs: 60000 };
}
