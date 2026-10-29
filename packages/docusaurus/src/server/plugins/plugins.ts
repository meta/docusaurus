/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {PerfLogger} from '@docusaurus/logger';
import {getLocaleConfig} from '@docusaurus/utils';
import {initPlugins} from './init';
import {createBootstrapPlugin, createMDXFallbackPlugin} from './synthetic';
import {localizePluginTranslationFile} from '../translations/translations';
import {sortRoutes} from './routeConfig';
import {createPluginActionsUtils} from './actions';
import {
  aggregateAllContent,
  aggregateGlobalData,
  aggregateRoutes,
  formatPluginName,
  getPluginByIdentifier,
  mergeGlobalData,
  toPluginRoute,
} from './pluginsUtils';
import type {
  LoadContext,
  RouteConfig,
  AllContent,
  GlobalData,
  PluginIdentifier,
  LoadedPlugin,
  InitializedPlugin,
  PluginRouteConfig,
} from '@docusaurus/types';

async function translatePluginContent({
  plugin,
  content,
  context,
}: {
  plugin: InitializedPlugin;
  content: unknown;
  context: LoadContext;
}): Promise<unknown> {
  const rawTranslationFiles =
    (await plugin.getTranslationFiles?.({content})) ?? [];

  const translationFiles = await Promise.all(
    rawTranslationFiles.map((translationFile) =>
      localizePluginTranslationFile({
        localizationDir: context.localizationDir,
        translationFile,
        plugin,
      }),
    ),
  );

  const translatedContent =
    plugin.translateContent?.({content, translationFiles}) ?? content;

  const translatedThemeConfigSlice = plugin.translateThemeConfig?.({
    themeConfig: context.siteConfig.themeConfig,
    translationFiles,
  });

  // TODO dangerous legacy, need to be refactored!
  // Side-effect to merge theme config translations. A plugin should only
  // translate its own slice of theme config and should make no assumptions
  // about other plugins' keys, so this is safe to run in parallel.
  Object.assign(context.siteConfig.themeConfig, translatedThemeConfigSlice);
  return translatedContent;
}

async function executePluginContentLoading({
  plugin,
  context,
}: {
  plugin: InitializedPlugin;
  context: LoadContext;
}): Promise<LoadedPlugin> {
  return PerfLogger.async(`Load ${formatPluginName(plugin)}`, async () => {
    let content = await PerfLogger.async('loadContent()', () =>
      plugin.loadContent?.(),
    );

    const shouldTranslate = getLocaleConfig(context.i18n).translate;

    if (shouldTranslate) {
      content = await PerfLogger.async('translatePluginContent()', () =>
        translatePluginContent({
          plugin,
          content,
          context,
        }),
      );
    }

    // If shouldTranslate === false, we still need the code translations
    // Otherwise an unlocalized French site would show code strings in English
    const defaultCodeTranslations =
      (await PerfLogger.async('getDefaultCodeTranslationMessages()', () =>
        plugin.getDefaultCodeTranslationMessages?.(),
      )) ?? {};

    if (!plugin.contentLoaded) {
      return {
        ...plugin,
        content,
        defaultCodeTranslations,
        routes: [],
        globalData: undefined,
      };
    }

    const pluginActionsUtils = await createPluginActionsUtils({
      plugin,
      generatedFilesDir: context.generatedFilesDir,
      baseUrl: context.siteConfig.baseUrl,
      trailingSlash: context.siteConfig.trailingSlash,
    });

    await PerfLogger.async('contentLoaded()', () =>
      // @ts-expect-error: should autofix with TS 5.4
      plugin.contentLoaded({
        content,
        actions: pluginActionsUtils.getActions(),
      }),
    );

    return {
      ...plugin,
      content,
      defaultCodeTranslations,
      routes: pluginActionsUtils.getRoutes(),
      globalData: pluginActionsUtils.getGlobalData(),
    };
  });
}

async function executeAllPluginsContentLoading({
  plugins,
  context,
}: {
  plugins: InitializedPlugin[];
  context: LoadContext;
}): Promise<LoadedPlugin[]> {
  return PerfLogger.async(`Load plugins content`, () => {
    return Promise.all(
      plugins.map((plugin) => executePluginContentLoading({plugin, context})),
    );
  });
}

async function executePluginAllContentLoaded({
  plugin,
  context,
  allContent,
}: {
  plugin: LoadedPlugin;
  context: LoadContext;
  allContent: AllContent;
}): Promise<{routes: RouteConfig[]; globalData: unknown}> {
  return PerfLogger.async(
    `allContentLoaded() - ${formatPluginName(plugin)}`,
    async () => {
      if (!plugin.allContentLoaded) {
        return {routes: [], globalData: undefined};
      }
      const pluginActionsUtils = await createPluginActionsUtils({
        plugin,
        generatedFilesDir: context.generatedFilesDir,
        baseUrl: context.siteConfig.baseUrl,
        trailingSlash: context.siteConfig.trailingSlash,
      });
      await plugin.allContentLoaded({
        allContent,
        actions: pluginActionsUtils.getActions(),
      });
      return {
        routes: pluginActionsUtils.getRoutes(),
        globalData: pluginActionsUtils.getGlobalData(),
      };
    },
  );
}

type AllContentLoadedResult = {
  routes: PluginRouteConfig[];
  globalData: GlobalData;
};

async function executeAllPluginsAllContentLoaded({
  plugins,
  context,
}: {
  plugins: LoadedPlugin[];
  context: LoadContext;
}): Promise<AllContentLoadedResult> {
  return PerfLogger.async(`allContentLoaded()`, async () => {
    const allContent = aggregateAllContent(plugins);

    const allRoutes: PluginRouteConfig[] = [];
    const allGlobalData: GlobalData = {};

    await Promise.all(
      plugins.map(async (plugin) => {
        const {routes, globalData: pluginGlobalData} =
          await executePluginAllContentLoaded({
            plugin,
            context,
            allContent,
          });

        const pluginRoutes = routes.map((route) =>
          toPluginRoute({plugin, route}),
        );

        allRoutes.push(...pluginRoutes);

        if (pluginGlobalData !== undefined) {
          allGlobalData[plugin.name] ??= {};
          allGlobalData[plugin.name]![plugin.options.id] = pluginGlobalData;
        }
      }),
    );

    return {routes: allRoutes, globalData: allGlobalData};
  });
}

// This merges plugins routes and global data created from both lifecycles:
// - contentLoaded()
// - allContentLoaded()
function mergeResults({
  baseUrl,
  plugins,
  allContentLoadedResult,
}: {
  baseUrl: string;
  plugins: LoadedPlugin[];
  allContentLoadedResult: AllContentLoadedResult;
}) {
  const routes: PluginRouteConfig[] = sortRoutes(
    [...aggregateRoutes(plugins), ...allContentLoadedResult.routes],
    baseUrl,
  );

  const globalData: GlobalData = mergeGlobalData(
    aggregateGlobalData(plugins),
    allContentLoadedResult.globalData,
  );

  return {routes, globalData};
}

export type LoadPluginsResult = {
  plugins: LoadedPlugin[];
  routes: PluginRouteConfig[];
  globalData: GlobalData;
};

/**
 * Initializes the plugins and run their lifecycle functions.
 */
export async function loadPlugins(
  context: LoadContext,
): Promise<LoadPluginsResult> {
  return PerfLogger.async('Load plugins', async () => {
    const initializedPlugins: InitializedPlugin[] = await PerfLogger.async(
      'Init plugins',
      () => initPlugins(context),
    );

    // TODO probably not the ideal place to hardcode those plugins
    initializedPlugins.push(
      createBootstrapPlugin(context),
      await createMDXFallbackPlugin(context),
    );

    const plugins = await executeAllPluginsContentLoading({
      plugins: initializedPlugins,
      context,
    });

    const allContentLoadedResult = await executeAllPluginsAllContentLoaded({
      plugins,
      context,
    });

    const {routes, globalData} = mergeResults({
      baseUrl: context.baseUrl,
      plugins,
      allContentLoadedResult,
    });

    return {plugins, routes, globalData};
  });
}

export async function reloadPlugin({
  pluginIdentifier,
  plugins: previousPlugins,
  context,
}: {
  pluginIdentifier: PluginIdentifier;
  plugins: LoadedPlugin[];
  context: LoadContext;
}): Promise<LoadPluginsResult> {
  return PerfLogger.async(
    `Reload plugin ${formatPluginName(pluginIdentifier)}`,
    async () => {
      const previousPlugin = getPluginByIdentifier({
        plugins: previousPlugins,
        pluginIdentifier,
      });
      const plugin = await executePluginContentLoading({
        plugin: previousPlugin,
        context,
      });

      const plugins = previousPlugins.with(
        previousPlugins.indexOf(previousPlugin),
        plugin,
      );

      const allContentLoadedResult = await executeAllPluginsAllContentLoaded({
        plugins,
        context,
      });

      const {routes, globalData} = mergeResults({
        baseUrl: context.baseUrl,
        plugins,
        allContentLoadedResult,
      });

      return {plugins, routes, globalData};
    },
  );
}
