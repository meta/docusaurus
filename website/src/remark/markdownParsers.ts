/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {MarkdownParser} from '@docusaurus/types';

// The Markdown parsers that the website can use, DOCUSAURUS_MARKDOWN_PARSER
// picks one, admin/scripts/benchmarkMarkdownParsers.ts compares them
// micromark is remark-parse, the default parser of Docusaurus
export const MarkdownParsers: {[name: string]: MarkdownParser | undefined} = {
  micromark: undefined,
};

const DefaultMarkdownParser = 'micromark';

export function getMarkdownParser(): MarkdownParser | undefined {
  const name = process.env.DOCUSAURUS_MARKDOWN_PARSER ?? DefaultMarkdownParser;
  if (!(name in MarkdownParsers)) {
    throw new Error(
      `Unknown DOCUSAURUS_MARKDOWN_PARSER=${name}, expected one of: ${Object.keys(MarkdownParsers).join(', ')}`,
    );
  }
  return MarkdownParsers[name];
}
