/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import merge from 'webpack-merge';
import ReactLoadableSSRAddon from 'react-loadable-ssr-addon-v5-slorber';
import {getProgressBarPlugin} from '@docusaurus/bundler';
import {getLocaleConfig} from '@docusaurus/utils';
import {createBaseConfig} from './base';
import ChunkAssetPlugin from './plugins/ChunkAssetPlugin';
import ForceTerminatePlugin from './plugins/ForceTerminatePlugin';
import DevHtmlPlugin from './plugins/DevHtmlPlugin';
import {createStaticDirectoriesCopyPlugin} from './plugins/StaticDirectoriesCopyPlugin';
import {renderDevHtml} from './templates/dev.html.template';
import type {ConfigureWebpackUtils, Props} from '@docusaurus/types';
import type {Configuration} from 'webpack';

async function createBaseClientConfig({
  props,
  hydrate,
  minify,
  configureWebpackUtils,
}: {
  props: Props;
  hydrate: boolean;
  minify: boolean;
  configureWebpackUtils: ConfigureWebpackUtils;
}): Promise<Configuration> {
  const baseConfig = await createBaseConfig({
    props,
    isServer: false,
    minify,
    configureWebpackUtils,
  });

  const ProgressBarPlugin = await getProgressBarPlugin({
    currentBundler: props.currentBundler,
  });

  return merge(baseConfig, {
    // Useless, disabled on purpose (errors on existing sites with no
    // browserslist config)
    // target: 'browserslist',
    entry: path.resolve(__dirname, '../client/clientEntry.js'),
    optimization: {
      // Keep the runtime chunk separated to enable long term caching
      // https://x.com/wSokra/status/969679223278505985
      runtimeChunk: true,
    },
    plugins: [
      new props.currentBundler.instance.DefinePlugin({
        'process.env.HYDRATE_CLIENT_ENTRY': JSON.stringify(hydrate),
      }),
      new ChunkAssetPlugin(),
      new ProgressBarPlugin({
        name: 'Client',
        color: 'green',
      }),
      await createStaticDirectoriesCopyPlugin({
        props,
      }),
    ].filter(Boolean),
  });
}

// client config when running "docusaurus start"
export async function createStartClientConfig({
  props,
  minify,
  poll,
  configureWebpackUtils,
}: {
  props: Props;
  minify: boolean;
  poll: number | boolean | undefined;
  configureWebpackUtils: ConfigureWebpackUtils;
}): Promise<{clientConfig: Configuration}> {
  const {siteConfig, headTags, preBodyTags, postBodyTags} = props;

  const clientConfig = merge(
    await createBaseClientConfig({
      props,
      minify,
      hydrate: false,
      configureWebpackUtils,
    }),
    {
      watchOptions: {
        ignored: /node_modules\/(?!@docusaurus)/,
        poll,
      },
      infrastructureLogging: {
        // Reduce log verbosity, see https://github.com/facebook/docusaurus/pull/5420#issuecomment-906613105
        level: 'warn',
      },
      plugins: [
        // Generates an `index.html` file with the <script> injected.
        new DevHtmlPlugin({
          filename: 'index.html',
          render: (assets) =>
            renderDevHtml({
              ...assets,
              title: siteConfig.title,
              headTags,
              preBodyTags,
              postBodyTags,
              lang: getLocaleConfig(props.i18n).htmlLang,
            }),
        }),
      ],
    },
  );

  return {clientConfig};
}

// client config when running "docusaurus build"
export async function createBuildClientConfig({
  props,
  minify,
  configureWebpackUtils,
}: {
  props: Props;
  minify: boolean;
  configureWebpackUtils: ConfigureWebpackUtils;
}): Promise<{config: Configuration; clientManifestPath: string}> {
  // Apply user webpack config.
  const {generatedFilesDir, siteConfig} = props;
  const router = siteConfig.future.experimental_router;

  // With the hash router, we don't hydrate the React app, even in build mode!
  // This is because it will always be a client-rendered React app
  const hydrate = router !== 'hash';

  const clientManifestPath = path.join(
    generatedFilesDir,
    'client-manifest.json',
  );

  const config: Configuration = merge(
    await createBaseClientConfig({
      props,
      minify,
      configureWebpackUtils,
      hydrate,
    }),
    {
      plugins: [
        new ForceTerminatePlugin(),
        // Generate client manifests file that will be used for server bundle.
        new ReactLoadableSSRAddon({
          filename: clientManifestPath,
        }),
      ],
    },
  );

  return {config, clientManifestPath};
}
