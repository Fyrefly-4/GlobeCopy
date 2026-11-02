import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import CopyInputForm from './components/CopyInputForm.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import { DEFAULT_MARKET_CODE, MARKETS, SAMPLE_RESULT } from './constants/markets.js';
import { requestLocalization } from './services/api.js';

export default function App() {
  const [formData, setFormData] = useState({
    productName: '',
    sourceCopy: '',
    targetCountry: DEFAULT_MARKET_CODE,
    targetLanguage: MARKETS[DEFAULT_MARKET_CODE].language,
  });

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
    setError(null);
  }, [formData.targetCountry]);

  // 表单变更
  const handleFormChange = useCallback((newFormData) => {
    setFormData(newFormData);
    // 当存在旧结果或旧错误时，再次编辑输入即清除旧结果，恢复待生成状态
    if (result) {
      setResult(null);
    }
    if (error) {
      setError(null);
    }
  }, [result, error]);

  // 提交本地化生成
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const trimmedName = formData.productName.trim();
    const trimmedCopy = formData.sourceCopy.trim();

    // 基础输入长度校验（与后端口径保持一致）
    const nameLength = Array.from(trimmedName).length;
    if (!trimmedName || nameLength < 1 || nameLength > 100) {
      setError({
        code: 'VALIDATION_ERROR',
        message: '商品名称不能为空且须在 1～100 个字符之内。',
      });
      return;
    }

    const copyLength = Array.from(trimmedCopy).length;
    if (!trimmedCopy || copyLength < 1 || copyLength > 2000) {
      setError({
        code: 'VALIDATION_ERROR',
        message: '原始营销文案不能为空且须在 1～2,000 个字符之内。',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await requestLocalization({
        productName: trimmedName,
        sourceCopy: trimmedCopy,
        targetCountry: formData.targetCountry,
        targetLanguage: formData.targetLanguage,
      });
      setResult(data);
    } catch (err) {
      setError({
        code: err.code || 'REQUEST_FAILED',
        message: err.message || '请求处理失败，请稍后重试。',
      });
    } finally {
      setLoading(false);
    }
  };

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
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                <span>预览排版样例</span>
                <span className="text-[10px] text-indigo-400">↗</span>
              </button>
            )}
          </div>
        </div>

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
            />
          </div>

          {/* 右栏：结果展示 */}
          <div className="lg:col-span-7">
            <ResultDisplay
              result={result}
              market={currentMarket}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
