/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {rspack} from './rspack';
import type webpack from 'webpack';
import type WebpackBar from 'webpackbar';
import type MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type {CurrentBundler, DocusaurusConfig} from '@docusaurus/types';

// Webpack-only packages are imported lazily, only when Webpack is used
// Rspack sites (the default) shouldn't pay their load cost

type SiteConfigSlice = Pick<DocusaurusConfig, 'webpack'>;

// Rspack is the default, Webpack is opt-in (deprecated)
// TODO Docusaurus v5: remove Webpack support
function isRspack(siteConfig: SiteConfigSlice): boolean {
  return !siteConfig.webpack;
}

export async function getCurrentBundler({
  siteConfig,
}: {
  siteConfig: SiteConfigSlice;
}): Promise<CurrentBundler> {
  if (isRspack(siteConfig)) {
    return {
      name: 'rspack',
      // CurrentBundler exposes Webpack types, see its type definition
      instance: rspack as unknown as typeof webpack,
    };
  }
  return {
    name: 'webpack',
    instance: (await import('webpack')).default,
  };
}

export async function getCSSExtractPlugin({
  currentBundler,
}: {
  currentBundler: CurrentBundler;
}): Promise<typeof MiniCssExtractPlugin> {
  if (currentBundler.name === 'rspack') {
    return rspack.CssExtractRspackPlugin as unknown as typeof MiniCssExtractPlugin;
  }
  return (await import('mini-css-extract-plugin')).default;
}

export async function getCopyPlugin({
  currentBundler,
}: {
  currentBundler: CurrentBundler;
}): Promise<typeof webpack.CopyPlugin> {
  if (currentBundler.name === 'rspack') {
    return rspack.CopyRspackPlugin as unknown as typeof webpack.CopyPlugin;
  }
  return currentBundler.instance.CopyPlugin;
}

export async function getProgressBarPlugin({
  currentBundler,
}: {
  currentBundler: CurrentBundler;
}): Promise<typeof WebpackBar> {
  if (currentBundler.name === 'rspack') {
    class CustomRspackProgressPlugin extends rspack.ProgressPlugin {
      constructor({name, color = 'green'}: {name?: string; color?: string}) {
        // Unfortunately rspack.ProgressPlugin does not have name/color options
        // See https://rspack.dev/plugins/webpack/progress-plugin
        super({
          prefix: name,
          template: `● {prefix:.bold} {bar:50.${color}/white.dim} ({percent}%) {wide_msg:.dim}`,
          progressChars: '██',
        });
      }
    }
    return CustomRspackProgressPlugin as unknown as typeof WebpackBar;
  }

  // Dynamic import resolves the ESM types, while "import type" resolves CJS
  return (await import('webpackbar')).default as unknown as typeof WebpackBar;
}

export async function registerBundlerTracing({
  currentBundler,
}: {
  currentBundler: CurrentBundler;
}): Promise<() => Promise<void>> {
  if (currentBundler.name === 'rspack') {
    // See https://rspack.dev/contribute/development/profiling
    // File can be opened with https://ui.perfetto.dev/
    if (process.env.DOCUSAURUS_RSPACK_TRACE) {
      // We use the env variable as the "filter" attribute
      // See values here: https://rspack.dev/contribute/development/tracing#tracing-filter
      let filter = process.env.DOCUSAURUS_RSPACK_TRACE;

      if (filter === 'true' || filter === '1') {
        // Default value recommended by the Rspack team
        // It's also what the CLI uses for the "overview" preset:
        // https://github.com/web-infra-dev/rspack/blob/v1.3.10/packages/rspack-cli/src/utils/profile.ts
        filter = 'info';
      }

      await rspack.experiments.globalTrace.register(
        filter,
        'perfetto',
        './rspack-tracing.pftrace',
      );

      console.info(`Rspack tracing registered, filter=${filter}`);

      return async () => {
        await rspack.experiments.globalTrace.cleanup();
        console.log(`Rspack tracing cleaned up, filter=${filter}`);
      };
    }
  }

  // We don't support Webpack tracing at the moment
  return async () => {
    // noop
  };
}
