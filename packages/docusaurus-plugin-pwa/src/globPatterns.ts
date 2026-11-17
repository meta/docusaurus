/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {PluginOptions} from '@docusaurus/plugin-pwa';

/** The files to precache: the regular static assets, plus the user ones. */
export function getGlobPatterns(
  injectManifestConfig: PluginOptions['injectManifestConfig'],
): string[] {
  return [
    '**/*.{js,json,css,html}',
    '**/*.{png,jpg,jpeg,gif,svg,ico}',
    '**/*.{woff,woff2,eot,ttf,otf}',
    ...(injectManifestConfig.globPatterns ?? []),
  ];
}
