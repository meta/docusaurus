/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {createRequire} from 'node:module';
import logger from '@docusaurus/logger';
import {rspack} from './rspack';
import {
  getClientQueries,
  getLightningCssMinimizerOptions,
} from './browserslist';
import type * as MinifyFunctions from './minifyFunctions';
import type {JsMinifyOptions} from '@swc/core';
import type {
  RspackPluginInstance,
  SwcJsMinimizerRspackPluginOptions,
} from '@rspack/core';
import type {WebpackPluginInstance} from 'webpack';
import type {CurrentBundler} from '@docusaurus/types';

export type MinimizersConfig = {
  currentBundler: CurrentBundler;
};

type RspackSwcJsMinimizerOptions = NonNullable<
  SwcJsMinimizerRspackPluginOptions['minimizerOptions']
>;

// Shared by Webpack and Rspack, compatible with both SWC and Rspack types
// Rspack only accepts a subset of the SWC JS minifier options
// See https://swc.rs/docs/configuration/minification
// See https://rspack.rs/plugins/rspack/swc-js-minimizer-rspack-plugin#minimizeroptions
const SwcJsMinimizerOptions = {
  ecma: 2020,
  compress: {
    ecma: 5,
  },
  module: true,
  mangle: true,
  format: {
    ecma: 5,
    comments: false,
    ascii_only: true,
  },
} as const satisfies RspackSwcJsMinimizerOptions;

// Escape hatch to disable or limit the minimizer worker processes
// For CI environments that don't report their real number of CPUs
// See https://github.com/webpack/minimizer-webpack-plugin#parallel
function getMinimizerParallel(): boolean | number {
  const value = process.env.DOCUSAURUS_BUNDLER_MINIMIZER_PARALLEL;
  if (value === 'false') {
    return false;
  }
  const workers = parseInt(value ?? '', 10);
  return workers > 0 ? workers : true;
}

// Minify functions are referenced by module path, so that the plugin's
// worker processes can require them
// The extension is .ts when running tests on source files
// See https://github.com/webpack/minimizer-webpack-plugin#minify
function getMinifyFunction(name: keyof typeof MinifyFunctions) {
  const extension = path.extname(__filename);
  return {
    path: path.join(__dirname, `minifyFunctions${extension}`),
    export: name,
  };
}

// @swc/core is an optional peer dependency, only needed to minify JS with
// Webpack: fail fast with an actionable error instead of a minimizer failure
// The plugin's worker processes require it from the plugin's own location
function ensureSwcCoreInstalled(): void {
  try {
    createRequire(require.resolve('minimizer-webpack-plugin')).resolve(
      '@swc/core',
    );
  } catch (error) {
    throw new Error(
      logger.interpolate`Docusaurus needs the name=${'@swc/core'} package to minify JavaScript with Webpack, but it is not installed.
Your site uses the deprecated Webpack bundler because of the code=${'webpack'} site config. You can either:
- add name=${'@swc/core'} to your site dependencies, for example with code=${'npm install @swc/core'}
- remove the code=${'webpack'} site config, to use the default Rspack bundler that doesn't need it`,
      {cause: error},
    );
  }
}

async function getJsMinimizer(): Promise<WebpackPluginInstance> {
  ensureSwcCoreInstalled();
  const {default: MinimizerPlugin} = await import('minimizer-webpack-plugin');
  return new MinimizerPlugin<JsMinifyOptions>({
    parallel: getMinimizerParallel(),
    minify: {
      implementation: getMinifyFunction('swcMinify'),
      options: {...SwcJsMinimizerOptions, safari10: true},
    },
  });
}

async function getCssMinimizer(): Promise<WebpackPluginInstance> {
  const {default: MinimizerPlugin} = await import('minimizer-webpack-plugin');
  return new MinimizerPlugin({
    // The plugin's default test only matches JS files
    test: /\.css(?:\?.*)?$/i,
    parallel: getMinimizerParallel(),
    minify: {
      implementation: getMinifyFunction('lightningCssMinify'),
      options: getLightningCssMinimizerOptions(),
    },
  });
}

// Webpack-only minimizers are imported lazily, only when Webpack is used
async function getWebpackMinimizers(): Promise<WebpackPluginInstance[]> {
  return Promise.all([getJsMinimizer(), getCssMinimizer()]);
}

function getRspackMinimizers(): RspackPluginInstance[] {
  return [
    // See https://rspack.dev/plugins/rspack/swc-js-minimizer-rspack-plugin
    // See https://swc.rs/docs/configuration/minification
    new rspack.SwcJsMinimizerRspackPlugin({
      minimizerOptions: {
        minify: true,
        ...SwcJsMinimizerOptions,
      },
    }),
    new rspack.LightningCssMinimizerRspackPlugin({
      minimizerOptions: {
        // Rspack takes Browserslist queries directly
        // While LightningCSS targets are normally not Browserslist queries
        // See https://rspack.dev/plugins/rspack/lightning-css-minimizer-rspack-plugin#minimizeroptions
        // See https://lightningcss.dev/transpilation.html
        targets: getClientQueries(),
      },
    }),
  ];
}

export async function getMinimizers(
  params: MinimizersConfig,
): Promise<WebpackPluginInstance[]> {
  return params.currentBundler.name === 'rspack'
    ? // Docusaurus bundler configs are typed with Webpack types
      (getRspackMinimizers() as unknown as WebpackPluginInstance[])
    : getWebpackMinimizers();
}
