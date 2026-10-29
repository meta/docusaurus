/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {loadPresets} from '../presets';
import type {LoadContext} from '@docusaurus/types';

describe('loadPresets', () => {
  it('no presets', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [],
      },
    } as unknown as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchInlineSnapshot(`
      {
        "plugins": [],
        "themes": [],
      }
    `);
  });

  it('cjs form', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          path.join(__dirname, '__fixtures__/presets/preset-plugins.cjs.js'),
        ],
      },
    } as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('esm form', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          path.join(__dirname, '__fixtures__/presets/preset-plugins.esm.js'),
        ],
      },
    } as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('ts form', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          path.join(__dirname, '__fixtures__/presets/preset-plugins.ts'),
        ],
      },
    } as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('string form composite', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          path.join(__dirname, '__fixtures__/presets/preset-plugins.cjs.js'),
          path.join(__dirname, '__fixtures__/presets/preset-themes.js'),
        ],
      },
    } as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('array form', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          [path.join(__dirname, '__fixtures__/presets/preset-plugins.cjs.js')],
        ],
      },
    } as unknown as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('array form with options', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          [
            path.join(__dirname, '__fixtures__/presets/preset-plugins.cjs.js'),
            {docs: {path: '../'}},
          ],
        ],
      },
    } as unknown as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('array form composite', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          [
            path.join(__dirname, '__fixtures__/presets/preset-plugins.cjs.js'),
            {docs: {path: '../'}},
          ],
          [
            path.join(__dirname, '__fixtures__/presets/preset-themes.js'),
            {algolia: {trackingID: 'foo'}},
          ],
        ],
      },
    } as unknown as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('mixed form', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          [
            path.join(__dirname, '__fixtures__/presets/preset-plugins.cjs.js'),
            {docs: {path: '../'}},
          ],
          path.join(__dirname, '__fixtures__/presets/preset-themes.js'),
        ],
      },
    } as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });

  it('mixed form with themes', async () => {
    const context = {
      siteConfigPath: __dirname,
      siteConfig: {
        presets: [
          [
            path.join(__dirname, '__fixtures__/presets/preset-plugins.cjs.js'),
            {docs: {path: '../'}},
          ],
          false,
          null,
          undefined,
          path.join(__dirname, '__fixtures__/presets/preset-themes.js'),
          path.join(__dirname, '__fixtures__/presets/preset-mixed.js'),
        ],
      },
    } as LoadContext;
    const presets = await loadPresets(context);
    expect(presets).toMatchSnapshot();
  });
});
