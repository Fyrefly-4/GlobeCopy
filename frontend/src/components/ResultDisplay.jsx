export default function ResultDisplay({
  result,
  market,
  loading = false,
  error = null,
  onReset,
}) {
  if (loading) {
    return (
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 p-8 text-center">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100/80 text-indigo-600 shadow-inner">
          <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800">大模型正在进行跨文化营销本地化</h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
          正在分析目标市场的语言习惯、事实保留与营销文化语境，这通常需要数秒钟...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/40 p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-rose-900">生成未能完成</h3>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-rose-700">
          {error.message || '模型服务调用异常，请检查配置或稍后重试。'}
        </p>
        {error.code && (
          <span className="mt-2 inline-block rounded-md bg-rose-100/80 px-2 py-0.5 font-mono text-[11px] text-rose-800">
            错误代码：{error.code}
          </span>
        )}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/60 shadow-sm">
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

  return (
    <div className="space-y-5">
      {/* 市场概览横幅 */}
      <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{market?.flag || '🌐'}</span>
          <span className="text-xs font-semibold text-indigo-950">
            {market?.country || '目标市场'} · {market?.languageName}
          </span>
          <span className="rounded bg-indigo-100/80 px-1.5 py-0.2 text-[10px] font-mono text-indigo-700">
            {market?.language}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">已生成 1 版方案</span>
      </div>

      {/* 区域 1：本地化营销文案 */}
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
        </div>
        <div className="rounded-xl bg-slate-50/80 p-4 font-normal text-slate-900 leading-relaxed tracking-normal whitespace-pre-wrap break-words text-sm sm:text-base border border-slate-100/80">
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
        <div className="rounded-xl bg-slate-50/60 p-4 text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words border border-slate-100/80">
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
