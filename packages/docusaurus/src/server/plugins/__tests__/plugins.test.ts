/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {fromPartial} from '@total-typescript/shoehorn';
import {loadPlugins, reloadPlugin} from '../plugins';
import {DEFAULT_FUTURE_CONFIG} from '../../configValidation';
import type {LoadContext, Plugin, PluginConfig} from '@docusaurus/types';

type TestOptions = {translate?: boolean};

async function testLoad({
  plugins,
  themes,
  options = {},
}: {
  plugins: PluginConfig<any>[];
  themes: PluginConfig<any>[];
  options?: TestOptions;
}) {
  const siteDir = path.join(__dirname, '__fixtures__/site-with-plugin');

  const context = fromPartial<LoadContext>({
    siteDir,
    siteConfigPath: path.join(siteDir, 'docusaurus.config.js'),
    generatedFilesDir: path.join(siteDir, '.docusaurus'),
    outDir: path.join(siteDir, 'build'),
    i18n: {
      path: 'i18n',
      locales: ['en'],
      currentLocale: 'en',
      defaultLocale: 'en',
      localeConfigs: {en: {translate: options.translate ?? true}},
    },
    siteConfig: {
      baseUrl: '/',
      trailingSlash: true,
      future: DEFAULT_FUTURE_CONFIG,
      themeConfig: {},
      staticDirectories: [],
      presets: [],
      plugins,
      themes,
    },
  });

  const result = await loadPlugins(context);

  return {context, ...result};
}

const SyntheticPluginNames = [
  'docusaurus-bootstrap-plugin',
  'docusaurus-mdx-fallback-plugin',
];

async function testPlugin<Content = unknown>(
  pluginConfig: PluginConfig<Content>,
  options?: TestOptions,
) {
  const {context, plugins, routes, globalData} = await testLoad({
    plugins: [pluginConfig],
    themes: [],
    options,
  });

  const nonSyntheticPlugins = plugins.filter(
    (p) => !SyntheticPluginNames.includes(p.name),
  );
  expect(nonSyntheticPlugins).toHaveLength(1);
  const plugin = nonSyntheticPlugins[0]!;
  expect(plugin).toBeDefined();

  return {context, plugin, routes, globalData};
}

describe('loadPlugins', () => {
  it('registers default synthetic plugins', async () => {
    const {plugins, routes, globalData} = await testLoad({
      plugins: [],
      themes: [],
    });
    // This adds some default synthetic plugins by default
    expect(plugins.map((p) => p.name)).toEqual(SyntheticPluginNames);
    expect(routes).toEqual([]);
    expect(globalData).toEqual({});
  });

  it('simplest plugin', async () => {
    const {plugin, routes, globalData} = await testPlugin(() => ({
      name: 'plugin-name',
    }));
    expect(plugin.name).toBe('plugin-name');
    expect(routes).toEqual([]);
    expect(globalData).toEqual({});
  });

  it('plugin adding routes with absolute module paths', async () => {
    const {routes} = await testPlugin((context) => ({
      name: 'plugin-name',
      async contentLoaded({actions}) {
        const dataPath = await actions.createData('data.json', {foo: 'bar'});
        actions.addRoute({
          path: '/foo',
          component: path.join(context.siteDir, 'src', 'Comp.js'),
          modules: {data: dataPath},
          context: {dataContext: dataPath},
        });
      },
    }));

    expect(routes).toMatchInlineSnapshot(`
      [
        {
          "component": "@site/src/Comp.js",
          "context": {
            "data": {
              "dataContext": "@generated/plugin-name/default/data.json",
            },
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "modules": {
            "data": "@generated/plugin-name/default/data.json",
          },
          "path": "/foo/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
        },
      ]
    `);
  });

  describe('typical plugin', () => {
    function typicalPlugin(options: TestOptions) {
      return testPlugin(
        () => ({
          name: 'plugin-name',
          loadContent: () => ({name: 'Toto', age: 42}),
          translateContent: ({content}) => ({
            ...content,
            name: `${content.name} (translated)`,
          }),
          contentLoaded({content, actions}) {
            actions.addRoute({
              path: '/foo',
              component: 'Comp',
              modules: {someModule: 'someModulePath'},
              context: {someContext: 'someContextPath'},
            });
            actions.setGlobalData({
              globalName: content.name,
              globalAge: content.age,
            });
          },
        }),
        options,
      );
    }

    it('translated: true', async () => {
      const {plugin, routes, globalData} = await typicalPlugin({
        translate: true,
      });

      expect(plugin.content).toMatchInlineSnapshot(`
              {
                "age": 42,
                "name": "Toto (translated)",
              }
          `);
      expect(routes).toMatchInlineSnapshot(`
              [
                {
                  "component": "Comp",
                  "context": {
                    "data": {
                      "someContext": "someContextPath",
                    },
                    "plugin": "@generated/plugin-name/default/__plugin.json",
                  },
                  "modules": {
                    "someModule": "someModulePath",
                  },
                  "path": "/foo/",
                  "plugin": {
                    "id": "default",
                    "name": "plugin-name",
                  },
                },
              ]
          `);
      expect(globalData).toMatchInlineSnapshot(`
              {
                "plugin-name": {
                  "default": {
                    "globalAge": 42,
                    "globalName": "Toto (translated)",
                  },
                },
              }
          `);
    });

    it('translated: false', async () => {
      const {plugin, routes, globalData} = await typicalPlugin({
        translate: false,
      });

      expect(plugin.content).toMatchInlineSnapshot(`
        {
          "age": 42,
          "name": "Toto",
        }
      `);
      expect(routes).toMatchInlineSnapshot(`
              [
                {
                  "component": "Comp",
                  "context": {
                    "data": {
                      "someContext": "someContextPath",
                    },
                    "plugin": "@generated/plugin-name/default/__plugin.json",
                  },
                  "modules": {
                    "someModule": "someModulePath",
                  },
                  "path": "/foo/",
                  "plugin": {
                    "id": "default",
                    "name": "plugin-name",
                  },
                },
              ]
          `);
      expect(globalData).toMatchInlineSnapshot(`
        {
          "plugin-name": {
            "default": {
              "globalAge": 42,
              "globalName": "Toto",
            },
          },
        }
      `);
    });
  });

  it('plugin with options', async () => {
    const pluginOptions = {id: 'plugin-id', someOption: 42};

    const {plugin, routes, globalData} = await testPlugin([
      (_context, options) => ({
        name: 'plugin-name',
        loadContent: () => ({options, name: 'Toto'}),
        contentLoaded({content, actions}) {
          actions.addRoute({
            path: '/foo',
            component: 'Comp',
          });
          actions.setGlobalData({
            // @ts-expect-error: TODO fix plugin/option type inference issue
            globalName: content.name,
            // @ts-expect-error: TODO fix plugin/option type inference issue
            globalSomeOption: content.options.someOption,
          });
        },
      }),
      pluginOptions,
    ]);

    expect(plugin.name).toBe('plugin-name');
    expect(plugin.options).toEqual(pluginOptions);
    expect(plugin.content).toMatchInlineSnapshot(`
      {
        "name": "Toto",
        "options": {
          "id": "plugin-id",
          "someOption": 42,
        },
      }
    `);

    expect(routes).toMatchInlineSnapshot(`
      [
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/plugin-id/__plugin.json",
          },
          "path": "/foo/",
          "plugin": {
            "id": "plugin-id",
            "name": "plugin-name",
          },
        },
      ]
    `);
    expect(globalData).toMatchInlineSnapshot(`
      {
        "plugin-name": {
          "plugin-id": {
            "globalName": "Toto",
            "globalSomeOption": 42,
          },
        },
      }
    `);
  });

  it('plugin with nested route context', async () => {
    const {routes} = await testPlugin(() => ({
      name: 'plugin-name',
      contentLoaded({actions}) {
        actions.addRoute({
          path: '/parent',
          component: 'Comp',
          context: {parentContext: 'parentContextPath'},
          routes: [
            {
              path: '/parent/child',
              component: 'Comp',
              context: {childContext: 'childContextPath'},
            },
          ],
        });
      },
    }));

    expect(routes).toMatchInlineSnapshot(`
      [
        {
          "component": "Comp",
          "context": {
            "data": {
              "parentContext": "parentContextPath",
            },
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/parent/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
          "routes": [
            {
              "component": "Comp",
              "context": {
                "data": {
                  "childContext": "childContextPath",
                },
              },
              "path": "/parent/child/",
            },
          ],
        },
      ]
    `);
  });

  it('plugin with This binding', async () => {
    const {plugin, routes, globalData} = await testPlugin(
      () =>
        ({
          name: 'plugin-name',
          someAttribute: 'val',
          async loadContent() {
            return this.someAttribute;
          },
          async contentLoaded({content, actions}) {
            actions.setGlobalData({
              content,
              someAttributeGlobal: this.someAttribute,
            });
          },
        }) as Plugin & ThisType<{someAttribute: string}>,
    );

    expect(plugin.content).toMatchInlineSnapshot(`"val"`);
    expect(routes).toMatchInlineSnapshot(`[]`);
    expect(globalData).toMatchInlineSnapshot(`
      {
        "plugin-name": {
          "default": {
            "content": "val",
            "someAttributeGlobal": "val",
          },
        },
      }
    `);
  });

  it('plugin with contentLoaded + allContentLoaded lifecycle', async () => {
    const {routes, globalData} = await testPlugin(() => ({
      name: 'plugin-name',
      contentLoaded({actions}) {
        actions.addRoute({
          path: '/contentLoadedRouteParent',
          component: 'Comp',
          routes: [
            {path: '/contentLoadedRouteParent/child', component: 'Comp'},
          ],
        });
        actions.addRoute({
          path: '/contentLoadedRouteSingle',
          component: 'Comp',
        });
        actions.setGlobalData({
          globalContentLoaded: 'val1',
          globalOverridden: 'initial-value',
        });
      },
      allContentLoaded({actions}) {
        actions.addRoute({
          path: '/allContentLoadedRouteParent',
          component: 'Comp',
          routes: [
            {path: '/allContentLoadedRouteParent/child', component: 'Comp'},
          ],
        });
        actions.addRoute({
          path: '/allContentLoadedRouteSingle',
          component: 'Comp',
        });
        actions.setGlobalData({
          globalAllContentLoaded: 'val2',
          globalOverridden: 'override-value',
        });
      },
    }));

    // Routes of both lifecycles are appropriately sorted
    expect(routes).toMatchInlineSnapshot(`
      [
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/allContentLoadedRouteSingle/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/contentLoadedRouteSingle/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/allContentLoadedRouteParent/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
          "routes": [
            {
              "component": "Comp",
              "path": "/allContentLoadedRouteParent/child/",
            },
          ],
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/contentLoadedRouteParent/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
          "routes": [
            {
              "component": "Comp",
              "path": "/contentLoadedRouteParent/child/",
            },
          ],
        },
      ]
    `);

    expect(globalData).toMatchInlineSnapshot(`
      {
        "plugin-name": {
          "default": {
            "globalAllContentLoaded": "val2",
            "globalContentLoaded": "val1",
            "globalOverridden": "override-value",
          },
        },
      }
    `);
  });
});

describe('reloadPlugin', () => {
  it('can reload a single complex plugin with same content', async () => {
    const plugin: PluginConfig = () => ({
      name: 'plugin-name',
      contentLoaded({actions}) {
        actions.addRoute({
          path: '/contentLoadedRouteParent',
          component: 'Comp',
          routes: [
            {path: '/contentLoadedRouteParent/child', component: 'Comp'},
          ],
        });
        actions.addRoute({
          path: '/contentLoadedRouteSingle',
          component: 'Comp',
        });
        actions.setGlobalData({
          globalContentLoaded: 'val1',
          globalOverridden: 'initial-value',
        });
      },
      allContentLoaded({actions}) {
        actions.addRoute({
          path: '/allContentLoadedRouteParent',
          component: 'Comp',
          routes: [
            {path: '/allContentLoadedRouteParent/child', component: 'Comp'},
          ],
        });
        actions.addRoute({
          path: '/allContentLoadedRouteSingle',
          component: 'Comp',
        });
        actions.setGlobalData({
          globalAllContentLoaded: 'val2',
          globalOverridden: 'override-value',
        });
      },
    });

    const loadResult = await testLoad({
      plugins: [plugin],
      themes: [],
    });
    const reloadResult = await reloadPlugin({
      context: loadResult.context,
      plugins: loadResult.plugins,
      pluginIdentifier: {name: 'plugin-name', id: 'default'},
    });

    expect(loadResult.routes).toEqual(reloadResult.routes);
    expect(loadResult.globalData).toEqual(reloadResult.globalData);
    expect(reloadResult.routes).toMatchInlineSnapshot(`
      [
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/allContentLoadedRouteSingle/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/contentLoadedRouteSingle/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/allContentLoadedRouteParent/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
          "routes": [
            {
              "component": "Comp",
              "path": "/allContentLoadedRouteParent/child/",
            },
          ],
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name/default/__plugin.json",
          },
          "path": "/contentLoadedRouteParent/",
          "plugin": {
            "id": "default",
            "name": "plugin-name",
          },
          "routes": [
            {
              "component": "Comp",
              "path": "/contentLoadedRouteParent/child/",
            },
          ],
        },
      ]
    `);
    expect(reloadResult.globalData).toMatchInlineSnapshot(`
      {
        "plugin-name": {
          "default": {
            "globalAllContentLoaded": "val2",
            "globalContentLoaded": "val1",
            "globalOverridden": "override-value",
          },
        },
      }
    `);
  });

  it('can reload plugins in real-world setup', async () => {
    let isPlugin1Reload = false;

    const plugin1: PluginConfig = () => ({
      name: 'plugin-name-1',
      contentLoaded({actions}) {
        actions.addRoute({
          path: isPlugin1Reload
            ? '/contentLoaded-route-reload'
            : '/contentLoaded-route-initial',
          component: 'Comp',
        });
        actions.setGlobalData({
          contentLoadedVal: isPlugin1Reload
            ? 'contentLoaded-val-reload'
            : 'contentLoaded-val-initial',
        });
      },
      allContentLoaded({actions}) {
        actions.addRoute({
          path: isPlugin1Reload
            ? '/allContentLoaded-route-reload'
            : '/allContentLoaded-route-initial',
          component: 'Comp',
        });
        actions.setGlobalData({
          allContentLoadedVal: isPlugin1Reload
            ? 'allContentLoaded-val-reload'
            : 'allContentLoaded-val-initial',
        });
      },
    });

    const plugin2: PluginConfig = () => ({
      name: 'plugin-name-2',
      contentLoaded({actions}) {
        actions.addRoute({
          path: '/plugin-2-route',
          component: 'Comp',
        });
        actions.setGlobalData({plugin2Val: 'val'});
      },
    });

    const loadResult = await testLoad({
      plugins: [plugin1, plugin2],
      themes: [],
    });

    isPlugin1Reload = true;

    const reloadResult = await reloadPlugin({
      context: loadResult.context,
      plugins: loadResult.plugins,
      pluginIdentifier: {name: 'plugin-name-1', id: 'default'},
    });

    expect(loadResult.routes).not.toEqual(reloadResult.routes);
    expect(loadResult.globalData).not.toEqual(reloadResult.globalData);
    expect(loadResult.routes).toMatchInlineSnapshot(`
      [
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name-1/default/__plugin.json",
          },
          "path": "/allContentLoaded-route-initial/",
          "plugin": {
            "id": "default",
            "name": "plugin-name-1",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name-1/default/__plugin.json",
          },
          "path": "/contentLoaded-route-initial/",
          "plugin": {
            "id": "default",
            "name": "plugin-name-1",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name-2/default/__plugin.json",
          },
          "path": "/plugin-2-route/",
          "plugin": {
            "id": "default",
            "name": "plugin-name-2",
          },
        },
      ]
    `);
    expect(loadResult.globalData).toMatchInlineSnapshot(`
      {
        "plugin-name-1": {
          "default": {
            "allContentLoadedVal": "allContentLoaded-val-initial",
            "contentLoadedVal": "contentLoaded-val-initial",
          },
        },
        "plugin-name-2": {
          "default": {
            "plugin2Val": "val",
          },
        },
      }
    `);
    expect(reloadResult.routes).toMatchInlineSnapshot(`
      [
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name-1/default/__plugin.json",
          },
          "path": "/allContentLoaded-route-reload/",
          "plugin": {
            "id": "default",
            "name": "plugin-name-1",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name-1/default/__plugin.json",
          },
          "path": "/contentLoaded-route-reload/",
          "plugin": {
            "id": "default",
            "name": "plugin-name-1",
          },
        },
        {
          "component": "Comp",
          "context": {
            "plugin": "@generated/plugin-name-2/default/__plugin.json",
          },
          "path": "/plugin-2-route/",
          "plugin": {
            "id": "default",
            "name": "plugin-name-2",
          },
        },
      ]
    `);
    expect(reloadResult.globalData).toMatchInlineSnapshot(`
      {
        "plugin-name-1": {
          "default": {
            "allContentLoadedVal": "allContentLoaded-val-reload",
            "contentLoadedVal": "contentLoaded-val-reload",
          },
        },
        "plugin-name-2": {
          "default": {
            "plugin2Val": "val",
          },
        },
      }
    `);

    // Trying to reload again one plugin or the other should give
    // the same result because the plugin content doesn't change
    const reloadResult2 = await reloadPlugin({
      context: loadResult.context,
      plugins: reloadResult.plugins,
      pluginIdentifier: {name: 'plugin-name-1', id: 'default'},
    });
    expect(reloadResult2.routes).toEqual(reloadResult.routes);
    expect(reloadResult2.globalData).toEqual(reloadResult.globalData);

    const reloadResult3 = await reloadPlugin({
      context: loadResult.context,
      plugins: reloadResult2.plugins,
      pluginIdentifier: {name: 'plugin-name-2', id: 'default'},
    });
    expect(reloadResult3.routes).toEqual(reloadResult.routes);
    expect(reloadResult3.globalData).toEqual(reloadResult.globalData);
  });
});
