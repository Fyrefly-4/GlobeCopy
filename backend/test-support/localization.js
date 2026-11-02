export const input = {
  productName: '便携保温杯',
  sourceCopy: '轻巧便携，500ml 容量，售价 99 元。',
  targetCountry: 'US',
  targetLanguage: 'en-US',
};

export const result = {
  localizedCopy: 'Lightweight for your commute. 500 ml, CNY 99.',
  chineseTranslation: '轻巧便携，适合通勤。容量 500ml，售价 99 元。',
  culturalNotes: ['用简洁句式突出通勤场景。', '使用 CNY 标示原始币种，没有换算金额。'],
};

export const llmConfig = {
  apiKey: 'test-key-not-real',
  baseUrl: 'https://model.example/v1/',
  model: 'test-compatible-model',
  timeoutMs: 1000,
};

export const completion = (value = result, finishReason = 'stop') => ({
  choices: [{ finish_reason: finishReason, message: { content: JSON.stringify(value) } }],
});
