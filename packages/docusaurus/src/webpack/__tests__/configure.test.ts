/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import * as path from 'node:path';
import * as webpack from 'webpack';
import {fromPartial} from '@total-typescript/shoehorn';
import {
  applyConfigureWebpack,
  applyConfigurePostCss,
  executePluginsConfigureWebpack,
} from '../configure';
import {createTestConfigureWebpackUtils} from './testUtils';
import type {Configuration} from 'webpack';
import type {LoadedPlugin, Plugin} from '@docusaurus/types';

const isServer = false;

describe('extending generated webpack config', () => {
  it('direct mutation on generated webpack config object', async () => {
    const utils = await createTestConfigureWebpackUtils();

    // Fake generated webpack config
    let config: Configuration = {
      output: {
        path: __dirname,
        filename: 'bundle.js',
      },
    };

    const configureWebpack: NonNullable<Plugin['configureWebpack']> = (
      generatedConfig,
      isServerParam,
    ) => {
      if (!isServerParam) {
        generatedConfig.entry = 'entry.js';
        generatedConfig.output = {
          path: path.join(__dirname, 'dist'),
          filename: 'new.bundle.js',
        };
      }
      // Implicitly returning undefined to test null-safety
    };

    config = applyConfigureWebpack({
      configureWebpack,
      config,
      isServer,
      configureWebpackUtils: utils,
      content: {
        content: 42,
      },
    });
    expect(config).toEqual({
      entry: 'entry.js',
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'new.bundle.js',
      },
    });
    const errors = webpack.validate(config);
    expect(errors).toBeUndefined();
  });

  it('webpack-merge with user webpack config object', async () => {
    const utils = await createTestConfigureWebpackUtils();

    let config: Configuration = {
      output: {
        path: __dirname,
        filename: 'bundle.js',
      },
    };

    const configureWebpack: Plugin['configureWebpack'] = () => ({
      entry: 'entry.js',
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'new.bundle.js',
      },
    });

    config = applyConfigureWebpack({
      configureWebpack,
      config,
      isServer,
      configureWebpackUtils: utils,
      content: {
        content: 42,
      },
    });
    expect(config).toEqual({
      entry: 'entry.js',
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'new.bundle.js',
      },
    });
    const errors = webpack.validate(config);
    expect(errors).toBeUndefined();
  });

  it('webpack-merge with custom strategy', async () => {
    const utils = await createTestConfigureWebpackUtils();

    const config: Configuration = {
      module: {
        rules: [{use: 'xxx'}, {use: 'yyy'}],
      },
    };

    const createConfigureWebpack =
      (mergeStrategy?: {
        [key: string]: 'prepend' | 'append';
      }): NonNullable<Plugin['configureWebpack']> =>
      () => ({
        module: {
          rules: [{use: 'zzz'}],
        },
        mergeStrategy,
      });

    const defaultStrategyMergeConfig = applyConfigureWebpack({
      configureWebpack: createConfigureWebpack(),
      config,
      isServer,
      configureWebpackUtils: utils,
      content: {content: 42},
    });
    expect(defaultStrategyMergeConfig).toEqual({
      module: {
        rules: [{use: 'xxx'}, {use: 'yyy'}, {use: 'zzz'}],
      },
    });

    const prependRulesStrategyConfig = applyConfigureWebpack({
      configureWebpack: createConfigureWebpack({'module.rules': 'prepend'}),
      config,
      isServer,
      configureWebpackUtils: utils,
      content: {content: 42},
    });
    expect(prependRulesStrategyConfig).toEqual({
      module: {
        rules: [{use: 'zzz'}, {use: 'xxx'}, {use: 'yyy'}],
      },
    });

    const uselessMergeStrategyConfig = applyConfigureWebpack({
      configureWebpack: createConfigureWebpack({
        uselessAttributeName: 'append',
      }),
      config,
      isServer,
      configureWebpackUtils: utils,
      content: {content: 42},
    });
    expect(uselessMergeStrategyConfig).toEqual({
      module: {
        rules: [{use: 'xxx'}, {use: 'yyy'}, {use: 'zzz'}],
      },
    });
  });
});

describe('extending PostCSS', () => {
  it('user plugin should be appended in PostCSS loader', () => {
    let webpackConfig: Configuration = {
      output: {
        path: __dirname,
        filename: 'bundle.js',
      },
      module: {
        rules: [
          {
            test: 'any',
            use: [
              {
                loader: 'some-loader-1',
                options: {},
              },
              {
                loader: 'some-loader-2',
                options: {},
              },
              {
                loader: 'postcss-loader-1',
                options: {
                  postcssOptions: {
                    plugins: [['default-postcss-loader-1-plugin']],
                  },
                },
              },
              {
                loader: 'some-loader-3',
                options: {},
              },
            ],
          },
          {
            test: '2nd-test',
            use: [
              {
                loader: 'postcss-loader-2',
                options: {
                  postcssOptions: {
                    plugins: [['default-postcss-loader-2-plugin']],
                  },
                },
              },
            ],
          },
        ],
      },
    };

    function createFakePlugin(name: string) {
      return [name, {}];
    }

    // Run multiple times: ensure last run does not override previous runs
    webpackConfig = applyConfigurePostCss(
      (postCssOptions) => ({
        ...postCssOptions,
        plugins: [
          ...postCssOptions.plugins,
          createFakePlugin('postcss-plugin-1'),
        ],
      }),
      webpackConfig,
    );

    webpackConfig = applyConfigurePostCss(
      (postCssOptions) => ({
        ...postCssOptions,
        plugins: [
          createFakePlugin('postcss-plugin-2'),
          ...postCssOptions.plugins,
        ],
      }),
      webpackConfig,
    );

    webpackConfig = applyConfigurePostCss(
      (postCssOptions) => ({
        ...postCssOptions,
        plugins: [
          ...postCssOptions.plugins,
          createFakePlugin('postcss-plugin-3'),
        ],
      }),
      webpackConfig,
    );

    // @ts-expect-error: relax type
    const postCssLoader1 = webpackConfig.module?.rules[0].use[2];
    expect(postCssLoader1.loader).toBe('postcss-loader-1');

    const pluginNames1 = postCssLoader1.options.postcssOptions.plugins.map(
      (p: unknown[]) => p[0],
    );
    expect(pluginNames1).toHaveLength(4);
    expect(pluginNames1).toEqual([
      'postcss-plugin-2',
      'default-postcss-loader-1-plugin',
      'postcss-plugin-1',
      'postcss-plugin-3',
    ]);

    // @ts-expect-error: relax type
    const postCssLoader2 = webpackConfig.module?.rules[1].use[0];
    expect(postCssLoader2.loader).toBe('postcss-loader-2');

    const pluginNames2 = postCssLoader2.options.postcssOptions.plugins.map(
      (p: unknown[]) => p[0],
    );
    expect(pluginNames2).toHaveLength(4);
    expect(pluginNames2).toEqual([
      'postcss-plugin-2',
      'default-postcss-loader-2-plugin',
      'postcss-plugin-1',
      'postcss-plugin-3',
    ]);
  });
});

describe('executePluginsConfigureWebpack', () => {
  function fakePlugin(partialPlugin: Partial<LoadedPlugin>): LoadedPlugin {
    return fromPartial({
      ...partialPlugin,
    });
  }

  it('can merge Webpack aliases of 2 plugins into base config', async () => {
    const utils = await createTestConfigureWebpackUtils();

    const config = executePluginsConfigureWebpack({
      config: {resolve: {alias: {'initial-alias': 'initial-alias-value'}}},
      isServer,
      configureWebpackUtils: utils,
      plugins: [
        fakePlugin({
          configureWebpack: () => {
            return {resolve: {alias: {'p1-alias': 'p1-alias-value'}}};
          },
        }),
        fakePlugin({
          configureWebpack: () => {
            return {resolve: {alias: {'p2-alias': 'p2-alias-value'}}};
          },
        }),
      ],
    });

    expect(config).toMatchInlineSnapshot(
      {},
      `
      {
        "resolve": {
          "alias": {
            "initial-alias": "initial-alias-value",
            "p1-alias": "p1-alias-value",
            "p2-alias": "p2-alias-value",
          },
        },
      }
    `,
    );
  });

  it('can configurePostCSS() for all loaders added through configureWebpack()', async () => {
    const utils = await createTestConfigureWebpackUtils();

    const config = executePluginsConfigureWebpack({
      config: {},
      isServer,
      configureWebpackUtils: utils,
      plugins: [
        fakePlugin({
          configurePostCss: (postCssOptions) => {
            // Imperative mutation should work
            postCssOptions.plugins.push('p1-added-postcss-plugin');
            return postCssOptions;
          },
          configureWebpack: () => {
            return {
              module: {
                rules: [
                  {
                    test: /\.module.scss$/,
                    use: 'some-loader',
                    options: {
                      postcssOptions: {
                        plugins: ['p1-initial-postcss-plugin'],
                      },
                    },
                  },
                ],
              },
            };
          },
        }),
        fakePlugin({
          configurePostCss: (postCssOptions) => {
            postCssOptions.plugins.push('p2-added-postcss-plugin');
            return postCssOptions;
          },
          configureWebpack: () => {
            return {
              module: {
                rules: [
                  {
                    test: /\.module.scss$/,
                    use: [
                      {
                        loader: 'postcss-loader',
                        options: {
                          postcssOptions: {
                            plugins: ['p2-initial-postcss-plugin'],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            };
          },
        }),
        fakePlugin({
          configurePostCss: (postCssOptions) => {
            // Functional/immutable copy mutation should work
            return {
              ...postCssOptions,
              plugins: [...postCssOptions.plugins, 'p3-added-postcss-plugin'],
            };
          },
          configureWebpack: () => {
            return {
              module: {
                rules: [
                  {
                    test: /\.module.scss$/,
                    oneOf: [
                      {
                        use: 'some-loader',
                        options: {
                          postcssOptions: {
                            plugins: ['p3-initial-postcss-plugin'],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            };
          },
        }),
      ],
    });

    expect(config.module!.rules!).toHaveLength(3);
    expect(config.module!.rules![0]).toMatchInlineSnapshot(`
      {
        "options": {
          "postcssOptions": {
            "plugins": [
              "p1-initial-postcss-plugin",
              "p1-added-postcss-plugin",
              "p2-added-postcss-plugin",
              "p3-added-postcss-plugin",
            ],
          },
        },
        "test": /\\\\\\.module\\.scss\\$/,
        "use": "some-loader",
      }
    `);
    expect(config.module!.rules![1]).toMatchInlineSnapshot(`
      {
        "test": /\\\\\\.module\\.scss\\$/,
        "use": [
          {
            "loader": "postcss-loader",
            "options": {
              "postcssOptions": {
                "plugins": [
                  "p2-initial-postcss-plugin",
                  "p1-added-postcss-plugin",
                  "p2-added-postcss-plugin",
                  "p3-added-postcss-plugin",
                ],
              },
            },
          },
        ],
      }
    `);
    expect(config.module!.rules![2]).toMatchInlineSnapshot(`
      {
        "oneOf": [
          {
            "options": {
              "postcssOptions": {
                "plugins": [
                  "p3-initial-postcss-plugin",
                  "p1-added-postcss-plugin",
                  "p2-added-postcss-plugin",
                  "p3-added-postcss-plugin",
                ],
              },
            },
            "use": "some-loader",
          },
        ],
        "test": /\\\\\\.module\\.scss\\$/,
      }
    `);
  });
});
