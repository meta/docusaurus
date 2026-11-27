/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Replaces the satteri@0.11.7 types (see tsconfig.json paths): they redeclare
// the mdast types of mdast-util-mdx, which fails with skipLibCheck: false

import type {Root} from 'mdast';

type MdastTreeOptions = {
  features?: {
    gfm?: boolean;
    frontmatter?: boolean;
    directive?: boolean;
    math?: boolean;
  };
  position?: boolean;
};

export function markdownToMdast(
  source: string,
  options?: MdastTreeOptions,
): Root;
export function mdxToMdast(source: string, options?: MdastTreeOptions): Root;
