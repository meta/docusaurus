/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {matchRouteConfigs} from './routeObjects';

/**
 * Helper function to make sure all async components for that particular route
 * is preloaded before rendering. This is especially useful to avoid loading
 * screens.
 *
 * @param pathname the route pathname, example: /docs/installation
 * @returns Promise object represents whether pathname has been preloaded
 */
export default function preload(pathname: string): Promise<void[]> {
  const matchedRoutes = Array.from(
    new Set([pathname, decodeURI(pathname)]),
  ).flatMap((p) => matchRouteConfigs(p));

  return Promise.all(matchedRoutes.map((route) => route.component.preload?.()));
}
