/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createProcessor as createMdxProcessor} from '@mdx-js/mdx';
import frontmatter from 'remark-frontmatter';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
// TODO using fork until PR merged: https://github.com/leebyron/remark-comment/pull/3
import remarkComment from '@slorber/remark-comment';
import directive from 'remark-directive';
import remarkMdx from 'remark-mdx';
import {VFile} from 'vfile';
import emoji from 'remark-emoji';
import headings from './remark/headings';
import contentTitle from './remark/contentTitle';
import toc from './remark/toc';
import transformImage from './remark/transformImage';
import transformLinks from './remark/transformLinks';
import resolveMarkdownLinks from './remark/resolveMarkdownLinks';
import details from './remark/details';
import head from './remark/head';
import mermaid from './remark/mermaid';
import transformAdmonitions from './remark/admonitions';
import admonitionTitle from './rehype/admonitionTitle';
import unusedDirectives from './remark/unusedDirectives';
import codeCompatPlugin from './remark/mdx1Compat/codeCompatPlugin';
import {getFormat} from './format';
import type {WebpackCompilerName} from '@docusaurus/utils';
import type {MDXFrontMatter} from './frontMatter';
import type {Options} from './options';
import type {AdmonitionOptions} from './remark/admonitions';
import type {PluginOptions as ResolveMarkdownLinksOptions} from './remark/resolveMarkdownLinks';
import type {PluginOptions as TransformLinksOptions} from './remark/transformLinks';
import type {PluginOptions as TransformImageOptions} from './remark/transformImage';
import type {PluginOptions as UnusedDirectivesOptions} from './remark/unusedDirectives';
import type {ProcessorOptions} from '@mdx-js/mdx';
import type {Options as RemarkMdxOptions} from 'remark-mdx';
import type {Pluggable} from 'unified';

export type SimpleProcessorResult = {
  content: string;
  data: {[key: string]: unknown};
};

export type SimpleProcessor = {
  process: ({
    content,
    filePath,
    frontMatter,
    compilerName,
  }: {
    content: string;
    filePath: string;
    frontMatter: {[key: string]: unknown};
    compilerName: WebpackCompilerName;
  }) => Promise<SimpleProcessorResult>;
};

export type MDXPlugin = Pluggable;

// MDX defaults to ES2024, we opt-in for ES2025 syntax (import attributes...)
const DefaultRemarkMdxOptions: RemarkMdxOptions = {
  acornOptions: {ecmaVersion: 2025, sourceType: 'module'},
};

export type MDXOptions = {
  admonitions: boolean | Partial<AdmonitionOptions>;
  remarkPlugins: MDXPlugin[];
  rehypePlugins: MDXPlugin[];
  recmaPlugins: MDXPlugin[];
  beforeDefaultRemarkPlugins: MDXPlugin[];
  beforeDefaultRehypePlugins: MDXPlugin[];
};

function getAdmonitionsPlugins(
  admonitionsOption: MDXOptions['admonitions'],
): MDXPlugin[] {
  if (admonitionsOption) {
    const plugin: MDXPlugin =
      admonitionsOption === true
        ? transformAdmonitions
        : [transformAdmonitions, admonitionsOption];
    return [plugin];
  }

  return [];
}

function getDefaultRemarkPlugins({options}: {options: Options}): MDXPlugin[] {
  return [
    [
      headings,
      {anchorsMaintainCase: options.markdownConfig.anchors.maintainCase},
    ],
    ...(options.markdownConfig.emoji ? [emoji] : []),
    toc,
  ];
}

// MDX's createProcessor() registers remark-mdx without options
// See https://github.com/mdx-js/mdx/issues/2628
// unified dedupes plugins by reference: using remark-mdx again reconfigures
// the existing attacher in place, at its original pipeline position
// This only applies to the 'mdx' format: we must not add remark-mdx for 'md'
function getRemarkMdxPlugins({
  options,
  format,
}: {
  options: Options;
  format: 'md' | 'mdx';
}): MDXPlugin[] {
  if (format === 'md') {
    return [];
  }
  return [[remarkMdx, options.remarkMdxOptions ?? DefaultRemarkMdxOptions]];
}

// /!\ this method is synchronous on purpose
// Using async code here can create cache entry race conditions!
function createProcessorUncached({
  options,
  format,
}: {
  options: Options;
  format: 'md' | 'mdx';
}): SimpleProcessor {
  const remarkPlugins: MDXPlugin[] = [
    ...getRemarkMdxPlugins({options, format}),
    ...(options.beforeDefaultRemarkPlugins ?? []),
    frontmatter,
    directive,
    [contentTitle, {removeContentTitle: options.removeContentTitle}],
    ...getAdmonitionsPlugins(options.admonitions ?? false),
    ...getDefaultRemarkPlugins({options}),
    details,
    head,
    ...(options.markdownConfig.mermaid ? [mermaid] : []),
    [
      transformImage,
      {
        staticDirs: options.staticDirs,
        siteDir: options.siteDir,
        onBrokenMarkdownImages:
          options.markdownConfig.hooks.onBrokenMarkdownImages,
      } satisfies TransformImageOptions,
    ],
    // TODO merge this with transformLinks?
    options.resolveMarkdownLink || options.resolveSiteMarkdownLink
      ? [
          resolveMarkdownLinks,
          {
            resolveMarkdownLink: options.resolveMarkdownLink,
            resolveSiteMarkdownLink: options.resolveSiteMarkdownLink,
            onBrokenMarkdownLinks:
              options.markdownConfig.hooks.onBrokenMarkdownLinks,
          } satisfies ResolveMarkdownLinksOptions,
        ]
      : undefined,
    [
      transformLinks,
      {
        staticDirs: options.staticDirs,
        siteDir: options.siteDir,
        onBrokenMarkdownLinks:
          options.markdownConfig.hooks.onBrokenMarkdownLinks,
      } satisfies TransformLinksOptions,
    ],
    gfm,
    options.markdownConfig.mdx1Compat.comments ? remarkComment : null,
    ...(options.remarkPlugins ?? []),
    [
      unusedDirectives,
      {
        onUnusedMarkdownDirectives:
          options.markdownConfig.hooks.onUnusedMarkdownDirectives,
      } satisfies UnusedDirectivesOptions,
    ],
  ].filter((plugin): plugin is MDXPlugin => Boolean(plugin));

  // codeCompatPlugin needs to be applied last after user-provided plugins
  // (after npm2yarn for example)
  remarkPlugins.push(codeCompatPlugin);

  const rehypePlugins: MDXPlugin[] = [
    ...(options.beforeDefaultRehypePlugins ?? []),
    ...(options.rehypePlugins ?? []),
    // Runs after user plugins, so that they can process admonition titles
    ...(options.admonitions ? [admonitionTitle] : []),
  ];

  // Maybe we'll want to introduce default recma plugins later?
  // For example https://github.com/domdomegg/recma-mdx-displayname ?
  const recmaPlugins = [...(options.recmaPlugins ?? [])];

  if (format === 'md') {
    // This is what permits to embed HTML elements with format 'md'
    // See https://github.com/facebook/docusaurus/pull/8960
    // See https://github.com/mdx-js/mdx/pull/2295#issuecomment-1540085960
    const rehypeRawPlugin: MDXPlugin = [
      rehypeRaw,
      {
        passThrough: [
          'mdxFlowExpression',
          'mdxJsxFlowElement',
          'mdxJsxTextElement',
          'mdxTextExpression',
          'mdxjsEsm',
        ],
      },
    ];
    rehypePlugins.unshift(rehypeRawPlugin);
  }

  const processorOptions: ProcessorOptions & Options = {
    ...options,
    remarkPlugins,
    rehypePlugins,
    recmaPlugins,
    providerImportSource: '@mdx-js/react',
  };

  const mdxProcessor = createMdxProcessor({
    ...processorOptions,
    remarkRehypeOptions: options.markdownConfig.remarkRehypeOptions,
    format,
  });

  return {
    process: async ({content, filePath, frontMatter, compilerName}) => {
      const vfile = new VFile({
        value: content,
        path: filePath,
        data: {
          frontMatter,
          compilerName,
        },
      });
      return mdxProcessor.process(vfile).then((result) => ({
        content: result.toString(),
        data: result.data,
      }));
    },
  };
}

// We use different compilers depending on the file type (md vs mdx)
export type SimpleProcessors = {
  mdProcessor: SimpleProcessor;
  mdxProcessor: SimpleProcessor;
};

// Compilers are cached so that Remark/Rehype plugins can run
// expensive code during initialization
const ProcessorsCache = new Map<string | Options, SimpleProcessors>();

export function createProcessors({
  options,
}: {
  options: Options;
}): SimpleProcessors {
  return {
    mdProcessor: createProcessorUncached({
      options,
      format: 'md',
    }),
    mdxProcessor: createProcessorUncached({
      options,
      format: 'mdx',
    }),
  };
}

function createProcessorsCacheEntry({
  options,
}: {
  options: Options;
}): SimpleProcessors {
  const compilers = ProcessorsCache.get(options);
  if (compilers) {
    return compilers;
  }
  const processors = createProcessors({options});
  ProcessorsCache.set(options, processors);
  return processors;
}

export function getProcessor({
  filePath,
  mdxFrontMatter,
  options,
}: {
  filePath: string;
  mdxFrontMatter: MDXFrontMatter;
  options: Options;
}): SimpleProcessor {
  const processors =
    options.processors ?? createProcessorsCacheEntry({options});

  const format = getFormat({
    filePath,
    frontMatterFormat: mdxFrontMatter.format,
    markdownConfigFormat: options.markdownConfig.format,
  });

  return format === 'md' ? processors.mdProcessor : processors.mdxProcessor;
}
