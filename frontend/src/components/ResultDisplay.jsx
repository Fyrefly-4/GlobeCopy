import { useState, useRef, useEffect } from 'react';

const LOADING_TIPS = [
  '正在分析目标市场的语言习惯与营销文化语境...',
  '正在调整文案语气、句式结构与事实表达...',
  '正在生成忠实中文对照与文化适配理由...',
];

export default function ResultDisplay({
  result,
  market,
  loading = false,
  error = null,
}) {
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle' | 'copied' | 'error'
  const [tipIndex, setTipIndex] = useState(0);
  const localizedCopyRef = useRef(null);

  // 加载中轮播提示文案
  useEffect(() => {
    if (!loading) {
      setTipIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [loading]);

  // 复制本地化营销文案（仅复制纯文本，不包含标题、对照或说明）
  const handleCopy = async () => {
    if (!result?.localizedCopy) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.localizedCopy);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
        return;
      }
      throw new Error('Clipboard API not available');
    } catch {
      // 降级使用 document.execCommand
      try {
        const textarea = document.createElement('textarea');
        textarea.value = result.localizedCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) {
          setCopyStatus('copied');
          setTimeout(() => setCopyStatus('idle'), 2000);
          return;
        }
      } catch {
        // ignore
      }

      // 如果依然失败，提示手动复制并自动全选对应文本
      setCopyStatus('error');
      if (localizedCopyRef.current) {
        const range = document.createRange();
        range.selectNodeContents(localizedCopyRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setTimeout(() => setCopyStatus('idle'), 4000);
    }
  };

  // 1. 加载态：现代骨架屏与动态思考动效
  if (loading) {
    return (
      <div className="space-y-5 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        {/* 顶部加载状态提示 */}
        <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-950">AI 本地化引擎运算中</p>
              <p className="text-[11px] text-indigo-700/80 transition-all duration-300">
                {LOADING_TIPS[tipIndex]}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
            {market?.flag} {market?.country} · {market?.languageName}
          </span>
        </div>

        {/* 骨架屏：三部分卡片占位 */}
        <div className="space-y-4 animate-pulse">
          {/* 卡片 1 骨架 */}
          <div className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-7 w-20 rounded-lg bg-slate-200" />
            </div>
            <div className="space-y-2.5">
              <div className="h-3.5 w-full rounded bg-slate-200" />
              <div className="h-3.5 w-5/6 rounded bg-slate-200" />
              <div className="h-3.5 w-3/4 rounded bg-slate-200" />
            </div>
          </div>

          {/* 卡片 2 骨架 */}
          <div className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50">
            <div className="h-4 w-24 rounded bg-slate-200 mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-11/12 rounded bg-slate-200" />
              <div className="h-3 w-4/5 rounded bg-slate-200" />
            </div>
          </div>

          {/* 卡片 3 骨架 */}
          <div className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50">
            <div className="h-4 w-32 rounded bg-slate-200 mb-3" />
            <div className="space-y-2">
              <div className="h-10 w-full rounded-lg bg-slate-200/70" />
              <div className="h-10 w-full rounded-lg bg-slate-200/70" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 初始空状态
  if (!result) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50/80 text-indigo-600 ring-1 ring-indigo-200/60 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800">生成结果展示区</h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
          在左侧填写商品名称与中文营销文案，并选择目标市场，点击「开始 AI 本地化」后在此处查看三部分结构化输出。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1">① 本地化营销文案</span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1">② 中文对照</span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1">③ 文化适配说明</span>
        </div>
      </div>
    );
  }

  // 3. 成功展示三部分结构化卡片
  return (
    <div className="space-y-5">
      {/* 市场概览横幅 */}
      <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{market?.flag || '🌐'}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-indigo-950">
                {market?.country || '目标市场'} · {market?.languageName}
              </span>
              <span className="rounded bg-indigo-100/90 px-1.5 py-0.2 font-mono text-[10px] text-indigo-700">
                {market?.language}
              </span>
            </div>
            <p className="text-[10px] text-indigo-700/70">{market?.currencyNote}</p>
          </div>
        </div>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
          ✓ 生成成功
        </span>
      </div>

      {/* 区域 1：本地化营销文案（带一键复制） */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white shadow-sm">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900">本地化营销文案</h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
              目标语言
            </span>
          </div>

          {/* 复制纯文本按钮 */}
          <div>
            {copyStatus === 'copied' ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 transition"
              >
                <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>已复制到剪贴板</span>
              </button>
            ) : copyStatus === 'error' ? (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/20 transition"
              >
                <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
                </svg>
                <span>复制失败，已全选请 Ctrl+C</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 active:scale-95"
                title="仅复制本地化文案纯文本"
              >
                <svg className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                <span>复制文案</span>
              </button>
            )}
          </div>
        </div>

        <div
          ref={localizedCopyRef}
          className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm font-normal leading-relaxed tracking-normal text-slate-900 whitespace-pre-wrap break-words sm:text-base selection:bg-indigo-500 selection:text-white"
        >
          {result.localizedCopy}
        </div>
      </div>

      {/* 区域 2：中文对照 */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white shadow-sm">
            2
          </span>
          <h3 className="text-sm font-bold text-slate-900">中文对照</h3>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            忠实释义
          </span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap break-words sm:text-sm">
          {result.chineseTranslation}
        </div>
      </div>

      {/* 区域 3：文化适配说明 */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-white shadow-sm">
            3
          </span>
          <h3 className="text-sm font-bold text-slate-900">文化适配说明</h3>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            {result.culturalNotes?.length || 0} 条适配理由
          </span>
        </div>
        <ul className="space-y-2.5">
          {result.culturalNotes?.map((note, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 rounded-xl border border-amber-100/60 bg-amber-50/40 p-3 text-xs leading-relaxed text-slate-800"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-900">
                {index + 1}
              </span>
              <span className="break-words">{note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* PRD 要求的 AI 内容审阅提醒 */}
      <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-center text-[11px] leading-relaxed text-slate-500">
        AI 生成内容，请在发布前核对商品事实及表达；本工具不提供专业广告合规审查。
      </div>
    </div>
  );
}
