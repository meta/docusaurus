/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {formatStatsErrorMessage} from '@docusaurus/bundler';
import logger from '@docusaurus/logger';
import type webpack from 'webpack';

// When building, include the plugin to force terminate building if errors
// happened in the client bundle.
export default class ForceTerminatePlugin
  implements webpack.WebpackPluginInstance
{
  apply(compiler: webpack.Compiler) {
    compiler.hooks.done.tap('client:done', (stats) => {
      if (stats.hasErrors()) {
        const errorsWarnings = stats.toJson('errors-warnings');
        logger.error(
          `Client bundle compiled with errors therefore further build is impossible.\n${formatStatsErrorMessage(
            errorsWarnings,
          )}`,
        );
        process.exit(1);
      }
    });
  }
}
