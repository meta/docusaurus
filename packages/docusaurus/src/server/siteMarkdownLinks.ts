/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {flattenRoutes, resolveMarkdownLinkPathname} from '@docusaurus/utils';
import type {SourceToPermalink} from '@docusaurus/utils';
import type {RouteConfig, SiteMarkdownLinks} from '@docusaurus/types';

const MarkdownExtensionRegex = /\.mdx?$/i;

/**
 * Creates the site-wide Markdown files registry.
 *
 * The returned object is mutable, and its identity is stable on purpose: the
 * content plugins hand it over to the MDX loader in `configureWebpack()`, which
 * only runs once, while the registry content is refreshed on every site reload.
 * See `updateSiteMarkdownLinks()`.
 */
export function createSiteMarkdownLinks({
  siteDir,
}: {
  siteDir: string;
}): SiteMarkdownLinks {
  const sourceToPermalink: SourceToPermalink = new Map();

  return {
    sourceToPermalink,
    resolveMarkdownLink: ({sourceFilePath, linkPathname}) =>
      resolveMarkdownLinkPathname(linkPathname, {
        sourceFilePath,
        sourceToPermalink,
        siteDir,
        // The site-wide registry is not scoped to any plugin content dir:
        // relative/absolute links are resolved against the site dir.
        contentPaths: {contentPath: siteDir, contentPathLocalized: undefined},
      }),
  };
}

/**
 * Refreshes the site-wide Markdown files registry from the site routes.
 *
 * Content plugins already attach the `sourceFilePath` of the Markdown file a
 * route was created from (see `RouteMetadata`), so we don't need any extra
 * plugin lifecycle to collect the Markdown files of the whole site.
 */
export function updateSiteMarkdownLinks({
  siteMarkdownLinks,
  routes,
}: {
  siteMarkdownLinks: SiteMarkdownLinks;
  routes: RouteConfig[];
}): void {
  const {sourceToPermalink} = siteMarkdownLinks;
  sourceToPermalink.clear();
  flattenRoutes(routes).forEach((route) => {
    const sourceFilePath = route.metadata?.sourceFilePath;
    if (!sourceFilePath || !MarkdownExtensionRegex.test(sourceFilePath)) {
      return;
    }
    // Route metadata source file paths are site-relative posix paths
    const aliasedSourceFilePath = `@site/${sourceFilePath}`;
    // On duplicates, the first route wins: this can happen for sites using
    // multiple plugin instances reading the same content dir.
    if (!sourceToPermalink.has(aliasedSourceFilePath)) {
      sourceToPermalink.set(aliasedSourceFilePath, route.path);
    }
  });
}
