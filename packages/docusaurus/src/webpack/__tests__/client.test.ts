/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import {createBuildClientConfig, createStartClientConfig} from '../client';
import {
  BundlerNames,
  createTestConfigureWebpackUtils,
  loadBundlerSiteFixture,
  validateBundlerConfig,
} from './testUtils';

describe.each(BundlerNames)('%s client config', (bundlerName) => {
  it('simple start', async () => {
    const props = await loadBundlerSiteFixture('simple-site', bundlerName);
    const {clientConfig} = await createStartClientConfig({
      props,
      configureWebpackUtils: await createTestConfigureWebpackUtils(bundlerName),
      minify: false,
      poll: false,
    });
    validateBundlerConfig(clientConfig, bundlerName);
  });

  it('simple build', async () => {
    const props = await loadBundlerSiteFixture('simple-site', bundlerName);
    const {config} = await createBuildClientConfig({
      props,
      configureWebpackUtils: await createTestConfigureWebpackUtils(bundlerName),
      minify: false,
    });
    validateBundlerConfig(config, bundlerName);
  });

  it('custom start', async () => {
    const props = await loadBundlerSiteFixture('custom-site', bundlerName);
    const {clientConfig} = await createStartClientConfig({
      props,
      configureWebpackUtils: await createTestConfigureWebpackUtils(bundlerName),
      minify: false,
      poll: false,
    });
    validateBundlerConfig(clientConfig, bundlerName);
  });

  it('custom build', async () => {
    const props = await loadBundlerSiteFixture('custom-site', bundlerName);
    const {config} = await createBuildClientConfig({
      props,
      configureWebpackUtils: await createTestConfigureWebpackUtils(bundlerName),
      minify: false,
    });
    validateBundlerConfig(config, bundlerName);
  });
});
