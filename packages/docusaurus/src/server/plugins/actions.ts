/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {generate} from '@docusaurus/utils';
import {aliasRouteModulePaths, applyRouteTrailingSlash} from './routeConfig';
import type {
  InitializedPlugin,
  PluginContentLoadedActions,
  PluginRouteContext,
  RouteConfig,
} from '@docusaurus/types';

type PluginActionUtils = {
  getRoutes: () => RouteConfig[];
  getGlobalData: () => unknown;
  getActions: () => PluginContentLoadedActions;
};

// The custom route context declared by plugins is namespaced under `data`
// This applies to nested routes too: the client merges their route context
function namespaceRouteContextData(route: RouteConfig): RouteConfig {
  return {
    ...route,
    ...(route.context && {context: {data: route.context}}),
    ...(route.routes && {routes: route.routes.map(namespaceRouteContextData)}),
  };
}

// TODO refactor historical action system and make this side-effect-free
//  If the function were pure, we could more easily compare previous/next values
//  on site reloads, and bail-out of the reload process earlier
//  Particularly, createData() modules should rather be declarative
export async function createPluginActionsUtils({
  plugin,
  siteDir,
  generatedFilesDir,
  baseUrl,
  trailingSlash,
}: {
  plugin: InitializedPlugin;
  siteDir: string;
  generatedFilesDir: string;
  baseUrl: string;
  trailingSlash: boolean | undefined;
}): Promise<PluginActionUtils> {
  const pluginId = plugin.options.id;
  // Plugins data files are namespaced by pluginName/pluginId
  const dataDir = path.join(generatedFilesDir, plugin.name, pluginId);

  const pluginRouteContext: PluginRouteContext['plugin'] = {
    name: plugin.name,
    id: pluginId,
  };

  const pluginRouteContextModulePath = path.join(dataDir, `__plugin.json`);

  // TODO not ideal place to generate that file
  // move to codegen step instead!
  await generate(
    '/',
    pluginRouteContextModulePath,
    JSON.stringify(pluginRouteContext, null, 2),
  );

  const routes: RouteConfig[] = [];
  let globalData: unknown;

  const actions: PluginContentLoadedActions = {
    addRoute(initialRouteConfig) {
      // Trailing slash behavior is handled generically for all plugins
      const finalRouteConfig = namespaceRouteContextData(
        applyRouteTrailingSlash(initialRouteConfig, {
          baseUrl,
          trailingSlash,
        }),
      );
      const routeWithContext: RouteConfig = {
        ...finalRouteConfig,
        context: {
          ...finalRouteConfig.context,
          plugin: pluginRouteContextModulePath,
        },
      };
      // Plugins can use absolute module paths, such as createData() paths
      // We alias them so that the codegen doesn't contain local FS paths
      routes.push(
        aliasRouteModulePaths(routeWithContext, {siteDir, generatedFilesDir}),
      );
    },
    async createData(name, data) {
      const modulePath = path.join(dataDir, name);
      const dataString =
        typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await generate(dataDir, name, dataString);
      return modulePath;
    },
    setGlobalData(data) {
      globalData = data;
    },
  };

  return {
    // Some variables are mutable, so we expose a getter instead of the value
    getRoutes: () => routes,
    getGlobalData: () => globalData,
    getActions: () => actions,
  };
}
