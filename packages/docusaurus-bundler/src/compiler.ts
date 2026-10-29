/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type Configuration} from 'webpack';
import logger from '@docusaurus/logger';
import formatWebpackMessages from './legacy/formatWebpackMessages';
import type webpack from 'webpack';
import type {CurrentBundler} from '@docusaurus/types';

export function formatStatsErrorMessage(
  statsJson: ReturnType<webpack.Stats['toJson']> | undefined,
): string | undefined {
  if (statsJson?.errors?.length) {
    // TODO formatWebpackMessages does not print stack-traces
    // Also the error causal chain is lost here
    // We log the stacktrace inside serverEntry.tsx for now (not ideal)
    const {errors} = formatWebpackMessages(statsJson);
    return errors
      .map((str) => logger.red(str))
      .join(`\n\n${logger.yellow('--------------------------')}\n\n`);
  }
  return undefined;
}

export function printStatsWarnings(
  statsJson: ReturnType<webpack.Stats['toJson']> | undefined,
): void {
  if (statsJson?.warnings?.length) {
    statsJson.warnings?.forEach((warning) => {
      logger.warn(warning);
    });
  }
}

declare global {
  interface Error {
    /** @see https://webpack.js.org/api/node/#error-handling */
    details?: unknown;
  }
}

export function compile({
  configs,
  currentBundler,
}: {
  configs: Configuration[];
  currentBundler: CurrentBundler;
}): Promise<webpack.MultiStats> {
  return new Promise((resolve, reject) => {
    const compiler = currentBundler.instance(configs);
    compiler.run((err, stats) => {
      if (err) {
        logger.error(err.stack ?? err);
        if (err.details) {
          logger.error(err.details);
        }
        reject(err);
      }
      // Let plugins consume all the stats
      const errorsWarnings = stats?.toJson('errors-warnings');
      if (stats?.hasErrors()) {
        const statsErrorMessage = formatStatsErrorMessage(errorsWarnings);
        reject(
          new Error(
            `Failed to compile due to Webpack errors.\n${statsErrorMessage}`,
          ),
        );
      }
      printStatsWarnings(errorsWarnings);

      // Webpack 5 requires calling close() so that persistent caching works
      // See https://github.com/webpack/webpack.js.org/pull/4775
      compiler.close((errClose) => {
        if (errClose) {
          logger.error(`Error while closing Webpack compiler: ${errClose}`);
          reject(errClose);
        } else {
          resolve(stats!);
        }
      });
    });
  });
}
