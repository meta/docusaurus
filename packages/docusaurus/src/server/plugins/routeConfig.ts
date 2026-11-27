/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import {posixPath} from '@docusaurus/utils';
import {
  applyTrailingSlash,
  type ApplyTrailingSlashParams,
} from '@docusaurus/utils-common';
import {isModule} from '../codegen/codegenRoutes';
import type {Module, RouteConfig, RouteModules} from '@docusaurus/types';

/** Recursively applies trailing slash config to all nested routes. */
export function applyRouteTrailingSlash<Route extends RouteConfig>(
  route: Route,
  params: ApplyTrailingSlashParams,
): Route {
  return {
    ...route,
    path: applyTrailingSlash(route.path, params),
    ...(route.routes && {
      routes: route.routes.map((subroute) =>
        applyRouteTrailingSlash(subroute, params),
      ),
    }),
  };
}

/**
 * The site directories that always have a Webpack alias:
 * `@site` for siteDir and `@generated` for generatedFilesDir.
 */
export type ModuleAliasContext = {
  siteDir: string;
  generatedFilesDir: string;
};

/**
 * Plugins can reference route modules with absolute file paths, for example
 * the path returned by `createData()`. We don't want machine-specific absolute
 * paths in the codegen: they leak local paths in the build output, and make
 * route hashes and chunk names differ across machines.
 *
 * This recursively aliases all the module paths of a route tree: the
 * component, the modules and the context modules.
 */
export function aliasRouteModulePaths<Route extends RouteConfig>(
  route: Route,
  aliasContext: ModuleAliasContext,
): Route {
  // Conditional spreads preserve the keys order and JSON.stringify(route)
  // so that route hashes don't change for routes that are already aliased
  return {
    ...route,
    component: aliasModulePath(route.component, aliasContext),
    ...(route.modules && {
      modules: aliasRouteModules(route.modules, aliasContext),
    }),
    ...(route.context && {
      context: aliasRouteModules(route.context, aliasContext),
    }),
    ...(route.routes && {
      routes: route.routes.map((subRoute) =>
        aliasRouteModulePaths(subRoute, aliasContext),
      ),
    }),
  };
}

function aliasRouteModules(
  routeModules: RouteModules,
  aliasContext: ModuleAliasContext,
): RouteModules {
  return _.mapValues(routeModules, (value) => {
    if (isModule(value)) {
      return aliasModule(value, aliasContext);
    }
    if (Array.isArray(value)) {
      return value.map((item) => aliasRouteModules(item, aliasContext));
    }
    return aliasRouteModules(value, aliasContext);
  });
}

function aliasModule(module: Module, aliasContext: ModuleAliasContext): Module {
  if (typeof module === 'string') {
    return aliasModulePath(module, aliasContext);
  }
  return {...module, path: aliasModulePath(module.path, aliasContext)};
}

/**
 * Absolute paths inside `generatedFilesDir` or `siteDir` are rewritten to
 * the equivalent `@generated/...` or `@site/...` aliases. Other module paths
 * (already aliased, bare specifiers, files outside the site) are kept as is.
 */
export function aliasModulePath(
  modulePath: string,
  {siteDir, generatedFilesDir}: ModuleAliasContext,
): string {
  if (!path.isAbsolute(modulePath)) {
    return modulePath;
  }
  // generatedFilesDir is usually inside siteDir, so it must be checked first
  if (isInsideDir(modulePath, generatedFilesDir)) {
    return toAliasedPath('@generated', generatedFilesDir, modulePath);
  }
  if (isInsideDir(modulePath, siteDir)) {
    return toAliasedPath('@site', siteDir, modulePath);
  }
  return modulePath;
}

function isInsideDir(filePath: string, dir: string): boolean {
  const relativePath = path.relative(dir, filePath);
  const isOutside =
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    // On Windows, a path on another drive can't be made relative
    path.isAbsolute(relativePath);
  return !isOutside;
}

function toAliasedPath(alias: string, dir: string, filePath: string): string {
  return `${alias}/${posixPath(path.relative(dir, filePath))}`;
}

export function sortRoutes<Route extends RouteConfig>(
  routesToSort: Route[],
  baseUrl: string,
): Route[] {
  const routeConfigs = [...routesToSort];
  // Sort the route config. This ensures that route with nested
  // routes is always placed last.
  routeConfigs.sort((a, b) => {
    // Root route should get placed last.
    if (a.path === baseUrl && b.path !== baseUrl) {
      return 1;
    }
    if (a.path !== baseUrl && b.path === baseUrl) {
      return -1;
    }

    if (a.routes && !b.routes) {
      return 1;
    }
    if (!a.routes && b.routes) {
      return -1;
    }

    // If both are parent routes (for example routeBasePath: "/" and "/docs/"
    // We must order them carefully in case of overlapping paths
    if (a.routes && b.routes) {
      if (a.path === b.path) {
        // We don't really support that kind of routing ATM
        // React-Router by default will only "enter" a single parent route
      } else {
        if (a.path.includes(b.path)) {
          return -1;
        }
        if (b.path.includes(a.path)) {
          return 1;
        }
      }
    }

    // Higher priority get placed first.
    if (a.priority || b.priority) {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      const score = priorityB - priorityA;

      if (score !== 0) {
        return score;
      }
    }

    return a.path.localeCompare(b.path);
  });

  routeConfigs.forEach((routeConfig) => {
    if (routeConfig.routes) {
      routeConfig.routes = sortRoutes(routeConfig.routes, baseUrl);
    }
  });

  return routeConfigs;
}
