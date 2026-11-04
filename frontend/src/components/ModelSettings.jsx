import { useEffect, useRef } from 'react';
import { PROVIDERS, validateModelSettings } from '../constants/providers.js';

export default function ModelSettings({ value, onChange, loading, error, expanded, onToggle }) {
  const modelRef = useRef(null);
  const keyRef = useRef(null);
  useEffect(() => {
    if (!expanded || !error) return;
    const invalidModel = !/^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,199}$/.test(value.model.trim());
    const field = (invalidModel ? modelRef : keyRef).current;
    field?.focus();
    field?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [expanded, error, value.model]);
  const provider = PROVIDERS[value.provider];
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100';
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="modelSettingsHeading">
      <button id="modelSettingsHeading" type="button" onClick={onToggle} disabled={loading}
        aria-expanded={expanded} aria-controls="modelSettingsBody"
        className="flex w-full flex-wrap items-center justify-between gap-2 text-left text-sm font-medium text-slate-700">
        <span>模型设置 <span className="ml-2 text-xs font-normal text-slate-500">{validateModelSettings(value) ? '未配置' : `已配置 · ${provider.name}`}</span></span>
        <span className="text-xs text-indigo-600">{expanded ? '收起 ↑' : '展开设置 ↓'}</span>
      </button>
      {expanded && <div id="modelSettingsBody" className="mt-3">
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
          <input ref={modelRef} className={inputClass} value={value.model} autoComplete="off" spellCheck={false}
            placeholder="填写该供应商支持 JSON 输出的模型 ID"
            onChange={event => onChange({ ...value, model: event.target.value })} />
        </label>
        <label className="text-xs font-medium text-slate-700">
          API Key（仅本页）
          <input ref={keyRef} className={inputClass} type="password" value={value.apiKey} autoComplete="off" spellCheck={false}
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
      </div>}
    </section>
  );
}
