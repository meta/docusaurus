/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useMemo} from 'react';
import generatedRoutes, {type RouteConfig} from '@generated/routes';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * Compare the 2 paths, case insensitive and ignoring trailing slash
 */
export function isSamePath(
  path1: string | undefined,
  path2: string | undefined,
): boolean {
  const normalize = (pathname: string | undefined) =>
    (!pathname || pathname.endsWith('/')
      ? pathname
      : `${pathname}/`
    )?.toLowerCase();
  return normalize(path1) === normalize(path2);
}

/**
 * Note that sites don't always have a homepage in practice, so we can't assume
 * that linking to '/' is always safe.
 * @see https://github.com/facebook/docusaurus/pull/6517#issuecomment-1048709116
 */
export function findHomePageRoute({
  baseUrl,
  routes: initialRoutes,
}: {
  routes: RouteConfig[];
  baseUrl: string;
}): RouteConfig | undefined {
  function isHomePageRoute(route: RouteConfig): boolean {
    return route.path === baseUrl && route.exact === true;
  }

  function isHomeParentRoute(route: RouteConfig): boolean {
    return route.path === baseUrl && !route.exact;
  }

  function doFindHomePageRoute(routes: RouteConfig[]): RouteConfig | undefined {
    if (routes.length === 0) {
      return undefined;
    }
    const homePage = routes.find(isHomePageRoute);
    if (homePage) {
      return homePage;
    }
    const indexSubRoutes = routes
      .filter(isHomeParentRoute)
      .flatMap((route) => route.routes ?? []);
    return doFindHomePageRoute(indexSubRoutes);
  }

  return doFindHomePageRoute(initialRoutes);
}

/**
 * Fetches the route that points to "/". Use this instead of the naive "/",
 * because the homepage may not exist.
 */
export function useHomePageRoute(): RouteConfig | undefined {
  const {baseUrl} = useDocusaurusContext().siteConfig;
  return useMemo(
    () => findHomePageRoute({routes: generatedRoutes, baseUrl}),
    [baseUrl],
  );
}
