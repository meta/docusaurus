/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger, {PerfLogger} from '@docusaurus/logger';
import openBrowser from '../utils/openBrowser/openBrowser';
import {setupSiteFileWatchers} from './watcher';
import {createWebpackDevServer} from './webpack';
import {createReloadableSite} from './utils';
import type {LoadContextParams} from '../../server/site';
import type {HostPortOptions} from '../../server/getHostPort';

export type StartCLIOptions = HostPortOptions &
  Pick<LoadContextParams, 'locale' | 'config'> & {
    hotOnly?: boolean;
    open?: boolean;
    poll?: boolean | number;
    minify?: boolean;
    https?: true;
    sslCert?: string;
    sslKey?: string;
  };

async function doStart(
  siteDirParam: string = '.',
  cliOptions: Partial<StartCLIOptions> = {},
): Promise<void> {
  logger.info('Starting the development server...');
  // Temporary workaround to unlock the ability to translate the site config
  // We'll remove it if a better official API can be designed
  // See https://github.com/facebook/docusaurus/issues/4542
  process.env.DOCUSAURUS_CURRENT_LOCALE = cliOptions.locale;

  const reloadableSite = await createReloadableSite({siteDirParam, cliOptions});

  setupSiteFileWatchers(
    {props: reloadableSite.get().props, cliOptions},
    ({plugin}) => {
      if (plugin) {
        reloadableSite.reloadPlugin(plugin);
      } else {
        reloadableSite.reload();
      }
    },
  );

  const devServer = await createWebpackDevServer({
    props: reloadableSite.get().props,
    cliOptions,
    openUrlContext: reloadableSite.openUrlContext,
  });

  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => {
      devServer.stop();
      process.exit();
    });
  });

  await devServer.start();
  if (cliOptions.open) {
    await openBrowser(reloadableSite.getOpenUrl());
  }
}

export async function start(
  siteDirParam: string = '.',
  cliOptions: Partial<StartCLIOptions> = {},
): Promise<void> {
  return PerfLogger.async('CLI start', () => doStart(siteDirParam, cliOptions));
}
