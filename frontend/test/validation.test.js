import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateField } from '../src/utils/validation.js';

describe('frontend field validation', () => {
  it('rejects empty or whitespace-only product name', () => {
    assert.match(validateField('productName', ''), /不可仅包含空白字符/);
    assert.match(validateField('productName', '   \t\n  '), /不可仅包含空白字符/);
  });

  it('validates product name Unicode boundary length', () => {
    assert.equal(validateField('productName', 'a'.repeat(100)), '');
    assert.match(validateField('productName', 'a'.repeat(101)), /已超出上限/);

    // Unicode 码点测试（如 emoji 或多字节字符）
    const emoji100 = '🎯'.repeat(100);
    assert.equal(Array.from(emoji100).length, 100);
    assert.equal(validateField('productName', emoji100), '');

    const emoji101 = '🎯'.repeat(101);
    assert.match(validateField('productName', emoji101), /已超出上限/);
  });

  it('rejects empty or whitespace-only source copy', () => {
    assert.match(validateField('sourceCopy', ''), /不可仅包含空白字符/);
    assert.match(validateField('sourceCopy', '   \r\n  '), /不可仅包含空白字符/);
  });

  it('validates source copy Unicode boundary length', () => {
    assert.equal(validateField('sourceCopy', '测'.repeat(2000)), '');
    assert.match(validateField('sourceCopy', '测'.repeat(2001)), /已超出最大长度限制/);
  });
});
