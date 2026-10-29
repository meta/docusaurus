/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {extractLeadingEmoji} from '../emojiUtils';

describe('extractLeadingEmoji', () => {
  it('extracts simple leading emoji', () => {
    expect(extractLeadingEmoji('😀 Hello World')).toEqual({
      emoji: '😀',
      rest: ' Hello World',
    });
  });

  it('extracts only the first emoji', () => {
    expect(extractLeadingEmoji('😀😀 Hello World')).toEqual({
      emoji: '😀',
      rest: '😀 Hello World',
    });
  });

  it('extracts emoji with multiple code points - 🇫🇷', () => {
    expect(extractLeadingEmoji('🇫🇷 Hello World')).toEqual({
      emoji: '🇫🇷',
      rest: ' Hello World',
    });
  });

  it('extracts emoji with multiple code points - 👨‍👩‍👧‍👦', () => {
    expect(extractLeadingEmoji('👨‍👩‍👧‍👦 Hello World')).toEqual({
      emoji: '👨‍👩‍👧‍👦',
      rest: ' Hello World',
    });
  });

  it('preserves original string', () => {
    expect(extractLeadingEmoji('Hello World')).toEqual({
      emoji: null,
      rest: 'Hello World',
    });
  });

  it('preserves original string - leading emoji after space', () => {
    expect(extractLeadingEmoji(' 😀 Hello World')).toEqual({
      emoji: null,
      rest: ' 😀 Hello World',
    });
  });

  it('preserves original string - middle emoji', () => {
    expect(extractLeadingEmoji('Hello 😀 World')).toEqual({
      emoji: null,
      rest: 'Hello 😀 World',
    });
  });

  it('preserves original string - trailing emoji', () => {
    expect(extractLeadingEmoji('Hello World 😀')).toEqual({
      emoji: null,
      rest: 'Hello World 😀',
    });
  });

  it('does not extract single digit', () => {
    expect(extractLeadingEmoji('1 Hello World')).toEqual({
      emoji: null,
      rest: '1 Hello World',
    });
  });

  it('does not extract multiple digits', () => {
    expect(extractLeadingEmoji('11 Hello World')).toEqual({
      emoji: null,
      rest: '11 Hello World',
    });
  });

  it('extracts real keycap emoji (digit + VS16 + combining keycap)', () => {
    // 1️⃣ is digit "1" followed by U+FE0F (Variation Selector-16) and
    // U+20E3 (Combining Enclosing Keycap) — a multi-codepoint grapheme
    // that should still be detected as emoji
    expect(extractLeadingEmoji('1\u{FE0F}\u{20E3} Something')).toEqual({
      emoji: '1️⃣',
      rest: ' Something',
    });
  });

  it('extracts VS16 emoji - ⚠️ (text-default + variation selector)', () => {
    // ⚠ (U+26A0) has Emoji=true, Emoji_Presentation=false.  With VS16
    // (U+FE0F) it becomes a multi-codepoint grapheme that IS an emoji
    expect(extractLeadingEmoji('⚠\u{FE0F} Warning')).toEqual({
      emoji: '⚠\u{FE0F}',
      rest: ' Warning',
    });
  });

  it('does not detect text-presentation symbols - ©', () => {
    expect(extractLeadingEmoji('© 2026')).toEqual({
      emoji: null,
      rest: '© 2026',
    });
  });

  it('does detect ©️', () => {
    expect(extractLeadingEmoji('©️ 2026')).toEqual({
      emoji: '©️',
      rest: ' 2026',
    });
  });

  it('does not detect text-presentation symbols - ™', () => {
    expect(extractLeadingEmoji('™ Brand')).toEqual({
      emoji: null,
      rest: '™ Brand',
    });
  });

  it('does not detect text-presentation symbols - ♠', () => {
    expect(extractLeadingEmoji('♠ Cards')).toEqual({
      emoji: null,
      rest: '♠ Cards',
    });
  });
});
