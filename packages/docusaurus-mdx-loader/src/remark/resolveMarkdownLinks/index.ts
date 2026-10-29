/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';
import {
  parseLocalURLPath,
  serializeURLPath,
  toMessageRelativeFilePath,
  type URLPath,
} from '@docusaurus/utils';
import logger from '@docusaurus/logger';

import {formatNodePositionExtraMessage} from '../utils';
import type {Plugin, Transformer} from 'unified';
import type {Definition, Link, Root} from 'mdast';
import type {
  MarkdownConfig,
  OnBrokenMarkdownLinksFunction,
} from '@docusaurus/types';

type ResolveMarkdownLinkParams = {
  /**
   * Absolute path to the source file containing this Markdown link.
   */
  sourceFilePath: string;
  /**
   * The Markdown link pathname to resolve, as found in the source file.
   * If the link is "./myFile.mdx?qs#hash", this will be "./myFile.mdx"
   */
  linkPathname: string;
};

export type ResolveMarkdownLink = (
  params: ResolveMarkdownLinkParams,
) => string | null;

export interface PluginOptions {
  resolveMarkdownLink: ResolveMarkdownLink;
  onBrokenMarkdownLinks: MarkdownConfig['hooks']['onBrokenMarkdownLinks'];
}

function asFunction(
  onBrokenMarkdownLinks: PluginOptions['onBrokenMarkdownLinks'],
): OnBrokenMarkdownLinksFunction {
  if (typeof onBrokenMarkdownLinks === 'string') {
    const extraHelp =
      onBrokenMarkdownLinks === 'throw'
        ? logger.interpolate`\nTo ignore this error, use the code=${'siteConfig.markdown.hooks.onBrokenMarkdownLinks'} option, or apply the code=${'pathname://'} protocol to the broken link URLs.`
        : '';
    return ({sourceFilePath, url: linkUrl, node}) => {
      const relativePath = toMessageRelativeFilePath(sourceFilePath);
      logger.report(
        onBrokenMarkdownLinks,
      )`Markdown link with URL code=${linkUrl} in source file path=${relativePath}${formatNodePositionExtraMessage(
        node,
      )} couldn't be resolved.
Make sure it references a local Markdown file that exists within the current plugin.${extraHelp}`;
    };
  } else {
    return (params) =>
      onBrokenMarkdownLinks({
        ...params,
        sourceFilePath: toMessageRelativeFilePath(params.sourceFilePath),
      });
  }
}

const HAS_MARKDOWN_EXTENSION = /\.mdx?$/i;

function parseMarkdownLinkURLPath(link: string): URLPath | null {
  const urlPath = parseLocalURLPath(link);

  // If it's not local, we don't resolve it even if it's a Markdown file
  // Example, we don't resolve https://github.com/project/README.md
  if (!urlPath) {
    return null;
  }

  // Ignore links without a Markdown file extension (ignoring qs/hash)
  if (!HAS_MARKDOWN_EXTENSION.test(urlPath.pathname)) {
    return null;
  }
  return urlPath;
}

/**
 * A remark plugin to extract the h1 heading found in Markdown files
 * This is exposed as "data.contentTitle" to the processed vfile
 * Also gives the ability to strip that content title (used for the blog plugin)
 */
// TODO merge this plugin with "transformLinks"
//  in general we'd want to avoid traversing multiple times the same AST
const plugin: Plugin<PluginOptions[], Root> = function plugin(
  options,
): Transformer<Root> {
  const {resolveMarkdownLink} = options;

  const onBrokenMarkdownLinks = asFunction(options.onBrokenMarkdownLinks);

  return (root, file) => {
    visit(root, ['link', 'definition'], (node) => {
      const link = node as unknown as Link | Definition;
      const linkURLPath = parseMarkdownLinkURLPath(link.url);
      if (!linkURLPath) {
        return;
      }

      const sourceFilePath = file.path;

      const permalink = resolveMarkdownLink({
        sourceFilePath,
        linkPathname: linkURLPath.pathname,
      });

      if (permalink) {
        // This reapplies the link ?qs#hash part to the resolved pathname
        link.url = serializeURLPath({
          ...linkURLPath,
          pathname: permalink,
        });
      } else {
        link.url =
          onBrokenMarkdownLinks({
            url: link.url,
            sourceFilePath,
            node: link,
          }) ?? link.url;
      }
    });
  };
};

export default plugin;
