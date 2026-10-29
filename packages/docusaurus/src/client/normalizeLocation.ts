/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {matchRoutes} from 'react-router-config';
import routes from '@generated/routes';
import type {Location} from 'history';

// Memoize previously normalized pathnames.
const pathnames = new Map<string, string>();

function computeNormalizedPathname(pathname: string): string {
  // If the location was registered with an `.html` extension, we don't strip it
  // away, or it will render to a 404 page.
  const matchedRoutes = matchRoutes(routes, pathname);
  if (matchedRoutes.some(({route}) => route.exact === true)) {
    return pathname;
  }
  return pathname.trim().replace(/(?:\/index)?\.html$/, '') || '/';
}

export function normalizePathname(pathname: string): string {
  let normalizedPathname = pathnames.get(pathname);
  if (normalizedPathname === undefined) {
    normalizedPathname = computeNormalizedPathname(pathname);
    pathnames.set(pathname, normalizedPathname);
  }
  return normalizedPathname;
}

export default function normalizeLocation<T extends Location>(location: T): T {
  return {
    ...location,
    pathname: normalizePathname(location.pathname),
  };
}
