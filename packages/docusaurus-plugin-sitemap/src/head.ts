/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {RouteBuildMetadata} from '@docusaurus/types';

// Maybe we want to add a routeConfig.metadata.noIndex instead?
// But using Helmet is more reliable for third-party plugins...
export function isNoIndexMetaRoute({
  routesBuildMetadata,
  route,
}: {
  routesBuildMetadata: {[location: string]: RouteBuildMetadata};
  route: string;
}): boolean {
  const routeBuildMetadata = routesBuildMetadata[route];

  if (routeBuildMetadata) {
    return routeBuildMetadata.noIndex;
  }
  return false;
}
