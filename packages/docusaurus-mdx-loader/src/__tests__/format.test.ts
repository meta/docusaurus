/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getFormat} from '../format';

describe('getFormat', () => {
  it('uses frontMatter format over anything else', () => {
    expect(
      getFormat({
        frontMatterFormat: 'md',
        filePath: 'xyz.md',
        markdownConfigFormat: 'mdx',
      }),
    ).toBe('md');
    expect(
      getFormat({
        frontMatterFormat: 'md',
        filePath: 'xyz.mdx',
        markdownConfigFormat: 'mdx',
      }),
    ).toBe('md');
    expect(
      getFormat({
        frontMatterFormat: 'mdx',
        filePath: 'xyz.md',
        markdownConfigFormat: 'md',
      }),
    ).toBe('mdx');
    expect(
      getFormat({
        frontMatterFormat: 'mdx',
        filePath: 'xyz.mdx',
        markdownConfigFormat: 'md',
      }),
    ).toBe('mdx');
  });

  it('supports "detects" for front matter', () => {
    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'xyz.md',
        markdownConfigFormat: 'mdx',
      }),
    ).toBe('md');
    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'xyz.markdown',
        markdownConfigFormat: 'mdx',
      }),
    ).toBe('md');

    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'folder/xyz.md',
        markdownConfigFormat: 'mdx',
      }),
    ).toBe('md');
    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'folder/xyz.markdown',
        markdownConfigFormat: 'mdx',
      }),
    ).toBe('md');
    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'xyz.mdx',
        markdownConfigFormat: 'md',
      }),
    ).toBe('mdx');
    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'folder/xyz.mdx',
        markdownConfigFormat: 'md',
      }),
    ).toBe('mdx');

    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'xyz.unknown',
        markdownConfigFormat: 'md',
      }),
    ).toBe('mdx');
    expect(
      getFormat({
        frontMatterFormat: 'detect',
        filePath: 'folder/xyz.unknown',
        markdownConfigFormat: 'md',
      }),
    ).toBe('mdx');
  });

  it('fallbacks to markdown config format when front matter undefined', () => {
    expect(
      getFormat({
        frontMatterFormat: undefined,
        filePath: 'xyz.md',
        markdownConfigFormat: 'mdx',
      }),
    ).toBe('mdx');
    expect(
      getFormat({
        frontMatterFormat: undefined,
        filePath: 'xyz.mdx',
        markdownConfigFormat: 'md',
      }),
    ).toBe('md');

    expect(
      getFormat({
        frontMatterFormat: undefined,
        filePath: 'xyz.md',
        markdownConfigFormat: 'detect',
      }),
    ).toBe('md');
    expect(
      getFormat({
        frontMatterFormat: undefined,
        filePath: 'xyz.mdx',
        markdownConfigFormat: 'detect',
      }),
    ).toBe('mdx');
  });
});
