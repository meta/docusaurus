/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import merge from 'webpack-merge';
import {
  formatStatsErrorMessage,
  printStatsWarnings,
  RspackDevServer,
} from '@docusaurus/bundler';
import logger from '@docusaurus/logger';
import {createPollingOptions} from './watcher';
import {
  createConfigureWebpackUtils,
  executePluginsConfigureWebpack,
} from '../../webpack/configure';
import {createStartClientConfig} from '../../webpack/client';
import type {StartCLIOptions} from './start';
import type {
  ConfigureWebpackUtils,
  CurrentBundler,
  Props,
} from '@docusaurus/types';
import type {Compiler} from 'webpack';
import type WebpackDevServer from 'webpack-dev-server';
import type {Configuration as DevServerConfig} from 'webpack-dev-server';
import type {Compiler as RspackCompiler} from '@rspack/core';
import type {Configuration as RspackDevServerConfig} from '@rspack/dev-server';
import type {OpenUrlContext} from './utils';
import type {HttpsConfig} from '../../webpack/utils/getHttpsConfig';

// E2E_TEST=true docusaurus start
// Makes "docusaurus start" exit immediately on success/error, for E2E test
function registerWebpackE2ETestHook(compiler: Compiler) {
  compiler.hooks.done.tap('done', (stats) => {
    const errorsWarnings = stats.toJson('errors-warnings');
    const statsErrorMessage = formatStatsErrorMessage(errorsWarnings);
    if (statsErrorMessage) {
      console.error(statsErrorMessage);
    }
    printStatsWarnings(errorsWarnings);
    if (process.env.E2E_TEST) {
      if (stats.hasErrors()) {
        logger.error('E2E_TEST: Project has compiler errors.');
        process.exit(1);
      }
      logger.success('E2E_TEST: Project can compile.');
      process.exit(0);
    }
  });
}

function createDevServerConfig({
  cliOptions,
  props,
  host,
  port,
  httpsConfig,
}: {
  cliOptions: StartCLIOptions;
  props: Props;
  host: string;
  port: number;
  httpsConfig: HttpsConfig;
}): DevServerConfig {
  const {baseUrl, siteDir, siteConfig} = props;

  const pollingOptions = createPollingOptions(cliOptions);

  // https://webpack.js.org/configuration/dev-server
  return {
    hot: cliOptions.hotOnly ? 'only' : true,
    liveReload: false,
    client: {
      progress: true,
      overlay: {
        warnings: false,
        errors: true,
      },
      webSocketURL: {
        hostname: '0.0.0.0',
        port: 0,
      },
    },
    headers: {
      'access-control-allow-origin': '*',
    },
    devMiddleware: {
      publicPath:
        siteConfig.future.experimental_router === 'hash' ? 'auto' : baseUrl,
      // Reduce log verbosity, see https://github.com/facebook/docusaurus/pull/5420#issuecomment-906613105
      stats: 'summary',
    },
    static: siteConfig.staticDirectories.map((dir) => ({
      publicPath: baseUrl,
      directory: path.resolve(siteDir, dir),
      watch: {
        // Useful options for our own monorepo using symlinks!
        // See https://github.com/webpack/webpack/issues/11612#issuecomment-879259806
        followSymlinks: true,
        ignored: /node_modules\/(?!@docusaurus)/,
        ...{pollingOptions},
      },
    })),
    ...(httpsConfig && {
      server:
        typeof httpsConfig === 'object'
          ? {
              type: 'https',
              options: httpsConfig,
            }
          : 'https',
    }),
    historyApiFallback: {
      rewrites: [{from: /\/*/, to: baseUrl}],
    },
    allowedHosts: 'all',
    host,
    port,
  };
}

async function getStartClientConfig({
  props,
  minify,
  poll,
  configureWebpackUtils,
}: {
  props: Props;
  minify: boolean;
  poll: number | boolean | undefined;
  configureWebpackUtils: ConfigureWebpackUtils;
}) {
  const {plugins} = props;
  let {clientConfig: config} = await createStartClientConfig({
    props,
    minify,
    poll,
    configureWebpackUtils,
  });
  config = executePluginsConfigureWebpack({
    plugins,
    config,
    isServer: false,
    configureWebpackUtils,
  });
  return config;
}

export async function createWebpackDevServer({
  props,
  cliOptions,
  openUrlContext,
}: {
  props: Props;
  cliOptions: StartCLIOptions;
  openUrlContext: OpenUrlContext;
}): Promise<WebpackDevServer | RspackDevServer> {
  const configureWebpackUtils = await createConfigureWebpackUtils({
    siteDir: props.siteDir,
    siteConfig: props.siteConfig,
  });

  const config = await getStartClientConfig({
    props,
    minify: cliOptions.minify ?? true,
    poll: cliOptions.poll,
    configureWebpackUtils,
  });

  const compiler = props.currentBundler.instance(config);
  registerWebpackE2ETestHook(compiler);

  const defaultDevServerConfig: DevServerConfig = createDevServerConfig({
    cliOptions,
    props,
    host: openUrlContext.host,
    port: openUrlContext.port,
    httpsConfig: openUrlContext.httpsConfig,
  });

  // Allow plugin authors to customize/override devServer config
  const devServerConfig: DevServerConfig = merge(
    [defaultDevServerConfig, config.devServer].filter(Boolean),
  );

  return createDevServer({
    devServerConfig,
    compiler,
    currentBundler: props.currentBundler,
  });
}

async function createDevServer({
  devServerConfig,
  compiler,
  currentBundler,
}: {
  devServerConfig: DevServerConfig;
  compiler: Compiler;
  currentBundler: CurrentBundler;
}): Promise<WebpackDevServer | RspackDevServer> {
  if (currentBundler.name === 'webpack') {
    // Imported lazily, only when Webpack is used
    const {default: WebpackDevServer} = await import('webpack-dev-server');
    return new WebpackDevServer(devServerConfig, compiler);
  }
  // Docusaurus bundler configs are typed with Webpack types
  return new RspackDevServer(
    devServerConfig as RspackDevServerConfig,
    compiler as unknown as RspackCompiler,
  );
}
