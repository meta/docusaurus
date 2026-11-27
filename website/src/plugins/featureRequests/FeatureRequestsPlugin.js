/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {normalizeUrl} from '@docusaurus/utils';

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

      actions.addRoute({
        path: basePath,
        exact: false,
        component: '@site/src/plugins/featureRequests/FeatureRequestsPage',
        modules: {
          basePath: paths,
        },
      });
    },
  };
}
