/**
 * 输入字段前端校验工具
 * 与后端 input.js 采用一致的 Unicode 码点与空白字符口径
 */

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
