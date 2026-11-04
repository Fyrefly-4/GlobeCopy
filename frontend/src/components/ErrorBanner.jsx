export default function ErrorBanner({
  error,
  onRetry,
  onDismiss,
  loading = false,
}) {
  if (!error) return null;

  // 根据错误代码提供更贴心的排查建议
  const getTroubleshootAdvice = (code) => {
    switch (code) {
      case 'SERVICE_NOT_CONFIGURED':
        return '模型服务暂不可用，请稍后重试。';
      case 'MODEL_CONFIG_INVALID':
        return '请在页面上方填写供应商、模型 ID 和自己的 API Key。';
      case 'NETWORK_ERROR':
        return '请检查服务是否可用以及网络连接是否正常，输入内容会保留。';
      case 'UPSTREAM_TIMEOUT':
        return '模型服务处理耗时超过设定的时限，建议精简文案内容或检查当前网络延迟。';
      case 'UPSTREAM_ERROR':
        return '上游模型服务返回错误状态，请检查 API Key 余额或模型供应商可用状态。';
      case 'INVALID_MODEL_RESPONSE':
        return '模型未返回有效的结构化数据，可直接点击“重新尝试”发起再次生成。';
      default:
        return '您的输入内容已被完整保留，修改或确认配置后即可再次尝试。';
    }
  };

  return (
    <div role="alert" className="relative mb-6 overflow-hidden rounded-2xl border border-rose-200/90 bg-rose-50/70 p-4 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-xs">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-rose-950">本地化生成遇到异常</h3>
            {error.code && (
              <span className="rounded-md bg-rose-200/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-800">
                {error.code}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs font-medium leading-relaxed text-rose-900">
            {error.message || '生成失败，请稍后重试。'}
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-rose-700/90">
            💡 建议：{getTroubleshootAdvice(error.code)}
          </p>

          {/* 操作按钮组：重试与关闭 */}
          <div className="mt-3 flex items-center gap-2.5">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>重新尝试</span>
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg border border-rose-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-rose-800 transition hover:bg-white active:scale-95"
              >
                关闭提示
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-600 transition"
            title="关闭提示"
            aria-label="关闭提示"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
