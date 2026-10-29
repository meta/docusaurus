/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ConfigureWebpackResult} from '@docusaurus/types/src/plugin';
import type {CurrentBundler, LoadContext, Plugin} from '@docusaurus/types';
import type {PluginOptions, Options} from './options';

type BundlerConfig = ConfigureWebpackResult;

type RsdoctorOptions = PluginOptions['rsdoctorOptions'];

type CreateBundlerConfig = (params: {name: string}) => BundlerConfig;

// Rsdoctor v2 only supports Rspack, Webpack sites keep using Rsdoctor v1
// Each Rsdoctor package is imported lazily, only for the current bundler
async function getCreateBundlerConfig({
  currentBundlerName,
  rsdoctorOptions,
}: {
  currentBundlerName: CurrentBundler['name'];
  rsdoctorOptions: RsdoctorOptions;
}): Promise<CreateBundlerConfig> {
  return currentBundlerName === 'rspack'
    ? getCreateRspackConfig(rsdoctorOptions)
    : getCreateWebpackConfig(rsdoctorOptions);
}

async function getCreateRspackConfig(
  rsdoctorOptions: RsdoctorOptions,
): Promise<CreateBundlerConfig> {
  const {RsdoctorRspackPlugin, migrateRsdoctorOptions} =
    await import('@rsdoctor/core');
  // Rsdoctor v1 options keep working, with a warning to migrate them
  // A single instance applied to both compilers merges them in one report
  const plugin = new RsdoctorRspackPlugin(
    migrateRsdoctorOptions(rsdoctorOptions),
  );
  return ({name}) => ({
    // Rsdoctor v2 names each compiler report after the compiler name
    name,
    plugins: [plugin] as unknown as BundlerConfig['plugins'],
  });
}

async function getCreateWebpackConfig(
  rsdoctorOptions: RsdoctorOptions,
): Promise<CreateBundlerConfig> {
  const {RsdoctorWebpackMultiplePlugin} =
    await import('@rsdoctor/webpack-plugin');
  return ({name}) => ({
    plugins: [
      new RsdoctorWebpackMultiplePlugin({name, ...rsdoctorOptions}),
    ] as unknown as BundlerConfig['plugins'],
  });
}

export default (async function pluginRsdoctor(
  context: LoadContext,
  options: PluginOptions,
): Promise<Plugin | null> {
  const createBundlerConfig = await getCreateBundlerConfig({
    currentBundlerName: context.currentBundler.name,
    rsdoctorOptions: options.rsdoctorOptions,
  });
  return {
    name: 'docusaurus-plugin-rsdoctor',
    configureWebpack: (__config, isServer) => {
      return createBundlerConfig({name: isServer ? 'server' : 'client'});
    },
  };
});

export {validateOptions} from './options';

export type {PluginOptions, Options};
