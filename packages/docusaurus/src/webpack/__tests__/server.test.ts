/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import createServerConfig from '../server';
import {
  BundlerNames,
  createTestConfigureWebpackUtils,
  loadBundlerSiteFixture,
  validateBundlerConfig,
} from './testUtils';

describe.each(BundlerNames)('%s server config', (bundlerName) => {
  it('simple', async () => {
    const props = await loadBundlerSiteFixture('simple-site', bundlerName);
    const {config} = await createServerConfig({
      props,
      configureWebpackUtils: await createTestConfigureWebpackUtils(bundlerName),
    });
    validateBundlerConfig(config, bundlerName);
  });

  it('custom', async () => {
    const props = await loadBundlerSiteFixture('custom-site', bundlerName);
    const {config} = await createServerConfig({
      props,
      configureWebpackUtils: await createTestConfigureWebpackUtils(bundlerName),
    });
    validateBundlerConfig(config, bundlerName);
  });
});
