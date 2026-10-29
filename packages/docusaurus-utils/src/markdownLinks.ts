/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {getContentPathList} from './dataFileUtils';
import {aliasedSitePath} from './pathUtils';

/**
 * Content plugins have a base path and a localized path to source content from.
 * We will look into the localized path in priority.
 */
export type ContentPaths = {
  /**
   * The absolute path to the base content directory, like `"<siteDir>/docs"`.
   */
  contentPath: string;
  /**
   * The absolute path to the localized content directory, like
   * `"<siteDir>/i18n/zh-Hans/plugin-content-blog"`.
   *
   * Undefined when the locale has `translate: false` config
   */
  contentPathLocalized: string | undefined;
};

export type SourceToPermalink = Map<
  string, // Aliased source path: "@site/docs/content.mdx"
  string // Permalink: "/docs/content"
>;

export function resolveMarkdownLinkPathname(
  linkPathname: string,
  context: {
    sourceFilePath: string;
    sourceToPermalink: SourceToPermalink;
    contentPaths: ContentPaths;
    siteDir: string;
  },
): string | null {
  const {sourceFilePath, sourceToPermalink, contentPaths, siteDir} = context;

  // If the link is already @site aliased, there's no need to resolve it
  if (linkPathname.startsWith('@site/')) {
    return sourceToPermalink.get(decodeURIComponent(linkPathname)) ?? null;
  }

  // Get the dirs to "look into", ordered by priority, when resolving the link
  function getSourceDirsToTry() {
    // /file.md is always resolved from
    // - the plugin content paths,
    // - then siteDir
    if (linkPathname.startsWith('/')) {
      return [...getContentPathList(contentPaths), siteDir];
    }
    // ./file.md and ../file.md are always resolved from
    // - the current file dir
    else if (linkPathname.startsWith('./') || linkPathname.startsWith('../')) {
      return [path.dirname(sourceFilePath)];
    }
    // file.md is resolved from
    // - the current file dir,
    // - then from the plugin content paths,
    // - then siteDir
    else {
      return [
        path.dirname(sourceFilePath),
        ...getContentPathList(contentPaths),
        siteDir,
      ];
    }
  }

  const sourcesToTry = getSourceDirsToTry()
    .map((sourceDir) => path.join(sourceDir, decodeURIComponent(linkPathname)))
    .map((source) => aliasedSitePath(source, siteDir));

  const aliasedSourceMatch = sourcesToTry.find((source) =>
    sourceToPermalink.has(source),
  );

  return aliasedSourceMatch
    ? (sourceToPermalink.get(aliasedSourceMatch) ?? null)
    : null;
}
