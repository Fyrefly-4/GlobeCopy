import { useState } from 'react';
import { MARKETS } from '../constants/markets.js';

export function validateField(field, value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  const length = Array.from(trimmed).length;

  if (field === 'productName') {
    if (!trimmed) {
      return '请输入商品名称（不可仅包含空白字符）。';
    }
    if (length > 100) {
      return `商品名称已超出上限（当前 ${length} / 最大 100 字符）。`;
    }
    return '';
  }

  if (field === 'sourceCopy') {
    if (!trimmed) {
      return '请输入原始营销文案（不可仅包含空白字符）。';
    }
    if (length > 2000) {
      return `文案已超出最大长度限制（当前 ${length} / 最大 2,000 字符）。`;
    }
    return '';
  }

  return '';
}

export default function CopyInputForm({
  formData,
  onChange,
  onApplySample,
  onSubmit,
  loading = false,
  fieldErrors = {},
  onClearFieldError,
}) {
  const [touched, setTouched] = useState({
    productName: false,
    sourceCopy: false,
  });

  const currentMarket = MARKETS[formData.targetCountry] || MARKETS.US;

  // Unicode 码点精准计数
  const sourceCopyLength = Array.from(formData.sourceCopy || '').length;
  const isSourceCopyOverLimit = sourceCopyLength > 2000;
  const productNameLength = Array.from(formData.productName || '').length;
  const isProductNameOverLimit = productNameLength > 100;

  // 字符计数器颜色指示器
  const getCounterStyle = (len, max) => {
    if (len > max) return 'bg-rose-50 text-rose-600 border-rose-200 font-bold';
    if (len > max * 0.9) return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    const market = MARKETS[newCountry];
    if (market) {
      onChange({
        ...formData,
        targetCountry: newCountry,
        targetLanguage: market.language,
      });
    }
  };

  const handleInputChange = (field) => (e) => {
    onChange({
      ...formData,
      [field]: e.target.value,
    });
    if (onClearFieldError) {
      onClearFieldError(field);
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const productNameError = (touched.productName && validateField('productName', formData.productName)) || fieldErrors.productName;
  const sourceCopyError = (touched.sourceCopy && validateField('sourceCopy', formData.sourceCopy)) || fieldErrors.sourceCopy;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    // 提交时标记所有字段为 touched
    setTouched({ productName: true, sourceCopy: true });

    const pErr = validateField('productName', formData.productName);
    const sErr = validateField('sourceCopy', formData.sourceCopy);
    if (pErr || sErr) {
      return;
    }

    onSubmit(e);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* 头部标题与快捷操作 */}
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>营销文案输入</span>
            <span className="text-xs font-normal text-slate-400">（必填）</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            填写中文推广内容，大模型将自动调整为符合目标市场语境的本地化文案
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onApplySample();
            setTouched({ productName: false, sourceCopy: false });
          }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          title="填入针对当前目标市场的标准测试样例"
        >
          <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span>填入测试样例</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* 字段 1：商品名称 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="productName" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              商品名称 <span className="text-rose-500">*</span>
            </label>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-mono transition-colors ${getCounterStyle(
                productNameLength,
                100,
              )}`}
            >
              {productNameLength} / 100
            </span>
          </div>

          <div className="relative">
            <input
              id="productName"
              type="text"
              required
              disabled={loading}
              value={formData.productName}
              onChange={handleInputChange('productName')}
              onBlur={handleBlur('productName')}
              placeholder="例如：便携保温杯、桌面收纳盒"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
                productNameError
                  ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500/10'
              }`}
            />
          </div>

          {productNameError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 animate-in fade-in duration-200">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
              </svg>
              <span>{productNameError}</span>
            </p>
          )}
        </div>

        {/* 字段 2 & 3：目标国家与联动语言 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 目标国家 */}
          <div>
            <label htmlFor="targetCountry" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              目标国家 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="targetCountry"
                disabled={loading}
                value={formData.targetCountry}
                onChange={handleCountryChange}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-10 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {Object.values(MARKETS).map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.flag} {m.country} ({m.code})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{currentMarket.currencyNote}</p>
          </div>

          {/* 目标语言（只读展示） */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="targetLanguage" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                目标语言 <span className="text-slate-400 font-normal">（自动带出）</span>
              </label>
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                <svg className="h-2.5 w-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                只读
              </span>
            </div>
            <div className="relative">
              <input
                id="targetLanguage"
                type="text"
                readOnly
                tabIndex={-1}
                value={`${currentMarket.languageName} (${currentMarket.language})`}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2.5 text-sm font-medium text-slate-700 select-none focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">随国家选择联动，确保语言代码严格规范</p>
          </div>
        </div>

        {/* 字段 4：原始营销文案（多行输入） */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sourceCopy" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              原始营销文案（中文） <span className="text-rose-500">*</span>
            </label>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-mono transition-colors ${getCounterStyle(
                sourceCopyLength,
                2000,
              )}`}
            >
              {sourceCopyLength.toLocaleString()} / 2,000
            </span>
          </div>

          <textarea
            id="sourceCopy"
            rows={6}
            required
            disabled={loading}
            value={formData.sourceCopy}
            onChange={handleInputChange('sourceCopy')}
            onBlur={handleBlur('sourceCopy')}
            placeholder="请输入中文营销推广文案。建议包含产品核心卖点、规格参数、使用场景或活动优惠（例如：轻巧便携，适合日常通勤。500ml 容量，售价 99 元）..."
            className={`w-full resize-y rounded-xl border p-3.5 text-sm leading-relaxed text-slate-900 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
              sourceCopyError
                ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500/10'
            }`}
          />

          {sourceCopyError ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 animate-in fade-in duration-200">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
              </svg>
              <span>{sourceCopyError}</span>
            </p>
          ) : (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>按 Unicode 码点标准计数</span>
              {isSourceCopyOverLimit && (
                <span className="font-semibold text-rose-600">已超出上限限制</span>
              )}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || isSourceCopyOverLimit || isProductNameOverLimit}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-500/35 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>AI 智能本地化生成中...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-indigo-200 transition group-hover:scale-110" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
                <span>开始 AI 本地化</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
