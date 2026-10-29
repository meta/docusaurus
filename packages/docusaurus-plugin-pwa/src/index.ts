/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {type Configuration} from 'webpack';
import {
  compile,
  createJsLoaderFactory,
  getProgressBarPlugin,
  getMinimizers,
} from '@docusaurus/bundler';
import {injectManifest} from 'workbox-build';
import {normalizeUrl} from '@docusaurus/utils';
import logger from '@docusaurus/logger';
import {readDefaultCodeTranslationMessages} from '@docusaurus/theme-translations';
import type {HtmlTags, LoadContext, Plugin} from '@docusaurus/types';
import type {PluginOptions} from '@docusaurus/plugin-pwa';

const PluginName = 'docusaurus-plugin-pwa';

export default function pluginPWA(
  context: LoadContext,
  options: PluginOptions,
): Plugin<void> | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }
  if (context.siteConfig.future.experimental_router === 'hash') {
    logger.warn(
      `${PluginName} does not support the Hash Router and will be disabled.`,
    );
    return null;
  }

  const {
    outDir,
    baseUrl,
    i18n: {currentLocale},
  } = context;
  const {
    debug,
    offlineModeActivationStrategies,
    injectManifestConfig,
    pwaHead,
    swCustom,
    swRegister,
  } = options;

  return {
    name: PluginName,

    getThemePath() {
      return '../lib/theme';
    },
    getTypeScriptThemePath() {
      return '../src/theme';
    },

    getClientModules() {
      return swRegister ? [swRegister] : [];
    },

    getDefaultCodeTranslationMessages() {
      return readDefaultCodeTranslationMessages({
        locale: currentLocale,
        name: 'plugin-pwa',
      });
    },

    configureWebpack(config, isServer, {currentBundler}) {
      return {
        plugins: [
          new currentBundler.instance.EnvironmentPlugin({
            PWA_DEBUG: debug,
            PWA_SERVICE_WORKER_URL: path.posix.resolve(
              `${(config.output?.publicPath as string) || '/'}`,
              'sw.js',
            ),
            PWA_OFFLINE_MODE_ACTIVATION_STRATEGIES:
              offlineModeActivationStrategies,
          }),
        ],
      };
    },

    injectHtmlTags() {
      const headTags: HtmlTags = [];
      pwaHead.forEach(({tagName, ...attributes}) => {
        (['href', 'content'] as const).forEach((attribute) => {
          const attributeValue = attributes[attribute];

          if (!attributeValue) {
            return;
          }

          const attributePath =
            !!path.extname(attributeValue) && attributeValue;

          if (attributePath && !attributePath.startsWith(baseUrl)) {
            attributes[attribute] = normalizeUrl([baseUrl, attributeValue]);
          }
        });

        return headTags.push({
          tagName,
          attributes,
        });
      });
      return {headTags};
    },

    async postBuild(props) {
      const swSourceFileTest = /\.m?js$/;

      const ProgressBarPlugin = await getProgressBarPlugin({
        currentBundler: props.currentBundler,
      });

      // Rspack: builtin:swc-loader, Webpack (deprecated): babel-loader
      const getJSLoader = await createJsLoaderFactory({
        siteDir: props.siteDir,
        siteConfig: props.siteConfig,
      });

      const swWebpackConfig: Configuration = {
        entry: require.resolve('./sw.js'),
        output: {
          path: outDir,
          filename: 'sw.js',
          publicPath: baseUrl,
        },
        target: 'webworker',
        mode: debug ? 'development' : 'production',
        devtool: debug ? 'source-map' : false,
        optimization: {
          splitChunks: false,
          minimize: !debug,
          // See https://developers.google.com/web/tools/workbox/guides/using-bundlers#webpack
          minimizer: debug
            ? []
            : await getMinimizers({
                currentBundler: props.currentBundler,
              }),
        },
        plugins: [
          new props.currentBundler.instance.EnvironmentPlugin({
            // Fallback value required with Webpack 5
            PWA_SW_CUSTOM: swCustom ?? '',
          }),
          new ProgressBarPlugin({
            name: 'Service Worker',
            color: 'red',
          }),
        ],
        module: {
          rules: [
            {
              test: swSourceFileTest,
              exclude: /node_modules/,
              use: getJSLoader({isServer: false}),
            },
          ],
        },
      };

      await compile({
        configs: [swWebpackConfig],
        currentBundler: props.currentBundler,
      });

      const swDest = path.resolve(props.outDir, 'sw.js');

      await injectManifest({
        ...injectManifestConfig,
        globPatterns: [
          '**/*.{js,json,css,html}',
          '**/*.{png,jpg,jpeg,gif,svg,ico}',
          '**/*.{woff,woff2,eot,ttf,otf}',
          // @ts-expect-error: internal API?
          ...((injectManifest.globPatterns as string[] | undefined) ?? []),
        ],
        // Those attributes are not overrideable
        swDest,
        swSrc: swDest,
        globDirectory: props.outDir,
      });
    },
  };
}

export {validateOptions} from './options';
