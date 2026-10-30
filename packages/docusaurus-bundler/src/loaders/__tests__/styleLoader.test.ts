/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import postcss from 'postcss';
import postcssPresetEnv, {type pluginOptions} from 'postcss-preset-env';
import {createStyleLoadersFactory} from '../styleLoader';
import {getCurrentBundler} from '../../currentBundler';

// The selector suffix postcss-preset-env adds to emulate cascade layers
const CascadeLayersEmulationSelector = ':not(#\\#)';

// Emulating the order of 2 layers requires increasing selector specificity
const LayeredCSS = `
@layer base { .navbar { color: red; } }
@layer theme { .navbar { color: blue; } }
`;

async function createSiteDir(packageJson: object) {
  const siteDir = await fs.mkdtempDisposable(
    path.join(await fs.realpath(tmpdir()), 'docusaurus-style-loader-'),
  );
  await fs.writeFile(
    path.join(siteDir.path, 'package.json'),
    JSON.stringify(packageJson),
  );
  return siteDir;
}

// Returns the postcss-preset-env options of the client CSS loaders
// Browserslist reads the site config from the current working directory
async function getPostcssPresetEnvOptions(
  siteDir: string,
): Promise<pluginOptions> {
  vi.spyOn(process, 'cwd').mockReturnValue(siteDir);
  const currentBundler = await getCurrentBundler({siteConfig: {}});
  const getStyleLoaders = await createStyleLoadersFactory({currentBundler});
  const loaders = getStyleLoaders(false, {});
  const postcssLoader = loaders.find(
    (loader) => loader.loader === require.resolve('postcss-loader'),
  )!;
  const {postcssOptions} = postcssLoader.options as {
    postcssOptions: {plugins: [string, pluginOptions][]};
  };
  const [pluginName, pluginOptions] = postcssOptions.plugins[0]!;
  expect(pluginName).toBe(require.resolve('postcss-preset-env'));
  return pluginOptions;
}

async function transformCSS(css: string, options: pluginOptions) {
  const result = await postcss([postcssPresetEnv(options)]).process(css, {
    from: undefined,
  });
  return result.css;
}

describe('createStyleLoadersFactory postcss-preset-env', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('uses the Docusaurus default Browserslist queries', async () => {
    await using siteDir = await createSiteDir({});
    const options = await getPostcssPresetEnvOptions(siteDir.path);
    expect(options).toEqual({browsers: ['baseline widely available']});
  });

  it('uses the site Browserslist config', async () => {
    await using siteDir = await createSiteDir({browserslist: ['chrome 90']});
    const options = await getPostcssPresetEnvOptions(siteDir.path);
    expect(options).toEqual({browsers: ['chrome 90']});
  });

  it('uses the site Browserslist config of the current environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    await using siteDir = await createSiteDir({
      browserslist: {
        production: ['chrome 90'],
        development: ['last 1 chrome version'],
      },
    });
    const options = await getPostcssPresetEnvOptions(siteDir.path);
    expect(options).toEqual({browsers: ['last 1 chrome version']});
  });

  it('keeps cascade layers with the Docusaurus default Browserslist queries', async () => {
    await using siteDir = await createSiteDir({});
    const options = await getPostcssPresetEnvOptions(siteDir.path);
    const css = await transformCSS(LayeredCSS, options);
    expect(css).toContain('@layer theme');
    expect(css).not.toContain(CascadeLayersEmulationSelector);
  });

  it('emulates cascade layers for browsers that do not support them', async () => {
    await using siteDir = await createSiteDir({browserslist: ['chrome 90']});
    const options = await getPostcssPresetEnvOptions(siteDir.path);
    const css = await transformCSS(LayeredCSS, options);
    expect(css).not.toContain('@layer theme');
    expect(css).toContain(CascadeLayersEmulationSelector);
  });
});
