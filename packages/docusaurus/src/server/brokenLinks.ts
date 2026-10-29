/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import {matchRoutes as reactRouterMatchRoutes} from 'react-router-config';
import {
  parseURLPath,
  serializeURLPath,
  flattenRoutes,
  type URLPath,
} from '@docusaurus/utils';
import {addTrailingSlash, removeTrailingSlash} from '@docusaurus/utils-common';
import type {RouteConfig, ReportingSeverity} from '@docusaurus/types';

function matchRoutes(routeConfig: RouteConfig[], pathname: string) {
  // @ts-expect-error: React router types RouteConfig with an actual React
  // component, but we load route components with string paths.
  // We don't actually access component here, so it's fine.
  return reactRouterMatchRoutes(routeConfig, pathname);
}

type BrokenLink = {
  link: string;
  resolvedLink: string;
  anchor: boolean;
};

type BrokenLinksMap = {[pathname: string]: BrokenLink[]};

// The linking data that has been collected on Docusaurus pages during SSG
// {rendered page pathname => links and anchors collected on that page}
type CollectedLinks = {
  [pathname: string]: {links: string[]; anchors: string[]};
};

// We use efficient data structures for performance reasons
// See https://github.com/facebook/docusaurus/issues/9754
type CollectedLinksNormalized = Map<
  string,
  {links: Set<string>; anchors: Set<string>}
>;

type BrokenLinksHelper = {
  collectedLinks: CollectedLinksNormalized;
  isPathBrokenLink: (linkPath: URLPath) => boolean;
  isAnchorBrokenLink: (linkPath: URLPath) => boolean;
};

function safeDecodeURI(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function createBrokenLinksHelper({
  collectedLinks,
  routes,
}: {
  collectedLinks: CollectedLinksNormalized;
  routes: RouteConfig[];
}): BrokenLinksHelper {
  const validPathnames = new Set(collectedLinks.keys());

  // IMPORTANT: this is an optimization
  // See https://github.com/facebook/docusaurus/issues/9754
  // Matching against the route array can be expensive
  // If the route is already in the valid pathnames,
  // we can avoid matching against it
  const remainingRoutes = (function filterRoutes() {
    // Goal: unit tests should behave the same with this enabled or disabled
    const disableOptimization = false;
    if (disableOptimization) {
      return routes;
    }
    // We must consider the "exact" and "strict" match attribute
    // We can only infer pre-validated pathnames from a route from exact routes
    const [validPathnameRoutes, otherRoutes] = _.partition(
      routes,
      (route) => route.exact && validPathnames.has(route.path),
    );
    // If a route is non-strict (non-sensitive to trailing slashes)
    // We must pre-validate all possible paths
    validPathnameRoutes.forEach((validPathnameRoute) => {
      if (!validPathnameRoute.strict) {
        validPathnames.add(addTrailingSlash(validPathnameRoute.path));
        validPathnames.add(removeTrailingSlash(validPathnameRoute.path));
      }
    });
    return otherRoutes;
  })();

  function isPathnameMatchingAnyRoute(pathname: string): boolean {
    if (matchRoutes(remainingRoutes, pathname).length > 0) {
      // IMPORTANT: this is an optimization
      // See https://github.com/facebook/docusaurus/issues/9754
      // Large Docusaurus sites have many routes!
      // We try to minimize calls to a possibly expensive matchRoutes function
      validPathnames.add(pathname);
      return true;
    }

    return false;
  }

  function isPathBrokenLink(linkPath: URLPath) {
    const pathnames = [linkPath.pathname, safeDecodeURI(linkPath.pathname)];
    if (pathnames.some((p) => validPathnames.has(p))) {
      return false;
    }
    if (pathnames.some(isPathnameMatchingAnyRoute)) {
      return false;
    }
    return true;
  }

  function isAnchorBrokenLink(linkPath: URLPath) {
    const {pathname, hash} = linkPath;
    // Link has no hash: it can't be a broken anchor link
    if (hash === undefined) {
      return false;
    }
    // Link has empty hash ("#", "/page#"...): we do not report it as broken
    // Empty hashes are used for various weird reasons, by us and other users...
    // See for example: https://github.com/facebook/docusaurus/pull/6003
    if (hash === '') {
      return false;
    }
    const targetPage =
      collectedLinks.get(pathname) ??
      collectedLinks.get(safeDecodeURI(pathname)) ??
      // The broken link checker should not care about a trailing slash
      // Those are already covered by the broken pathname checker
      // See https://github.com/facebook/docusaurus/issues/10116
      collectedLinks.get(addTrailingSlash(pathname)) ??
      collectedLinks.get(addTrailingSlash(safeDecodeURI(pathname))) ??
      collectedLinks.get(removeTrailingSlash(pathname)) ??
      collectedLinks.get(removeTrailingSlash(safeDecodeURI(pathname)));
    // link with anchor to a page that does not exist (or did not collect any
    // link/anchor) is considered as a broken anchor
    if (!targetPage) {
      return true;
    }
    // it's a not broken anchor if the anchor exists on the target page
    if (
      targetPage.anchors.has(hash) ||
      targetPage.anchors.has(safeDecodeURIComponent(hash))
    ) {
      return false;
    }
    return true;
  }

  return {
    collectedLinks,
    isPathBrokenLink,
    isAnchorBrokenLink,
  };
}

function getBrokenLinksForPage({
  pagePath,
  helper,
}: {
  pagePath: string;
  helper: BrokenLinksHelper;
}): BrokenLink[] {
  const pageData = helper.collectedLinks.get(pagePath)!;

  const brokenLinks: BrokenLink[] = [];

  pageData.links.forEach((link) => {
    const linkPath = parseURLPath(link, pagePath);
    if (helper.isPathBrokenLink(linkPath)) {
      brokenLinks.push({
        link,
        resolvedLink: serializeURLPath(linkPath),
        anchor: false,
      });
    } else if (helper.isAnchorBrokenLink(linkPath)) {
      brokenLinks.push({
        link,
        resolvedLink: serializeURLPath(linkPath),
        anchor: true,
      });
    }
  });

  return brokenLinks;
}

/**
 * The route defs can be recursive, and have a parent match-all route. We don't
 * want to match broken links like /docs/brokenLink against /docs/*. For this
 * reason, we only consider the "final routes" that do not have subroutes.
 * We also need to remove the match-all 404 route
 */
function filterIntermediateRoutes(routesInput: RouteConfig[]): RouteConfig[] {
  const routesWithout404 = routesInput.filter((route) => route.path !== '*');
  return flattenRoutes(routesWithout404);
}

function getBrokenLinks({
  collectedLinks,
  routes,
}: {
  collectedLinks: CollectedLinksNormalized;
  routes: RouteConfig[];
}): BrokenLinksMap {
  const filteredRoutes = filterIntermediateRoutes(routes);

  const helper = createBrokenLinksHelper({
    collectedLinks,
    routes: filteredRoutes,
  });

  const result: BrokenLinksMap = {};
  collectedLinks.forEach((_unused, pagePath) => {
    try {
      result[pagePath] = getBrokenLinksForPage({
        pagePath,
        helper,
      });
    } catch (e) {
      throw new Error(`Unable to get broken links for page ${pagePath}.`, {
        cause: e,
      });
    }
  });
  return result;
}

function brokenLinkMessage(brokenLink: BrokenLink): string {
  const showResolvedLink = brokenLink.link !== brokenLink.resolvedLink;
  return `${brokenLink.link}${
    showResolvedLink ? ` (resolved as: ${brokenLink.resolvedLink})` : ''
  }`;
}

function createBrokenLinksMessage(
  pagePath: string,
  brokenLinks: BrokenLink[],
): string {
  const type = brokenLinks[0]?.anchor === true ? 'anchor' : 'link';

  const anchorMessage =
    brokenLinks.length > 0
      ? `- Broken ${type} on source page path = ${pagePath}:
   -> linking to ${brokenLinks
     .map(brokenLinkMessage)
     .join('\n   -> linking to ')}`
      : '';

  return `${anchorMessage}`;
}

function createBrokenAnchorsMessage(
  brokenAnchors: BrokenLinksMap,
): string | undefined {
  if (Object.keys(brokenAnchors).length === 0) {
    return undefined;
  }

  return `Docusaurus found broken anchors!

Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

Exhaustive list of all broken anchors found:
${Object.entries(brokenAnchors)
  .map(([pagePath, brokenLinks]) =>
    createBrokenLinksMessage(pagePath, brokenLinks),
  )
  .join('\n')}
`;
}

function createBrokenPathsMessage(
  brokenPathsMap: BrokenLinksMap,
): string | undefined {
  if (Object.keys(brokenPathsMap).length === 0) {
    return undefined;
  }

  /**
   * If there's a broken link appearing very often, it is probably a broken link
   * on the layout. Add an additional message in such case to help user figure
   * this out. See https://github.com/facebook/docusaurus/issues/3567#issuecomment-706973805
   */
  function getLayoutBrokenLinksHelpMessage() {
    const flatList = Object.entries(brokenPathsMap).flatMap(
      ([pagePage, brokenLinks]) =>
        brokenLinks.map((brokenLink) => ({pagePage, brokenLink})),
    );

    const countedBrokenLinks = _.countBy(
      flatList,
      (item) => item.brokenLink.link,
    );

    const FrequencyThreshold = 5; // Is this a good value?
    const frequentLinks = Object.entries(countedBrokenLinks)
      .filter(([, count]) => count >= FrequencyThreshold)
      .map(([link]) => link);

    if (frequentLinks.length === 0) {
      return '';
    }

    return logger.interpolate`

It looks like some of the broken links we found appear in many pages of your site.
Maybe those broken links appear on all pages through your site layout?
We recommend that you check your theme configuration for such links (particularly, theme navbar and footer).
Frequent broken links are linking to:${frequentLinks}`;
  }

  return `Docusaurus found broken links!

Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.${getLayoutBrokenLinksHelpMessage()}

Exhaustive list of all broken links found:
${Object.entries(brokenPathsMap)
  .map(([pagePath, brokenPaths]) =>
    createBrokenLinksMessage(pagePath, brokenPaths),
  )
  .join('\n')}
`;
}

function splitBrokenLinks(brokenLinks: BrokenLinksMap): {
  brokenPaths: BrokenLinksMap;
  brokenAnchors: BrokenLinksMap;
} {
  const brokenPaths: BrokenLinksMap = {};
  const brokenAnchors: BrokenLinksMap = {};

  Object.entries(brokenLinks).forEach(([pathname, pageBrokenLinks]) => {
    const [anchorBrokenLinks, pathBrokenLinks] = _.partition(
      pageBrokenLinks,
      (link) => link.anchor,
    );

    if (pathBrokenLinks.length > 0) {
      brokenPaths[pathname] = pathBrokenLinks;
    }
    if (anchorBrokenLinks.length > 0) {
      brokenAnchors[pathname] = anchorBrokenLinks;
    }
  });

  return {brokenPaths, brokenAnchors};
}

function reportBrokenLinks({
  brokenLinks,
  onBrokenLinks,
  onBrokenAnchors,
}: {
  brokenLinks: BrokenLinksMap;
  onBrokenLinks: ReportingSeverity;
  onBrokenAnchors: ReportingSeverity;
}) {
  // We need to split the broken links reporting in 2 for better granularity
  // This is because we need to report broken path/anchors independently
  const {brokenPaths, brokenAnchors} = splitBrokenLinks(brokenLinks);

  const pathErrorMessage = createBrokenPathsMessage(brokenPaths);
  if (pathErrorMessage) {
    logger.report(onBrokenLinks)(pathErrorMessage);
  }

  const anchorErrorMessage = createBrokenAnchorsMessage(brokenAnchors);
  if (anchorErrorMessage) {
    logger.report(onBrokenAnchors)(anchorErrorMessage);
  }
}

// Users might use the useBrokenLinks() API in weird unexpected ways
// JS users might call "collectLink(undefined)" for example
// TS users might call "collectAnchor('#hash')" with/without #
// We clean/normalize the collected data to avoid obscure errors being thrown
// We also use optimized data structures for a faster algorithm
function normalizeCollectedLinks(
  collectedLinks: CollectedLinks,
): CollectedLinksNormalized {
  const result: CollectedLinksNormalized = new Map();
  Object.entries(collectedLinks).forEach(([pathname, pageCollectedData]) => {
    result.set(pathname, {
      links: new Set(pageCollectedData.links.filter(_.isString)),
      anchors: new Set(
        pageCollectedData.anchors
          .filter(_.isString)
          .map((anchor) => (anchor.startsWith('#') ? anchor.slice(1) : anchor)),
      ),
    });
  });
  return result;
}

export async function handleBrokenLinks({
  collectedLinks,
  onBrokenLinks,
  onBrokenAnchors,
  routes,
}: {
  collectedLinks: CollectedLinks;
  onBrokenLinks: ReportingSeverity;
  onBrokenAnchors: ReportingSeverity;
  routes: RouteConfig[];
}): Promise<void> {
  if (onBrokenLinks === 'ignore' && onBrokenAnchors === 'ignore') {
    return;
  }
  const brokenLinks = getBrokenLinks({
    routes,
    collectedLinks: normalizeCollectedLinks(collectedLinks),
  });
  reportBrokenLinks({brokenLinks, onBrokenLinks, onBrokenAnchors});
}
