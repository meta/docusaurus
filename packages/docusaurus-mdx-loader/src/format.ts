/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import type {MDXFrontMatter} from './frontMatter';
import type {Format, FormatInput} from './index';

// Copied from https://mdxjs.com/packages/mdx/#optionsmdextensions
// Although we are likely to only use .md / .mdx anyway...
const mdFormatExtensions = [
  '.md',
  '.markdown',
  '.mdown',
  '.mkdn',
  '.mkd',
  '.mdwn',
  '.mkdown',
  '.ron',
];

function getExtensionFormat(filepath: string): Format {
  const isMDFormat = mdFormatExtensions.includes(path.extname(filepath));
  // Bias toward mdx if unknown extension
  return isMDFormat ? 'md' : 'mdx';
}

export function getFormat({
  filePath,
  frontMatterFormat,
  markdownConfigFormat,
}: {
  filePath: string;
  frontMatterFormat: MDXFrontMatter['format'];
  markdownConfigFormat: FormatInput;
}): Format {
  if (frontMatterFormat) {
    if (frontMatterFormat !== 'detect') {
      return frontMatterFormat;
    }
    return getExtensionFormat(filePath);
  }
  if (markdownConfigFormat !== 'detect') {
    return markdownConfigFormat;
  }
  return getExtensionFormat(filePath);
}
