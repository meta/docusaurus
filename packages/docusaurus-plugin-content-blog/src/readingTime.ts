/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const DEFAULT_WORDS_PER_MINUTE = 200;

/**
 * Counts the number of words in a string using Intl.Segmenter.
 * @param content The text content to count words in.
 * @param locale The locale to use for segmentation.
 */
function countWords(content: string, locale: string): number {
  if (!content) {
    return 0;
  }
  const segmenter = new Intl.Segmenter(locale, {granularity: 'word'});
  let wordCount = 0;
  for (const {isWordLike} of segmenter.segment(content)) {
    if (isWordLike) {
      wordCount += 1;
    }
  }
  return wordCount;
}

/**
 * Calculates the reading time for a given content string using Intl.Segmenter.
 * @param content The text content to calculate reading time for.
 * @param locale Required locale string for Intl.Segmenter
 * @param options Options for reading time calculation.
 *   - wordsPerMinute: number of words per minute (default 200)
 * @returns Estimated reading time in minutes (float, rounded to 2 decimals)
 */
export function calculateReadingTime(
  content: string,
  locale: string,
  options?: {wordsPerMinute?: number},
): number {
  const wordsPerMinute = options?.wordsPerMinute ?? DEFAULT_WORDS_PER_MINUTE;
  const words = countWords(content, locale);
  if (words === 0) {
    return 0;
  }
  // Calculate reading time in minutes and round to 2 decimal places
  return Math.round((words / wordsPerMinute) * 100) / 100;
}
