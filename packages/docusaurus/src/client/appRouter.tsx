/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createBrowserRouter,
  createHashRouter,
  type DataRouter,
  type RouteObject,
} from 'react-router';
import siteConfig from '@generated/docusaurus.config';
import App from './App';
import {routeObjects} from './routeObjects';
import {patchHtmlRoutes} from './normalizeLocation';

export const appRoutes: RouteObject[] = [
  {id: 'app', element: <App />, children: routeObjects},
];

export function createAppRouter(): DataRouter {
  const createRouter =
    siteConfig.future.experimental_router === 'hash'
      ? createHashRouter
      : createBrowserRouter;
  return createRouter(appRoutes, {
    patchRoutesOnNavigation: patchHtmlRoutes('app'),
  });
}

/**
 * Resolves once the router has loaded the initial page.
 */
export function waitForInitialization(router: DataRouter): Promise<void> {
  return new Promise((resolve) => {
    if (router.state.initialized) {
      resolve();
      return;
    }
    const unsubscribe = router.subscribe((state) => {
      if (state.initialized) {
        unsubscribe();
        resolve();
      }
    });
  });
}
