export const MARKETS = Object.freeze({
  US: Object.freeze({
    code: 'US',
    country: '美国',
    language: 'en-US',
    languageName: '英语（美国）',
    flag: '🇺🇸',
    currencyNote: '美元区市场，保留原始事实与币种',
  }),
  JP: Object.freeze({
    code: 'JP',
    country: '日本',
    language: 'ja-JP',
    languageName: '日语',
    flag: '🇯🇵',
    currencyNote: '日本市场，注重礼仪、细节与质感',
  }),
  DE: Object.freeze({
    code: 'DE',
    country: '德国',
    language: 'de-DE',
    languageName: '德语',
    flag: '🇩🇪',
    currencyNote: '德国市场，注重精准事实与耐用材质',
  }),
});

export const DEFAULT_MARKET_CODE = 'US';
