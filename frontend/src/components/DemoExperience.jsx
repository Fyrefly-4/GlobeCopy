import { useState } from 'react';
import { DEMO_SCENARIOS } from '../constants/demos.js';
import { MARKETS } from '../constants/markets.js';

export default function DemoExperience({ onPlay, loading }) {
  const [scenario, setScenario] = useState('cup');
  const [country, setCountry] = useState('US');
  return (
    <details className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
      <summary className="cursor-pointer text-sm font-medium text-indigo-800">体验演示 <span className="ml-2 text-xs font-normal">无需 API Key</span></summary>
      <p className="mt-3 text-xs text-slate-600">选择场景与市场，查看预置的完整本地化示例。你也可以修改文案，再使用自己的 Key 生成。</p>
      <fieldset disabled={loading} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-slate-700">演示场景
          <select value={scenario} onChange={event => setScenario(event.target.value)}
            className="mt-1 block rounded-lg border border-slate-200 bg-white p-2 text-sm">
            {Object.entries(DEMO_SCENARIOS).map(([id, item]) => <option key={id} value={id}>{item.title}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-700">演示市场
          <select value={country} onChange={event => setCountry(event.target.value)}
            className="mt-1 block rounded-lg border border-slate-200 bg-white p-2 text-sm">
            {Object.entries(MARKETS).map(([id, item]) => <option key={id} value={id}>{item.country}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => onPlay(scenario, country)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">查看演示结果</button>
      </fieldset>
    </details>
  );
}
