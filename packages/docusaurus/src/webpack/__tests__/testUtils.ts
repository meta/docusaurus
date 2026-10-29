/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import webpack from 'webpack';
import {rspack} from '@rspack/core';
import {getCurrentBundler} from '@docusaurus/bundler';
import {createConfigureWebpackUtils} from '../configure';
import {loadSiteFixture} from '../../server/__tests__/testUtils';
import type {Configuration} from 'webpack';
import type {Configuration as RspackConfiguration} from '@rspack/core';
import type {CurrentBundler, DocusaurusConfig, Props} from '@docusaurus/types';

type BundlerName = CurrentBundler['name'];

// Rspack is the default, Webpack is still supported but deprecated
export const BundlerNames: BundlerName[] = ['rspack', 'webpack'];

function getSiteConfigSlice(
  bundlerName: BundlerName,
): Pick<DocusaurusConfig, 'webpack'> {
  return {webpack: bundlerName === 'webpack' ? {} : undefined};
}

export function createTestConfigureWebpackUtils(
  bundlerName: BundlerName = 'rspack',
): ReturnType<typeof createConfigureWebpackUtils> {
  return createConfigureWebpackUtils({
    siteDir: path.join(__dirname, '__fixtures__', 'base_test_site'),
    siteConfig: getSiteConfigSlice(bundlerName),
  });
}

export async function loadBundlerSiteFixture(
  name: string,
  bundlerName: BundlerName,
): Promise<Props> {
  const {props} = await loadSiteFixture(name);
  const siteConfigSlice = getSiteConfigSlice(bundlerName);
  return {
    ...props,
    siteConfig: {...props.siteConfig, ...siteConfigSlice},
    currentBundler: await getCurrentBundler({siteConfig: siteConfigSlice}),
  };
}

// Rspack doesn't validate configs against a schema like Webpack does
// Creating a compiler is the closest: it normalizes the config, applies
// defaults and plugins, and throws for some invalid options
export function validateBundlerConfig(
  config: Configuration,
  bundlerName: BundlerName,
): void {
  if (bundlerName === 'webpack') {
    webpack.validate(config);
    return;
  }
  const compiler = rspack(config as unknown as RspackConfiguration);
  compiler.close(() => {});
}
