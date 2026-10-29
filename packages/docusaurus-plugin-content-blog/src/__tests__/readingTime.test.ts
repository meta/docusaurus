/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {calculateReadingTime} from '../readingTime';

describe('calculateReadingTime', () => {
  it('calculates reading time for empty content', () => {
    expect(calculateReadingTime('', 'en')).toBe(0);
  });

  it('calculates reading time for short content', () => {
    const content = 'This is a short test content.';
    expect(calculateReadingTime(content, 'en')).toBe(0.03);
  });

  it('calculates reading time for long content', () => {
    const content = 'This is a test content. '.repeat(100);
    expect(calculateReadingTime(content, 'en')).toBe(2.5);
  });

  it('respects custom words per minute', () => {
    const content = 'This is a test content. '.repeat(100);
    expect(calculateReadingTime(content, 'en', {wordsPerMinute: 100})).toBe(5);
  });

  it('handles content with special characters', () => {
    const content = 'Hello! How are you? This is a test...';
    expect(calculateReadingTime(content, 'en')).toBe(0.04);
  });

  it('handles content with multiple lines', () => {
    const content = `This is line 1.\n    This is line 2.\n    This is line 3.`;
    expect(calculateReadingTime(content, 'en')).toBe(0.06);
  });

  it('handles content with HTML tags', () => {
    const content = '<p>This is a <strong>test</strong> content.</p>';
    expect(calculateReadingTime(content, 'en')).toBe(0.05);
  });

  it('handles content with markdown', () => {
    const content = '# Title\n\nThis is **bold** and *italic* text.';
    expect(calculateReadingTime(content, 'en')).toBe(0.04);
  });

  it('handles CJK content', () => {
    const content = '你好，世界！这是一段测试内容。';
    expect(calculateReadingTime(content, 'zh')).toBe(0.04);
  });
});
