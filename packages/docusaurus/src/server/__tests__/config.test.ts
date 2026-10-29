/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {loadSiteConfig} from '../config';

describe('loadSiteConfig', () => {
  const siteDir = path.join(__dirname, '__fixtures__', 'config');

  it('website with valid siteConfig', async () => {
    const config = await loadSiteConfig({
      siteDir: path.join(__dirname, '__fixtures__', 'simple-site'),
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with ts + js config', async () => {
    const config = await loadSiteConfig({
      siteDir: path.join(
        __dirname,
        '__fixtures__',
        'config/sites/ts-and-js-site',
      ),
    });
    expect(config).toMatchSnapshot();
    // Docusaurus uses in priority a TS config
    expect(config.siteConfig.title).toBe('TS title');
    expect(config).not.toEqual({});
  });

  it('website with .cjs siteConfig', async () => {
    const config = await loadSiteConfig({siteDir});
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with valid config creator function', async () => {
    const config = await loadSiteConfig({
      siteDir,
      customConfigFilePath: 'createConfig.config.js',
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with valid async config', async () => {
    const config = await loadSiteConfig({
      siteDir,
      customConfigFilePath: 'configAsync.config.js',
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with valid async config creator function', async () => {
    const config = await loadSiteConfig({
      siteDir,
      customConfigFilePath: 'createConfigAsync.config.js',
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with valid JS CJS config', async () => {
    const config = await loadSiteConfig({
      siteDir,
      customConfigFilePath: 'configCJS.js',
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with valid JS ESM config', async () => {
    const config = await loadSiteConfig({
      siteDir,
      customConfigFilePath: 'configESM.js',
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with valid TypeScript CJS config', async () => {
    const config = await loadSiteConfig({
      siteDir,
      customConfigFilePath: 'configCJS.ts',
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with valid TypeScript ESM config', async () => {
    const config = await loadSiteConfig({
      siteDir,
      customConfigFilePath: 'configESM.ts',
    });
    expect(config).toMatchSnapshot();
    expect(config).not.toEqual({});
  });

  it('website with incomplete siteConfig', async () => {
    await expect(
      loadSiteConfig({
        siteDir,
        customConfigFilePath: 'incomplete.config.js',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: "url" is required
      ]
    `);
  });

  it('website with useless field (wrong field) in siteConfig', async () => {
    await expect(
      loadSiteConfig({
        siteDir,
        customConfigFilePath: 'wrong.config.js',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: These field(s) ("useLessField",) are not recognized in wrong.config.js.
      If you still want these fields to be in your configuration, put them in the "customFields" field.
      See https://docusaurus.io/docs/api/docusaurus-config/#customfields]
    `);
  });

  it('website with no siteConfig', async () => {
    await expect(
      loadSiteConfig({
        siteDir,
        customConfigFilePath: 'nonExistent.config.js',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Config file at "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/__fixtures__/config/nonExistent.config.js" not found.]`,
    );
  });
});
