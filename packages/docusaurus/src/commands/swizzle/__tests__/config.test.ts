/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import {getThemeSwizzleConfig, normalizeSwizzleConfig} from '../config';
import type {
  InitializedPlugin,
  PluginModule,
  SwizzleConfig,
} from '@docusaurus/types';
import type {SwizzlePlugin} from '../common';

describe('normalizeSwizzleConfig', () => {
  it(`validate no components config`, () => {
    const config: SwizzleConfig = {
      components: {},
    };
    expect(normalizeSwizzleConfig(config)).toEqual(config);
  });

  it(`validate complete config`, () => {
    const config: SwizzleConfig = {
      components: {
        SomeComponent: {
          actions: {
            wrap: 'safe',
            eject: 'unsafe',
          },
          description: 'SomeComponent description',
        },
        'Other/Component': {
          actions: {
            wrap: 'forbidden',
            eject: 'unsafe',
          },
          description: 'Other/Component description',
        },
      },
    };
    expect(normalizeSwizzleConfig(config)).toEqual(config);
  });

  it(`normalize partial config`, () => {
    const config: SwizzleConfig = {
      components: {
        SomeComponent: {
          // @ts-expect-error: incomplete actions map
          actions: {
            eject: 'safe',
          },
          description: 'SomeComponent description',
        },
        'Other/Component': {
          // @ts-expect-error: incomplete actions map
          actions: {
            wrap: 'forbidden',
          },
        },
      },
    };
    expect(normalizeSwizzleConfig(config)).toMatchSnapshot();
  });

  it(`reject missing components`, () => {
    // @ts-expect-error: incomplete actions map
    const config: SwizzleConfig = {};

    expect(() =>
      normalizeSwizzleConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Swizzle config does not match expected schema: "components" is required]`,
    );
  });

  it(`reject invalid action name`, () => {
    const config: SwizzleConfig = {
      components: {
        MyComponent: {
          actions: {
            wrap: 'safe',
            eject: 'unsafe',
            // @ts-expect-error: on purpose
            bad: 'safe',
          },
        },
      },
    };

    expect(() =>
      normalizeSwizzleConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Swizzle config does not match expected schema: "components.MyComponent.actions.bad" is not allowed]`,
    );
  });

  it(`reject invalid action status`, () => {
    const config: SwizzleConfig = {
      components: {
        MyComponent: {
          actions: {
            wrap: 'safe',
            // @ts-expect-error: on purpose
            eject: 'invalid-status',
          },
        },
      },
    };

    expect(() =>
      normalizeSwizzleConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Swizzle config does not match expected schema: "components.MyComponent.actions.eject" must be one of [safe, unsafe, forbidden]]`,
    );
  });
});

describe('getThemeSwizzleConfig', () => {
  const themeName = 'my-theme';

  const swizzleConfig: SwizzleConfig = {
    components: {
      SomeComponent: {
        actions: {
          eject: 'safe',
          wrap: 'unsafe',
        },
        description: 'SomeComponent description',
      },
    },
  };

  function createSwizzlePlugins({
    pluginStatics,
    moduleNamedExports,
  }: {
    pluginStatics?: Partial<PluginModule>;
    moduleNamedExports?: Partial<PluginModule>;
  }): SwizzlePlugin[] {
    const plugin: PluginModule = Object.assign(() => null, pluginStatics);
    // What require() returns for a transpiled ES module: not a function
    const module = {default: plugin, ...moduleNamedExports};
    return [
      {
        instance: {
          name: themeName,
          version: {type: 'local'},
          getThemePath: () => './theme',
        } as InitializedPlugin,
        plugin: {
          plugin,
          options: {},
          pluginModule: {
            path: themeName,
            module: module as unknown as PluginModule,
          },
          entryPath: `/path/to/${themeName}/index.js`,
        },
      },
    ];
  }

  it('reads getSwizzleConfig() from the plugin module named exports', () => {
    const plugins = createSwizzlePlugins({
      moduleNamedExports: {getSwizzleConfig: () => swizzleConfig},
    });
    expect(getThemeSwizzleConfig(themeName, plugins)).toEqual(swizzleConfig);
  });

  it('reads getSwizzleConfig() from the plugin function', () => {
    const plugins = createSwizzlePlugins({
      pluginStatics: {getSwizzleConfig: () => swizzleConfig},
    });
    expect(getThemeSwizzleConfig(themeName, plugins)).toEqual(swizzleConfig);
  });

  it('returns an empty config without any swizzle config', () => {
    const plugins = createSwizzlePlugins({});
    expect(getThemeSwizzleConfig(themeName, plugins)).toEqual({
      components: {},
    });
  });

  it('prefers getSwizzleConfig() over getSwizzleComponentList()', () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plugins = createSwizzlePlugins({
      moduleNamedExports: {
        getSwizzleConfig: () => swizzleConfig,
        getSwizzleComponentList: () => ['OtherComponent'],
      },
    });
    expect(getThemeSwizzleConfig(themeName, plugins)).toEqual(swizzleConfig);
    expect(warn).not.toHaveBeenCalled();
  });

  // TODO Docusaurus v5: remove this test
  it('falls back to the deprecated getSwizzleComponentList() with a warning', () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plugins = createSwizzlePlugins({
      moduleNamedExports: {
        getSwizzleComponentList: () => ['SomeComponent'],
      },
    });
    expect(getThemeSwizzleConfig(themeName, plugins)).toEqual({
      components: {
        SomeComponent: {
          actions: {
            eject: 'safe',
            wrap: 'safe',
          },
        },
      },
    });
    expect(warn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[WARNING] Theme my-theme uses the deprecated \`getSwizzleComponentList()\` API, which will be removed in Docusaurus v5. The theme should implement \`getSwizzleConfig()\` instead: https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#getSwizzleConfig",
        ],
      ]
    `);
  });
});
