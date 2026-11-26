/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import {rspack} from '@rspack/core';
import {createStyleLoadersFactory} from '../styleLoader';
import type {CurrentBundler} from '@docusaurus/types';

const currentBundler = {
  name: 'rspack',
  instance: rspack,
} as unknown as CurrentBundler;

async function getPresetEnvOptions() {
  const getStyleLoaders = await createStyleLoadersFactory({currentBundler});
  const postcssLoader = getStyleLoaders(false, {}).find(
    (loader) =>
      typeof loader === 'object' &&
      loader.loader === require.resolve('postcss-loader'),
  ) as {options: {postcssOptions: {plugins: [string, unknown][]}}};
  const [, presetEnvOptions] = postcssLoader.options.postcssOptions.plugins[0]!;
  return presetEnvOptions;
}

describe('createStyleLoadersFactory', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gives postcss-preset-env the default Browserslist queries', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(__dirname);
    await expect(getPresetEnvOptions()).resolves.toEqual({
      browsers: ['baseline widely available'],
    });
  });

  it("gives postcss-preset-env the site's Browserslist queries", async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(
      path.join(__dirname, '__fixtures__/siteWithBrowserslistConfig'),
    );
    await expect(getPresetEnvOptions()).resolves.toEqual({
      browsers: ['chrome 120'],
    });
  });
});
