/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {matchRoutes, type RouteObject} from 'react-router';
import {getLeafRouteRouterPath} from '@docusaurus/utils-common';
import routes, {type RouteConfig} from '@generated/routes';
import ExecutionEnvironment from './exports/ExecutionEnvironment';

async function loadRouteComponent(route: RouteConfig): Promise<null> {
  try {
    await route.component.preload?.();
  } catch (error) {
    if (!ExecutionEnvironment.canUseDOM) {
      throw error;
    }
    console.warn(error);
    // If chunk loading failed, it could be because the path to a chunk
    // no longer exists due to a new deployment. Force refresh the page
    // instead of just not navigating.
    window.location.reload();
  }
  return null;
}

function toRouteObject(route: RouteConfig): RouteObject {
  return {
    // Parent routes are pathless layout routes: React Router rejects nested
    // absolute paths that repeat the parent path, like the docs routes do
    path: route.routes ? undefined : getLeafRouteRouterPath(route),
    element: <route.component route={route} />,
    children: route.routes?.map(toRouteObject),
    handle: route,
    // The router keeps rendering the current page until the next one loads
    loader: () => loadRouteComponent(route),
    // Loaders only load code, they don't need to run again
    shouldRevalidate: () => false,
  };
}

export const routeObjects: RouteObject[] = routes.map(toRouteObject);

export function matchRouteConfigs(pathname: string): RouteConfig[] {
  const matches = matchRoutes(routeObjects, pathname) ?? [];
  return matches.map((match) => match.route.handle as RouteConfig);
}
