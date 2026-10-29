/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createRequire} from 'node:module';
import {loadFreshModule} from '@docusaurus/utils';
import {loadPresets} from './presets';
import {resolveModuleName} from './moduleShorthand';
import type {
  LoadContext,
  PluginConfig,
  PluginModule,
  PluginOptions,
} from '@docusaurus/types';

type ImportedPluginModule = PluginModule & {default?: PluginModule};

export type NormalizedPluginConfig = {
  /**
   * The default export of the plugin module, or alternatively, what's provided
   * in the config file as inline plugins. Note that if a file is like:
   *
   * ```ts
   * export default plugin() {...}
   * export validateOptions() {...}
   * ```
   *
   * Then the static methods may not exist here. `pluginModule.module` will
   * always take priority.
   */
  plugin: PluginModule;
  /** Options as they are provided in the config, not validated yet. */
  options: PluginOptions;
  /** Only available when a string is provided in config. */
  pluginModule?: {
    /**
     * Raw module name as provided in the config. Shorthands have been resolved,
     * so at least it's directly `require.resolve`able.
     */
    path: string;
    /** Whatever gets imported with `require`. */
    module: ImportedPluginModule;
  };
  /**
   * Different from `pluginModule.path`, this one is always an absolute path,
   * used to resolve relative paths returned from lifecycles. If it's an inline
   * plugin, it will be path to the config file.
   */
  entryPath: string;
};

async function normalizePluginConfig(
  pluginConfig: Exclude<PluginConfig, false | null>,
  configPath: string,
  pluginRequire: NodeRequire,
): Promise<NormalizedPluginConfig> {
  // plugins: ["./plugin"]
  if (typeof pluginConfig === 'string') {
    const pluginModuleImport = pluginConfig;
    const pluginPath = pluginRequire.resolve(pluginModuleImport);
    const pluginModule = (await loadFreshModule(
      pluginPath,
    )) as ImportedPluginModule;
    return {
      plugin: pluginModule.default ?? pluginModule,
      options: {},
      pluginModule: {
        path: pluginModuleImport,
        module: pluginModule,
      },
      entryPath: pluginPath,
    };
  }

  // plugins: [() => {...}]
  if (typeof pluginConfig === 'function') {
    return {
      plugin: pluginConfig,
      options: {},
      entryPath: configPath,
    };
  }

  // plugins: [
  //   ["./plugin",options],
  // ]
  if (typeof pluginConfig[0] === 'string') {
    const pluginModuleImport = pluginConfig[0];
    const pluginPath = pluginRequire.resolve(pluginModuleImport);
    const pluginModule = (await loadFreshModule(
      pluginPath,
    )) as ImportedPluginModule;
    return {
      plugin: pluginModule.default ?? pluginModule,
      options: pluginConfig[1],
      pluginModule: {
        path: pluginModuleImport,
        module: pluginModule,
      },
      entryPath: pluginPath,
    };
  }
  // plugins: [
  //   [() => {...}, options],
  // ]
  return {
    plugin: pluginConfig[0],
    options: pluginConfig[1],
    entryPath: configPath,
  };
}

/**
 * Reads the site config's `presets`, `themes`, and `plugins`, imports them, and
 * normalizes the return value. Plugin configs are ordered, mostly for theme
 * alias shadowing. Site themes have the highest priority, and preset plugins
 * are the lowest.
 */
export async function loadPluginConfigs(
  context: LoadContext,
): Promise<NormalizedPluginConfig[]> {
  const preset = await loadPresets(context);
  const {siteConfig, siteConfigPath} = context;
  const pluginRequire = createRequire(siteConfigPath);
  function normalizeShorthand(
    pluginConfig: PluginConfig,
    pluginType: 'plugin' | 'theme',
  ): PluginConfig {
    if (typeof pluginConfig === 'string') {
      return resolveModuleName(pluginConfig, pluginRequire, pluginType);
    } else if (
      Array.isArray(pluginConfig) &&
      typeof pluginConfig[0] === 'string'
    ) {
      return [
        resolveModuleName(pluginConfig[0], pluginRequire, pluginType),
        pluginConfig[1] ?? {},
      ];
    }
    return pluginConfig;
  }
  preset.plugins = preset.plugins.map((plugin) =>
    normalizeShorthand(plugin, 'plugin'),
  );
  preset.themes = preset.themes.map((theme) =>
    normalizeShorthand(theme, 'theme'),
  );
  const standalonePlugins = siteConfig.plugins.map((plugin) =>
    normalizeShorthand(plugin, 'plugin'),
  );
  const standaloneThemes = siteConfig.themes.map((theme) =>
    normalizeShorthand(theme, 'theme'),
  );
  const pluginConfigs = [
    ...preset.plugins,
    ...preset.themes,
    // Site config should be the highest priority.
    ...standalonePlugins,
    ...standaloneThemes,
  ].filter(<T>(x: T | null | false): x is T => Boolean(x));
  return Promise.all(
    pluginConfigs.map((pluginConfig) =>
      normalizePluginConfig(
        pluginConfig,
        context.siteConfigPath,
        pluginRequire,
      ),
    ),
  );
}
