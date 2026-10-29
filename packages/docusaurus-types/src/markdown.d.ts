/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ProcessorOptions} from '@mdx-js/mdx';
import type {Image, Definition, Link} from 'mdast';
import type {Directives} from 'mdast-util-directive';

import type {ReportingSeverity} from './reporting';

export type RemarkRehypeOptions = ProcessorOptions['remarkRehypeOptions'];

export type MarkdownPreprocessor = (args: {
  filePath: string;
  fileContent: string;
}) => string;

export type MDX1CompatOptions = {
  comments: boolean;
  admonitions: boolean;
  headingIds: boolean;
};

export type ParseFrontMatterParams = {filePath: string; fileContent: string};
export type ParseFrontMatterResult = {
  frontMatter: {[key: string]: unknown};
  content: string;
};
export type DefaultParseFrontMatter = (
  params: ParseFrontMatterParams,
) => Promise<ParseFrontMatterResult>;
export type ParseFrontMatter = (
  params: ParseFrontMatterParams & {
    defaultParseFrontMatter: DefaultParseFrontMatter;
  },
) => Promise<ParseFrontMatterResult>;

export type MarkdownAnchorsConfig = {
  /**
   * Preserves the case of the heading text when generating anchor ids.
   */
  maintainCase: boolean;
};

export type OnBrokenMarkdownLinksFunction = (params: {
  /**
   * Path of the source file on which the broken link was found
   * Relative to the site dir.
   * Example: "docs/category/myDoc.mdx"
   */
  sourceFilePath: string;

  /**
   * The Markdown link url that couldn't be resolved.
   * Technically, in this context, it's more a "relative file path", but let's
   * name it url for consistency with usual Markdown names and the MDX AST
   * Example: "relative/dir/myTargetDoc.mdx?query#hash"
   */
  url: string;
  /**
   * The Markdown Link AST node.
   */
  node: Link | Definition;
}) => void | string;

export type OnBrokenMarkdownImagesFunction = (params: {
  /**
   * Path of the source file on which the broken image was found
   * Relative to the site dir.
   * Example: "docs/category/myDoc.mdx"
   */
  sourceFilePath: string;

  /**
   * The Markdown image url that couldn't be resolved.
   * Technically, in this context, it's more a "relative file path", but let's
   * name it url for consistency with usual Markdown names and the MDX AST
   * Example: "relative/dir/myImage.png"
   */
  url: string;
  /**
   * The Markdown Image AST node.
   */
  node: Image;
}) => void | string;

export type OnUnusedMarkdownDirectivesFunction = (params: {
  /**
   * Path of the source file on which the unused directive was found
   * Relative to the site dir.
   * Example: "docs/category/myDoc.mdx"
   */
  sourceFilePath: string;

  /**
   * The Markdown directives that were unused.
   * Example: "myDirective"
   */
  directives: Directives[];
}) => void | string;

export type MarkdownHooks = {
  /**
   * The behavior of Docusaurus when it detects any broken Markdown link.
   *
   * // TODO refactor doc links!
   * @see https://docusaurus.io/docs/api/docusaurus-config#markdown
   * @default "warn"
   */
  onBrokenMarkdownLinks: ReportingSeverity | OnBrokenMarkdownLinksFunction;

  onBrokenMarkdownImages: ReportingSeverity | OnBrokenMarkdownImagesFunction;

  onUnusedMarkdownDirectives:
    | ReportingSeverity
    | OnUnusedMarkdownDirectivesFunction;
};

export type MarkdownConfig = {
  /**
   * The Markdown format to use by default.
   *
   * This is the format passed down to the MDX compiler, impacting the way the
   * content is parsed.
   *
   * Possible values:
   * - `'mdx'`: use the MDX format (JSX support)
   * - `'md'`: use the CommonMark format (no JSX support)
   * - `'detect'`: select the format based on file extension (.md / .mdx)
   *
   * @see https://mdxjs.com/packages/mdx/#optionsformat
   * @default 'mdx'
   */
  format: 'mdx' | 'md' | 'detect';

  /**
   * A function callback that lets users parse the front matter themselves.
   * Gives the opportunity to read it from a different source, or process it.
   *
   * @see https://github.com/facebook/docusaurus/issues/5568
   */
  parseFrontMatter: ParseFrontMatter;

  /**
   * Allow mermaid language code blocks to be rendered into Mermaid diagrams:
   *
   * - `true`: code blocks with language mermaid will be rendered.
   * - `false` | `undefined` (default): code blocks with language mermaid
   * will be left as code blocks.
   *
   * @see https://docusaurus.io/docs/markdown-features/diagrams/
   * @default false
   */
  mermaid: boolean;

  /**
   * Allow remark-emoji to convert emoji shortcodes to Unicode emoji.
   * - `true` (default): enables the remark-emoji plugin to convert shortcodes
   * - `false`: disables the remark-emoji plugin
   *
   * @see https://github.com/rhysd/remark-emoji
   * @default true
   */
  emoji: boolean;

  /**
   * Gives opportunity to preprocess the MDX string content before compiling.
   * A good escape hatch that can be used to handle edge cases.
   *
   * @param args
   */
  preprocessor?: MarkdownPreprocessor;

  /**
   * Set of flags make it easier to upgrade from MDX 1 to MDX 2
   * See also https://github.com/facebook/docusaurus/issues/4029
   */
  mdx1Compat: MDX1CompatOptions;

  /**
   * Ability to provide custom remark-rehype options
   * See also https://github.com/remarkjs/remark-rehype#options
   */
  remarkRehypeOptions: RemarkRehypeOptions;

  /**
   * Options to control the behavior of anchors generated from Markdown headings
   */
  anchors: MarkdownAnchorsConfig;

  hooks: MarkdownHooks;
};
