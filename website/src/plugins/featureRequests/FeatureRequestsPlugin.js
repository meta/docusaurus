/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {normalizeUrl, posixPath} from '@docusaurus/utils';

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function FeatureRequestsPlugin(context) {
  return {
    name: 'feature-requests-plugin',
    async contentLoaded({actions}) {
      const basePath = normalizeUrl([context.baseUrl, '/feature-requests']);
      const paths = await actions.createData(
        'paths.json',
        JSON.stringify(basePath),
      );

      // TODO Docusaurus v4 breaking change
      //  module aliasing should be automatic
      //  we should never find local absolute FS paths in the codegen registry
      const aliasedSource = (source) =>
        `@generated/${posixPath(
          path.relative(context.generatedFilesDir, source),
        )}`;

      actions.addRoute({
        path: basePath,
        exact: false,
        component: '@site/src/plugins/featureRequests/FeatureRequestsPage',
        modules: {
          basePath: aliasedSource(paths),
        },
      });
    },
  };
}
