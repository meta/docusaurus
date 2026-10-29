/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getBabelOptions, getCustomBabelConfigFilePath} from '@docusaurus/babel';
import {getSwcLoaderOptions} from '../swc';
import {getCurrentBundler} from '../currentBundler';
import type {ConfigureWebpackUtils, DocusaurusConfig} from '@docusaurus/types';

async function createBabelJsLoaderFactory({
  siteDir,
}: {
  siteDir: string;
}): Promise<ConfigureWebpackUtils['getJSLoader']> {
  const configFile = await getCustomBabelConfigFilePath(siteDir);
  return ({isServer}) => {
    return {
      loader: require.resolve('babel-loader'),
      options: getBabelOptions({isServer, configFile}),
    };
  };
}

function createRspackSwcJsLoaderFactory(): ConfigureWebpackUtils['getJSLoader'] {
  const loader = 'builtin:swc-loader';
  return ({isServer}) => {
    return {
      loader,
      options: getSwcLoaderOptions({isServer}),
    };
  };
}

// Confusing: function that creates a function that creates actual js loaders
// This is done on purpose because the js loader factory is a public API
// It is injected in configureWebpack plugin lifecycle for plugin authors
export async function createJsLoaderFactory({
  siteDir,
  siteConfig,
}: {
  siteDir: string;
  siteConfig: Pick<DocusaurusConfig, 'webpack'>;
}): Promise<ConfigureWebpackUtils['getJSLoader']> {
  const currentBundler = await getCurrentBundler({siteConfig});
  if (currentBundler.name === 'rspack') {
    return createRspackSwcJsLoaderFactory();
  }

  const jsLoader = siteConfig.webpack?.jsLoader ?? 'babel';
  if (jsLoader instanceof Function) {
    return jsLoader;
  }
  if (jsLoader === 'babel') {
    return createBabelJsLoaderFactory({siteDir});
  }
  throw new Error(`Docusaurus bug: unexpected jsLoader value${jsLoader}`);
}
