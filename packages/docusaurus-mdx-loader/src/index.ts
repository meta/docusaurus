/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';

import {mdxLoader} from './loader';

import type {TOCItem as TOCItemImported} from './remark/toc/types';

export {createMDXLoaderRule, createMDXLoaderItem} from './createMDXLoader';

export default mdxLoader;

export type TOCItem = TOCItemImported;

export type Format = 'md' | 'mdx';

export type FormatInput = Format | 'detect';

export type LoadedMDXContent<FrontMatter, Metadata, Assets = undefined> = {
  /** As verbatim declared in the MDX document. */
  readonly frontMatter: FrontMatter;
  /** As provided by the content plugin. */
  readonly metadata: Metadata;
  /** A list of TOC items (headings). */
  readonly toc: readonly TOCItem[];
  /** First h1 title before any content. */
  readonly contentTitle: string | undefined;
  /**
   * Usually image assets that may be collocated like `./img/thumbnail.png`.
   * The loader would also bundle these assets and the client should use these
   * in priority.
   */
  readonly assets: Assets;
  (): ReactNode;
};

export type {MDXPlugin} from './loader';
export type {MDXOptions} from './processor';
export type {Options} from './options';
