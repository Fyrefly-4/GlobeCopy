import { useState } from 'react';
import Header from './components/Header.jsx';
import CopyInputForm from './components/CopyInputForm.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import { DEFAULT_MARKET_CODE, MARKETS, SAMPLE_RESULT } from './constants/markets.js';

export default function App() {
  const [formData, setFormData] = useState({
    productName: '',
    sourceCopy: '',
    targetCountry: DEFAULT_MARKET_CODE,
    targetLanguage: MARKETS[DEFAULT_MARKET_CODE].language,
  });

  const [result, setResult] = useState(SAMPLE_RESULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApplySample = () => {
    const market = MARKETS[formData.targetCountry] || MARKETS.US;
    setFormData((prev) => ({
      ...prev,
      productName: market.sample.productName,
      sourceCopy: market.sample.sourceCopy,
    }));
    setResult(SAMPLE_RESULT);
    setError(null);
  };

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 布局检查阶段使用样例数据验证
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setResult(SAMPLE_RESULT);
      setLoading(false);
    }, 400);
  };

  const currentMarket = MARKETS[formData.targetCountry] || MARKETS.US;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              跨文化营销文案控制台
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              将中文营销文案精准转化为符合目标市场文化语境的宣传短文案，并提供对照与文化说明
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-4"
            >
              清空结果
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setResult(SAMPLE_RESULT)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              展示样例布局
            </button>
          </div>
        </div>

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
