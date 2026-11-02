import { ApiError } from '../errors.js';

export function invalidModelResponse() {
  return new ApiError(502, 'INVALID_MODEL_RESPONSE', '生成结果格式异常，请重试。');
}

export function parseCompletion(completion) {
  if (!Array.isArray(completion?.choices)) throw invalidModelResponse();
  const choice = completion?.choices?.[0];
  const content = choice?.message?.content;
  if (choice?.finish_reason !== 'stop' || typeof content !== 'string' || !content.trim()) {
    throw invalidModelResponse();
  }

  let data;
  try {
    data = JSON.parse(content);
  } catch {
    throw invalidModelResponse();
  }

  const nonEmptyString = value => typeof value === 'string' && value.trim().length > 0;
  if (!data || typeof data !== 'object' || Array.isArray(data)
      || !nonEmptyString(data.localizedCopy) || !nonEmptyString(data.chineseTranslation)
      || !Array.isArray(data.culturalNotes) || data.culturalNotes.length < 2 || data.culturalNotes.length > 4
      || !data.culturalNotes.every(nonEmptyString)) {
    throw invalidModelResponse();
  }

  // Only expose the business fields, never provider metadata or extra model output.
  return {
    localizedCopy: data.localizedCopy.trim(),
    chineseTranslation: data.chineseTranslation.trim(),
    culturalNotes: data.culturalNotes.map(note => note.trim()),
  };
}
