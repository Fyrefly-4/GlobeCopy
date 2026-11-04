/**
 * API 调用封装
 * 严格遵循 docs/API_CONTRACT.md 约定
 */

import { validateModelSettings } from '../constants/providers.js';

export class ApiRequestError extends Error {
  constructor(message, code = 'REQUEST_ERROR', status = 0) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

/**
 * 调用本地化生成接口
 * @param {Object} params
 * @param {string} params.productName - 商品名称
 * @param {string} params.sourceCopy - 原始中文文案
 * @param {string} params.targetCountry - 目标国家代码 (US / JP / DE)
 * @param {string} params.targetLanguage - 对应语言代码 (en-US / ja-JP / de-DE)
 * @param {{provider: string, model: string, apiKey: string}} params.modelConfig - 本次请求的 BYOK 配置
 * @returns {Promise<{ localizedCopy: string, chineseTranslation: string, culturalNotes: string[] }>}
 */
export async function requestLocalization({
  productName,
  sourceCopy,
  targetCountry,
  targetLanguage,
  modelConfig,
}) {
  const configError = validateModelSettings(modelConfig);
  if (configError) throw new ApiRequestError(configError, 'MODEL_CONFIG_INVALID', 400);
  let response;

  try {
    response = await fetch('/api/localize', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName: productName.trim(),
        sourceCopy: sourceCopy.trim(),
        targetCountry,
        targetLanguage,
        modelConfig: {
          provider: modelConfig.provider,
          model: modelConfig.model.trim(),
          apiKey: modelConfig.apiKey.trim(),
        },
      }),
    });
  } catch {
    throw new ApiRequestError(
      '无法连接到后端服务，请确认后端已启动（默认 http://127.0.0.1:3001）且网络连接正常。',
      'NETWORK_ERROR',
      0,
    );
  }

  let body;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    if (body && body.error && typeof body.error.message === 'string') {
      throw new ApiRequestError(body.error.message, body.error.code || 'API_ERROR', response.status);
    }

    if (response.status === 404) {
      throw new ApiRequestError('请求的接口不存在，请检查后端路由。', 'NOT_FOUND', 404);
    }
    if (response.status === 504) {
      throw new ApiRequestError('生成超时，请稍后重试。', 'UPSTREAM_TIMEOUT', 504);
    }
    if (response.status === 503) {
      throw new ApiRequestError('模型服务暂不可用，请稍后重试。', 'SERVICE_NOT_CONFIGURED', 503);
    }

    throw new ApiRequestError(
      `服务返回异常状态 (${response.status})，请稍后重试。`,
      'UPSTREAM_ERROR',
      response.status,
    );
  }

  if (
    !body ||
    !body.data ||
    typeof body.data.localizedCopy !== 'string' ||
    !body.data.localizedCopy.trim() ||
    typeof body.data.chineseTranslation !== 'string' ||
    !body.data.chineseTranslation.trim() ||
    !Array.isArray(body.data.culturalNotes) ||
    body.data.culturalNotes.length < 2 || body.data.culturalNotes.length > 4 ||
    !body.data.culturalNotes.every(note => typeof note === 'string' && note.trim())
  ) {
    throw new ApiRequestError(
      '服务返回的数据结构异常，请稍后重试。',
      'INVALID_MODEL_RESPONSE',
      response.status,
    );
  }

  return body.data;
}

/**
 * 健康检查接口
 */
export async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const json = await res.json();
    return json?.data?.status === 'ok';
  } catch {
    return false;
  }
}
