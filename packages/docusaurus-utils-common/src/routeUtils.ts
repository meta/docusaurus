/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {removeTrailingSlash} from './applyTrailingSlash';

/**
 * Docusaurus leaf routes also match their subpaths unless they are `exact`,
 * React Router routes need a `/*` splat path suffix for that.
 */
export function getLeafRouteRouterPath({
  path,
  exact,
}: {
  path: string;
  exact?: boolean;
}): string {
  if (exact || path.endsWith('*')) {
    return path;
  }
  return `${removeTrailingSlash(path)}/*`;
}
