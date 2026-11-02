import { ApiError } from '../errors.js';
import { validateInput } from './input.js';
import { buildMessages } from './prompt.js';
import { invalidModelResponse, parseCompletion } from './response.js';

function endpointFor(config) {
  try {
    const url = new URL(config.baseUrl);
    if (!config.apiKey || !config.model || !['https:', 'http:'].includes(url.protocol)
        || url.username || url.password || url.search || url.hash
        || !Number.isInteger(config.timeoutMs) || config.timeoutMs < 1 || config.timeoutMs > 2147483647) {
      throw new Error('Invalid configuration');
    }
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/chat/completions`;
    return url;
  } catch {
    throw new ApiError(503, 'SERVICE_NOT_CONFIGURED', '模型服务未正确配置，请检查后端配置。');
  }
}

// A single Chat Completions adapter; no provider-specific fields or SDK required.
export function createLocalizer(config, { fetchImpl = globalThis.fetch } = {}) {
  return async function localize(rawInput) {
    const input = validateInput(rawInput);
    const endpoint = endpointFor(config);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        redirect: 'error',
        signal: controller.signal,
        body: JSON.stringify({
          model: config.model,
          messages: buildMessages(input),
          stream: false,
          response_format: { type: 'json_object' },
          max_tokens: 8192,
        }),
      });

      if (!response.ok) {
        await response.body?.cancel();
        throw new ApiError(502, 'UPSTREAM_ERROR', '模型服务调用失败，请检查服务状态或配置后重试。');
      }

      let completion;
      try {
        completion = await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw error;
        throw invalidModelResponse();
      }
      return parseCompletion(completion);
    } catch (error) {
      if (controller.signal.aborted) {
        throw new ApiError(504, 'UPSTREAM_TIMEOUT', '生成超时，请稍后重试。');
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, 'UPSTREAM_ERROR', '模型服务调用失败，请检查服务状态或配置后重试。');
    } finally {
      clearTimeout(timer);
    }
  };
}
