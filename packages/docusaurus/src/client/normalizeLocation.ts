/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {matchRouteConfigs} from './routeObjects';
import preload from './preload';
import type {Location, PatchRoutesOnNavigationFunction} from 'react-router';

// Memoize previously normalized pathnames.
const pathnames = new Map<string, string>();

export default function normalizeLocation<T extends Location>(location: T): T {
  if (pathnames.has(location.pathname)) {
    return {
      ...location,
      pathname: pathnames.get(location.pathname),
    };
  }

  // If the location was registered with an `.html` extension, we don't strip it
  // away, or it will render to a 404 page.
  if (
    matchRouteConfigs(location.pathname).some((route) => route.exact === true)
  ) {
    pathnames.set(location.pathname, location.pathname);
    return location;
  }

  const pathname =
    location.pathname.trim().replace(/(?:\/index)?\.html$/, '') || '/';

  pathnames.set(location.pathname, pathname);

  return {
    ...location,
    pathname,
  };
}

/**
 * Hosts without clean URLs serve the `/page` route at `/page.html`. The app
 * renders the `/page` routes for these paths, and this route preloads them.
 */
export function patchHtmlRoutes(
  parentRouteId: string,
): PatchRoutesOnNavigationFunction {
  return ({path, patch}) => {
    const {pathname} = normalizeLocation({pathname: path} as Location);
    if (pathname !== path) {
      patch(parentRouteId, [
        {path, loader: () => preload(pathname).then(() => null)},
      ]);
    }
  };
}
