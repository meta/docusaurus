/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {PluginConfig} from '@docusaurus/types';

export const isArgosBuild = process.env.DOCUSAURUS_ARGOS_BUILD === 'true';

if (isArgosBuild) {
  console.warn(
    `Building site for Argos CI:
- Additional dogfooding pages will be preserved in sitemap
- Bundler output assets will NOT be hashed to make HTML files more stable`,
  );
}

export const argosBuildPlugin: PluginConfig = function ArgosBuildPlugin() {
  return {
    name: 'argos-build-plugin',
    configureWebpack: (_conf, isServer) => {
      if (!isServer && isArgosBuild) {
        // For Argos builds, we disable output assets hashing in client builds
        // This is because we want to "stabilize" html/css/js files
        // This way we can upload them to Argos to diff them
        // See https://argos-ci.com/docs/learn/how-to-guides/visual-coverage/compare-non-image-files
        return {
          output: {
            pathinfo: false,
            filename: '[name].js',
            chunkFilename: '[name].js',
          },
        };
      }
      return undefined;
    },
  };
};
