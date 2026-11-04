export const PROVIDERS = Object.freeze({
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', defaultModel: 'deepseek-flash' },
  siliconflow: { name: '硅基流动', baseUrl: 'https://api.siliconflow.cn/v1', defaultModel: '' },
  openrouter: { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: '' },
});

export function validateModelSettings(config) {
  if (!config || !Object.hasOwn(PROVIDERS, config.provider)) return '请选择支持的模型供应商。';
  if (typeof config.model !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,199}$/.test(config.model.trim())) {
    return '请填写有效的模型 ID（最多 200 个字符，不含空格）。';
  }
  if (typeof config.apiKey !== 'string' || !/^[\x21-\x7e]{1,4096}$/.test(config.apiKey.trim())) {
    return '请填写有效的 API Key，不含空白字符。';
  }
  return '';
}
