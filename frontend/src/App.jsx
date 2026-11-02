import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import CopyInputForm from './components/CopyInputForm.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import { DEFAULT_MARKET_CODE, MARKETS, SAMPLE_RESULT } from './constants/markets.js';
import { validateField } from './utils/validation.js';
import { requestLocalization } from './services/api.js';

export default function App() {
  const [formData, setFormData] = useState({
    productName: '',
    sourceCopy: '',
    targetCountry: DEFAULT_MARKET_CODE,
    targetLanguage: MARKETS[DEFAULT_MARKET_CODE].language,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 填入当前所选市场的官方测试样例
  const handleApplySample = useCallback(() => {
    const market = MARKETS[formData.targetCountry] || MARKETS.US;
    setFormData((prev) => ({
      ...prev,
      productName: market.sample.productName,
      sourceCopy: market.sample.sourceCopy,
    }));
    setFieldErrors({});
    setError(null);
  }, [formData.targetCountry]);

  // 表单变更
  const handleFormChange = useCallback((newFormData) => {
    setFormData(newFormData);
    // 生成完成后再次编辑输入时，清除旧结果并恢复待生成状态（PRD 4.4 约定）
    if (result) {
      setResult(null);
    }
    if (error) {
      setError(null);
    }
  }, [result, error]);

  const handleClearFieldError = useCallback((field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // 提交本地化生成
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (loading) return;

    // 前端严格校验（必填、纯空白及长度上限）
    const pErr = validateField('productName', formData.productName);
    const sErr = validateField('sourceCopy', formData.sourceCopy);

    if (pErr || sErr) {
      setFieldErrors({
        productName: pErr,
        sourceCopy: sErr,
      });
      return;
    }

    setFieldErrors({});
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await requestLocalization({
        productName: formData.productName.trim(),
        sourceCopy: formData.sourceCopy.trim(),
        targetCountry: formData.targetCountry,
        targetLanguage: formData.targetLanguage,
      });
      setResult(data);
    } catch (err) {
      // 失败时完整保留用户已输入内容，展现面向用户的清晰错误提示
      setError({
        code: err.code || 'REQUEST_FAILED',
        message: err.message || '请求未能完成，请稍后重试。',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const currentMarket = MARKETS[formData.targetCountry] || MARKETS.US;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 顶部标题区 */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              跨文化营销文案控制台
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              将中文营销文案精准转换为符合目标市场语言习惯与文化语境的宣传短文案，并提供中文对照与文化说明
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {result ? (
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition underline underline-offset-4"
              >
                清空结果
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setResult(SAMPLE_RESULT);
                  setError(null);
                  setFieldErrors({});
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                <span>预览排版样例</span>
                <span className="text-[10px] text-indigo-400">↗</span>
              </button>
            )}
          </div>
        </div>

        {/* 错误提示横幅（支持重试与保留输入） */}
        <ErrorBanner
          error={error}
          onRetry={handleSubmit}
          onDismiss={handleDismissError}
          loading={loading}
        />

        {/* 核心双栏布局 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* 左栏：输入表单 */}
          <div className="lg:col-span-5">
            <CopyInputForm
              formData={formData}
              onChange={handleFormChange}
              onApplySample={handleApplySample}
              onSubmit={handleSubmit}
              loading={loading}
              fieldErrors={fieldErrors}
              onClearFieldError={handleClearFieldError}
            />
          </div>

          {/* 右栏：结果展示 */}
          <div className="lg:col-span-7">
            <ResultDisplay
              result={result}
              market={currentMarket}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
