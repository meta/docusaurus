/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {createJsLoaderFactory} from '../jsLoader';

import type {RuleSetRule} from 'webpack';

type SiteConfigSlice = Parameters<
  typeof createJsLoaderFactory
>[0]['siteConfig'];

describe('createJsLoaderFactory', () => {
  function testJsLoaderFactory(
    siteConfig?: SiteConfigSlice,
    siteDir: string = __dirname,
  ) {
    return createJsLoaderFactory({
      siteDir,
      siteConfig: {webpack: siteConfig?.webpack},
    });
  }

  it('createJsLoaderFactory defaults to built-in SWC loader with Rspack', async () => {
    const createJsLoader = await testJsLoaderFactory();
    expect(createJsLoader({isServer: true}).loader).toBe('builtin:swc-loader');
    expect(createJsLoader({isServer: false}).loader).toBe('builtin:swc-loader');
  });

  it('createJsLoaderFactory defaults to babel loader with Webpack', async () => {
    const createJsLoader = await testJsLoaderFactory({webpack: {}});
    expect(createJsLoader({isServer: true}).loader).toBe(
      require.resolve('babel-loader'),
    );
    expect(createJsLoader({isServer: false}).loader).toBe(
      require.resolve('babel-loader'),
    );
  });

  it('createJsLoaderFactory accepts babel loader preset', async () => {
    const createJsLoader = await testJsLoaderFactory({
      webpack: {jsLoader: 'babel'},
    });
    expect(createJsLoader({isServer: true}).loader).toBe(
      require.resolve('babel-loader'),
    );
    expect(createJsLoader({isServer: false}).loader).toBe(
      require.resolve('babel-loader'),
    );
  });

  it('createJsLoaderFactory uses the Docusaurus Babel preset with Webpack', async () => {
    const createJsLoader = await testJsLoaderFactory({webpack: {}});
    expect(createJsLoader({isServer: true}).options).toEqual({
      presets: [require.resolve('@docusaurus/babel/preset')],
      babelrc: false,
      configFile: false,
      caller: {name: 'server'},
    });
  });

  it('createJsLoaderFactory uses the site Babel config file with Webpack', async () => {
    const siteDir = path.join(
      __dirname,
      '__fixtures__',
      'siteWithBabelConfigFile',
    );
    const createJsLoader = await testJsLoaderFactory({webpack: {}}, siteDir);
    expect(createJsLoader({isServer: false}).options).toEqual({
      babelrc: false,
      configFile: path.join(siteDir, 'babel.config.js'),
      caller: {name: 'client'},
    });
  });

  it('createJsLoaderFactory accepts custom loader', async () => {
    const createJsLoader = await testJsLoaderFactory({
      webpack: {
        jsLoader: ({isServer}) => {
          return {loader: `my-loader-${isServer ? 'server' : 'client'}`};
        },
      },
    });
    expect(createJsLoader({isServer: true}).loader).toBe('my-loader-server');
    expect(createJsLoader({isServer: false}).loader).toBe('my-loader-client');
  });

  it('createJsLoaderFactory accepts loaders with preset', async () => {
    const createJsLoader = await testJsLoaderFactory({
      webpack: {jsLoader: 'babel'},
    });

    expect(
      createJsLoader({
        isServer: true,
      }).loader,
    ).toBe(require.resolve('babel-loader'));
    expect(
      createJsLoader({
        isServer: false,
      }).loader,
    ).toBe(require.resolve('babel-loader'));
  });

  it('createJsLoaderFactory allows customization', async () => {
    const customJSLoader = ({isServer}: {isServer: boolean}): RuleSetRule => ({
      loader: 'my-fast-js-loader',
      options: String(isServer),
    });

    const createJsLoader = await testJsLoaderFactory({
      webpack: {jsLoader: customJSLoader},
    });

    expect(
      createJsLoader({
        isServer: true,
      }),
    ).toEqual(customJSLoader({isServer: true}));
    expect(
      createJsLoader({
        isServer: false,
      }),
    ).toEqual(customJSLoader({isServer: false}));
  });
});
