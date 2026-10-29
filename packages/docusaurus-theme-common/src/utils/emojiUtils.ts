/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const segmenter = new Intl.Segmenter(undefined, {granularity: 'grapheme'});

/**
 * This method splits "⚠️ Hello World" into "⚠️" + " Hello World".
 * It is quite strict and dumb, only useful to handle best-effort heuristics.
 * It only extracts a leading emoji if it is the first grapheme of the string.
 * It only extracts one emoji, even if multiples are present.
 * It doesn't trim the remaining string.
 * If you need something more clever, it should be built on top.
 * @param input
 */
export function extractLeadingEmoji(input: string): {
  emoji: string | null;
  rest: string;
} {
  const it = segmenter.segment(input)[Symbol.iterator]();

  const grapheme = it.next().value?.segment;

  if (!grapheme) {
    return {emoji: null, rest: input};
  }

  // Leading grapheme contains an emoji
  // Covers flags/ZWJ/skin tones, excludes digits
  // See https://github.com/facebook/docusaurus/pull/12072
  if (!/^\p{RGI_Emoji}$/v.test(grapheme)) {
    return {emoji: null, rest: input};
  }

  return {emoji: grapheme, rest: input.slice(grapheme.length)};
}
