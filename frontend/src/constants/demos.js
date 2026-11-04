import { MARKETS } from './markets.js';

export const DEMO_SCENARIOS = {
  cup: {
    title: '便携保温杯 · 日常推广',
    productName: '便携保温杯',
    sourceCopy: '轻巧便携，适合日常通勤。500ml 容量，简约设计，轻松放进随身包，售价 99 元。',
    results: {
      US: {
        localizedCopy: 'Keep your commute light. This lightweight 500 ml insulated cup features a simple design and slips easily into your everyday bag. Priced at CNY 99.',
        chineseTranslation: '让通勤更轻便。这款轻巧的 500ml 保温杯采用简约设计，可轻松放进日常随身包。售价 99 元人民币。',
        culturalNotes: ['用“Keep your commute light”作为简短开场，先呈现通勤场景。', '将容量和便携特点连接成完整句子，保留简约设计这一卖点。', '价格标注为 CNY 99，说明原始币种，不换算美元。'],
      },
      JP: {
        localizedCopy: '毎日の通勤に、軽やかに持ち歩ける保温カップを。容量500mlのシンプルなデザインで、いつものバッグにもすっきり収まります。価格は99人民元です。',
        chineseTranslation: '为每日通勤带上一只轻巧便携的保温杯。容量 500ml，设计简约，也能轻松放进日常使用的包中。价格为 99 元人民币。',
        culturalNotes: ['以“毎日の通勤に”引入使用场景，采用柔和的邀请式表达。', '用“いつものバッグ”承接随身包，让便携特点融入日常叙述。', '保留 500ml 和 99 人民元，没有添加保温时长或材质承诺。'],
      },
      DE: {
        localizedCopy: 'Leicht durch den Pendleralltag: Dieser leichte, kompakte Isolierbecher fasst 500 ml und passt mit seinem schlichten Design problemlos in die Alltagstasche. Preis: 99 CNY.',
        chineseTranslation: '轻便应对日常通勤：这款轻巧便携的保温杯容量为 500ml，设计简约，可轻松放进日常随身包。价格：99 元人民币。',
        culturalNotes: ['用通勤场景作标题，再以连贯句子介绍容量、设计和携带方式。', '将“简约设计”表达为“schlichtes Design”，不额外添加材质或耐用性描述。', '采用“500 ml”和“99 CNY”的书写形式，保留原始数量与币种。'],
      },
    },
  },
  organizer: {
    title: '桌面收纳盒 · 限时促销',
    productName: '桌面收纳盒',
    sourceCopy: '每套 3 个，每套售价 99 元。11 月 1 日至 11 月 7 日，购买 2 套减 10 元。简约设计，让桌面更整洁。',
    results: {
      US: {
        localizedCopy: 'A tidier desk, simply. These desk organizers come in a set of 3 for CNY 99 per set. From November 1 through November 7, buy 2 sets and save CNY 10.',
        chineseTranslation: '简单收纳，让桌面更整洁。这款桌面收纳盒每套 3 个，每套售价 99 元人民币。11 月 1 日至 11 月 7 日，购买 2 套可减 10 元人民币。',
        culturalNotes: ['先用整洁桌面的使用价值开场，再说明套装内容和优惠。', '使用“per set”和“buy 2 sets”，明确价格单位与优惠门槛。', '完整保留 3 个、99 元、11 月 1 日至 7 日及购买 2 套减 10 元，没有引入百分比折扣。'],
      },
      JP: {
        localizedCopy: 'シンプルな収納で、デスクをすっきり。卓上収納ボックスは1セット3個入り、価格は1セット99人民元です。11月1日から11月7日まで、2セットのご購入で10人民元引きになります。',
        chineseTranslation: '用简约收纳让桌面更整洁。桌面收纳盒每套 3 个，每套售价 99 元人民币。11 月 1 日至 11 月 7 日期间，购买 2 套可减 10 元人民币。',
        culturalNotes: ['使用“デスクをすっきり”简洁呈现整理效果，没有承诺额外功能。', '用“ご購入”和完整句式表达优惠，语气保持礼貌。', '分别写明每套数量、单套价格、活动日期和两套门槛，避免将优惠误解为单套减价。'],
      },
      DE: {
        localizedCopy: 'Schlichtes Design für einen aufgeräumten Schreibtisch. Die Schreibtisch-Organizer gibt es im 3er-Set für 99 CNY pro Set. Vom 1. bis 7. November: Beim Kauf von 2 Sets sparen Sie 10 CNY.',
        chineseTranslation: '用简约设计打造整洁桌面。桌面收纳盒每套 3 个，每套售价 99 元人民币。11 月 1 日至 7 日，购买 2 套可减 10 元人民币。',
        culturalNotes: ['先说明设计与用途，再单独列出活动条件，便于浏览。', '采用“3er-Set”和“pro Set”区分套装数量与计价单位。', '用“Beim Kauf von 2 Sets”明确优惠条件，日期写作“1. bis 7. November”，保留原始币种。'],
      },
    },
  },
};

// Demo data has no network or credential dependency.
export function getDemo(scenarioId, country) {
  if (!Object.hasOwn(DEMO_SCENARIOS, scenarioId) || !Object.hasOwn(MARKETS, country)) {
    throw new RangeError('Unknown demo scenario or market');
  }
  const scenario = DEMO_SCENARIOS[scenarioId];
  return {
    formData: { productName: scenario.productName, sourceCopy: scenario.sourceCopy,
      targetCountry: country, targetLanguage: MARKETS[country].language },
    result: scenario.results[country],
    market: MARKETS[country],
  };
}
