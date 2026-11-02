export const MARKETS = Object.freeze({
  US: Object.freeze({
    code: 'US',
    country: '美国',
    language: 'en-US',
    languageName: '英语（美国）',
    flag: '🇺🇸',
    currencyNote: '美元区市场，保留原始事实与币种',
    sample: Object.freeze({
      productName: '便携保温杯',
      sourceCopy: '轻巧便携，适合日常通勤。500ml 容量，简约设计，轻松放进随身包，售价 99 元。',
    }),
  }),
  JP: Object.freeze({
    code: 'JP',
    country: '日本',
    language: 'ja-JP',
    languageName: '日语',
    flag: '🇯🇵',
    currencyNote: '日本市场，注重礼仪、细节与质感',
    sample: Object.freeze({
      productName: '桌面收纳盒',
      sourceCopy: '每套 3 个，售价 99 元。11 月 1 日至 11 月 7 日，购买 2 套减 10 元。简约日式风格，告别杂乱桌面。',
    }),
  }),
  DE: Object.freeze({
    code: 'DE',
    country: '德国',
    language: 'de-DE',
    languageName: '德语',
    flag: '🇩🇪',
    currencyNote: '德国市场，注重精准事实与耐用材质',
    sample: Object.freeze({
      productName: '便携保温杯',
      sourceCopy: '双层真空保温，304 不锈钢材质，容量 500ml，保热 12 小时。简约便携，售价 99 元。',
    }),
  }),
});

export const DEFAULT_MARKET_CODE = 'US';

export const SAMPLE_RESULT = Object.freeze({
  localizedCopy: 'Engineered for your daily commute. Sleek, ultralight 500ml insulated flask that fits effortlessly into any tote or backpack. Available now for CNY 99.',
  chineseTranslation: '专为日常通勤设计。轻盈时尚的 500ml 保温杯，轻松装入各式手提包或背包。现售 99 元。',
  culturalNotes: Object.freeze([
    '采用北美市场偏好的直接、场景化表达，以“Engineered for your daily commute”增强产品的实用价值感。',
    '将“简约设计”转化为“fits effortlessly into any tote or backpack”，使便携特性更具象生动。',
    '按事实保留原则保留原始计价“CNY 99”，未擅自转换币种或改变价格。',
  ]),
});
