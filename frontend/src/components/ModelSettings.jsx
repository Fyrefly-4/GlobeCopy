import { PROVIDERS } from '../constants/providers.js';

export default function ModelSettings({ value, onChange, loading, error }) {
  const provider = PROVIDERS[value.provider];
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100';
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="modelSettingsHeading">
      <h2 id="modelSettingsHeading" className="font-semibold text-slate-900">模型配置 · 使用自己的 Key</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Key 仅保存在本页内存，刷新后清空。生成时会交给本应用后端临时转发至所选官方服务，应用不持久保存。
        请选择支持 JSON 输出的模型，调用费用由你的供应商账户承担。
      </p>
      <fieldset disabled={loading} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-700">
          模型供应商
          <select className={inputClass} value={value.provider} onChange={event => {
            const next = event.target.value;
            onChange({ provider: next, model: PROVIDERS[next].defaultModel, apiKey: '' });
          }}>
            {Object.entries(PROVIDERS).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-700">
          API 基础地址（固定）
          <input className={inputClass} value={provider.baseUrl} readOnly />
        </label>
        <label className="text-xs font-medium text-slate-700">
          模型 ID
          <input className={inputClass} value={value.model} autoComplete="off" spellCheck={false}
            placeholder="填写该供应商支持 JSON 输出的模型 ID"
            onChange={event => onChange({ ...value, model: event.target.value })} />
        </label>
        <label className="text-xs font-medium text-slate-700">
          API Key（仅本页）
          <input className={inputClass} type="password" value={value.apiKey} autoComplete="off" spellCheck={false}
            placeholder="填写所选供应商的 Key"
            onChange={event => onChange({ ...value, apiKey: event.target.value })} />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
          <span className="text-xs text-slate-500">发送目标：{provider.baseUrl}</span>
          <button type="button" onClick={() => onChange({ ...value, apiKey: '' })}
            className="text-xs font-medium text-indigo-600 underline disabled:opacity-50">清除 Key</button>
        </div>
      </fieldset>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    </section>
  );
}
