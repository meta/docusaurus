/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {flattenRoutes} from '@docusaurus/utils';
import {createMatcher} from '@docusaurus/glob';
import {sitemapItemsToXmlString} from './xml';
import {createSitemapItem} from './createSitemapItem';
import {isNoIndexMetaRoute} from './head';
import type {CreateSitemapItemsFn, CreateSitemapItemsParams} from './types';
import type {RouteConfig, RouteBuildMetadata} from '@docusaurus/types';
import type {PluginOptions} from './options';

// Not all routes should appear in the sitemap, and we should filter:
// - parent routes, used for layouts
// - routes matching options.ignorePatterns
// - routes with no index metadata
function getSitemapRoutes({
  routes,
  routesBuildMetadata,
  options,
}: CreateSitemapParams) {
  const {ignorePatterns} = options;

  const ignoreMatcher = createMatcher(ignorePatterns);

  function isRouteExcluded(route: RouteConfig) {
    return (
      ignoreMatcher(route.path) ||
      isNoIndexMetaRoute({routesBuildMetadata, route: route.path})
    );
  }

  return flattenRoutes(routes).filter((route) => !isRouteExcluded(route));
}

// Our default implementation receives some additional parameters on purpose
function createDefaultCreateSitemapItems(
  internalParams: Pick<CreateSitemapParams, 'routesBuildMetadata' | 'options'>,
): CreateSitemapItemsFn {
  return async (params) => {
    const sitemapRoutes = getSitemapRoutes({...params, ...internalParams});
    if (sitemapRoutes.length === 0) {
      return [];
    }
    return Promise.all(
      sitemapRoutes.map((route) =>
        createSitemapItem({
          route,
          siteConfig: params.siteConfig,
          options: internalParams.options,
        }),
      ),
    );
  };
}

type CreateSitemapParams = CreateSitemapItemsParams & {
  routesBuildMetadata: {[location: string]: RouteBuildMetadata};
  options: PluginOptions;
};

export default async function createSitemap(
  params: CreateSitemapParams,
): Promise<string | null> {
  const {routesBuildMetadata, options, routes, siteConfig} = params;

  const defaultCreateSitemapItems: CreateSitemapItemsFn =
    createDefaultCreateSitemapItems({routesBuildMetadata, options});

  const sitemapItems = params.options.createSitemapItems
    ? await params.options.createSitemapItems({
        routes,
        siteConfig,
        defaultCreateSitemapItems,
      })
    : await defaultCreateSitemapItems({
        routes,
        siteConfig,
      });

  if (sitemapItems.length === 0) {
    return null;
  }

  const xmlString = await sitemapItemsToXmlString(sitemapItems, {
    lastmod: params.options.lastmod,
  });
  return xmlString;
}
