/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {MDXOptions, SimpleProcessors} from './processor';
import type {MarkdownConfig} from '@docusaurus/types';
import type {ResolveMarkdownLink} from './remark/resolveMarkdownLinks';
import type {Options as RemarkMdxOptions} from 'remark-mdx';

export type Options = Partial<MDXOptions> & {
  dependencies?: string[];

  markdownConfig: MarkdownConfig;
  staticDirs: string[];
  siteDir: string;
  isMDXPartial?: (filePath: string) => boolean;
  isMDXPartialFrontMatterWarningDisabled?: boolean;
  removeContentTitle?: boolean;
  metadataPath?: (filePath: string) => string;
  createAssets?: (metadata: {
    filePath: string;
    frontMatter: {[key: string]: unknown};
  }) => {[key: string]: unknown};
  resolveMarkdownLink?: ResolveMarkdownLink;
  /**
   * Fallback used when `resolveMarkdownLink` can't resolve a Markdown link.
   * It looks at the Markdown files of the whole site, not just those of the
   * plugin owning the source file, and enables cross-plugin Markdown links.
   * See https://github.com/facebook/docusaurus/issues/9117
   */
  resolveSiteMarkdownLink?: ResolveMarkdownLink;
  // Options passed to remark-mdx (only for the 'mdx' format)
  // Replaces our default {acornOptions: {ecmaVersion: 2025, sourceType: 'module'}}
  remarkMdxOptions?: RemarkMdxOptions;

  // Will usually be created by "createMDXLoaderItem"
  processors?: SimpleProcessors;
  // We pass a getter function instead of the cache Map itself because some
  // tools deep-clone the loader options (Rsdoctor v1 for example)
  // Cloning a Map would break the cache shared by client/server compilers
  // Functions are not cloned, so the getter keeps returning the shared Map
  getCrossCompilerCache?: () => CrossCompilerCache;
};

// MDX => Promise<JSX> cache
export type CrossCompilerCache = Map<string, CrossCompilerCacheEntry>;

type CrossCompilerCacheEntry = PromiseWithResolvers<string>;
