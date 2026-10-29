/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import routes from '@generated/routes';
import {matchRoutes} from 'react-router-config';

/**
 * Helper function to make sure all async components for that particular route
 * is preloaded before rendering. This is especially useful to avoid loading
 * screens.
 *
 * @param pathname the route pathname, example: /docs/installation
 * @returns Promise object represents whether pathname has been preloaded
 */
export default function preload(pathname: string): Promise<void[]> {
  const matches = Array.from(new Set([pathname, decodeURI(pathname)])).flatMap(
    (p) => matchRoutes(routes, p),
  );

  return Promise.all(matches.map((match) => match.route.component.preload?.()));
}
