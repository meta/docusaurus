/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useRouteContext from '@docusaurus/useRouteContext';
import type {PropVersionMetadata} from '@docusaurus/plugin-content-docs';

/**
 * Gets the version metadata of the current doc page.
 */
export function useDocsVersion(): PropVersionMetadata {
  const routeContext = useRouteContext();
  const version = routeContext.data?.docsVersion;
  if (!version) {
    throw new Error(
      "useDocsVersion() can't be called on the current route because the docs version metadata could not be found in route context",
    );
  }
  return version as PropVersionMetadata;
}
