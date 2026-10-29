/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ParsedUrlQueryInput} from 'node:querystring';
import type {PluginIdentifier} from './plugin';

/**
 * A "module" represents a unit of serialized data emitted from the plugin. It
 * will be imported on client-side and passed as props, context, etc.
 *
 * If it's a string, it's a file path that the bundler can `require`; if it's
 * an object, it can also contain `query` or other metadata.
 */
export type Module =
  | {
      /**
       * A marker that tells the route generator this is an import and not a
       * nested object to recurse.
       */
      __import?: boolean;
      path: string;
      query?: ParsedUrlQueryInput;
    }
  | string;

/**
 * Represents the data attached to each route. Since the routes.js is a
 * monolithic data file, any data (like props) should be serialized separately
 * and registered here as file paths (a {@link Module}), so that we could
 * code-split.
 */
export type RouteModules = {
  [propName: string]: Module | RouteModules | RouteModules[];
};

/**
 * Plugin authors can assign extra metadata to the created routes
 * It is only available on the Node.js side, and not sent to the browser
 * Optional: plugin authors are encouraged but not required to provide it
 *
 * Some plugins might use this data to provide additional features.
 * This is the case of the sitemap plugin to provide support for "lastmod".
 * See also: https://github.com/facebook/docusaurus/pull/9954
 */
export type RouteMetadata = {
  /**
   * The source code file path that led to the creation of the current route
   * In official content plugins, this is usually a Markdown or React file
   * This path is expected to be relative to the site directory
   */
  sourceFilePath?: string;
  /**
   * The last updated date of this route
   * This is generally read from the Git history of the sourceFilePath
   * but can also be provided through other means (usually front matter).
   *
   * This has notably been introduced for adding "lastmod" support to the
   * sitemap plugin, see https://github.com/facebook/docusaurus/pull/9954
   *
   * `undefined` means we haven't tried to compute the value for this route.
   * This is usually the case for routes created by third-party plugins that do
   * not need this metadata.
   *
   * `null` means we already tried to compute a lastUpdatedAt, but we know for
   * sure there isn't any. This usually happens for untracked Git files.
   */
  lastUpdatedAt?: number | null;
};

/**
 * Represents a "slice" of the final route structure returned from the plugin
 * `addRoute` action.
 */
export type RouteConfig = {
  /**
   * With leading slash. Trailing slash will be normalized by config.
   */
  path: string;
  /**
   * Component used to render this route, a path that the bundler can `require`.
   */
  component: string;
  /**
   * Props. Each entry should be `[propName]: pathToPropModule` (created with
   * `createData`)
   */
  modules?: RouteModules;
  /**
   * The route context will wrap the `component`. Use `useRouteContext` to
   * retrieve what's declared here. Note that all custom route context declared
   * here will be namespaced under {@link RouteContext.data}.
   */
  context?: RouteModules;
  /**
   * Nested routes config, useful for "layout routes" having subroutes.
   */
  routes?: RouteConfig[];
  /**
   * React router config option: `exact` routes would not match subroutes.
   */
  exact?: boolean;
  /**
   * React router config option: `strict` routes are sensitive to the presence
   * of a trailing slash.
   */
  strict?: boolean;
  /**
   * Used to sort routes.
   * Higher-priority routes will be matched first.
   */
  priority?: number;
  /**
   * Optional route metadata
   */
  metadata?: RouteMetadata;
  /**
   * Optional props object; will be converted to a module and injected as props
   * into the route component.
   */
  props?: {[propName: string]: unknown};
  /**
   * Extra route attribute; will be available on the client side route object.
   */
  [attributeName: string]: unknown;
};

export type PluginRouteConfig = RouteConfig & {
  /**
   * Routes are always created by Docusaurus plugins
   * A plugin identifier is available at the top of a routing tree
   * (child routes are implicitly created by the same plugin as their parent)
   */
  plugin: PluginIdentifier;
};

export type RouteContext = {
  /**
   * Plugin-specific context data.
   */
  data?: {[key: string]: unknown};
};

/**
 * Top-level plugin routes automatically add some context data to the route.
 * This permits us to know which plugin is handling the current route.
 */
export type PluginRouteContext = RouteContext & {
  plugin: {
    id: string;
    name: string;
  };
};

/**
 * The shape would be isomorphic to {@link RouteModules}:
 * {@link Module} -> `string`, `RouteModules[]` -> `ChunkNames[]`.
 *
 * Each `string` chunk name will correlate with one key in the {@link Registry}.
 */
export type ChunkNames = {
  [propName: string]: string | ChunkNames | ChunkNames[];
};

/**
 * A map from route paths (with a hash) to the chunk names of each module, which
 * the bundler will collect.
 *
 * Chunk keys are routes with a hash, because 2 routes can conflict with each
 * other if they have the same path, e.g.: parent=/docs, child=/docs
 *
 * @see https://github.com/facebook/docusaurus/issues/2917
 */
export type RouteChunkNames = {
  [routePathHashed: string]: ChunkNames;
};

/**
 * Each key is the chunk name, which you can get from `routeChunkNames` (see
 * {@link RouteChunkNames}). The values are the opts data that react-loadable
 * needs. For example:
 *
 * ```js
 * const options = {
 *   optsLoader: {
 *     component: () => import('./Pages.js'),
 *     content.foo: () => import('./doc1.md'),
 *   },
 *   optsModules: ['./Pages.js', './doc1.md'],
 *   optsWebpack: [
 *     require.resolveWeak('./Pages.js'),
 *     require.resolveWeak('./doc1.md'),
 *   ],
 * }
 * ```
 *
 * @see https://github.com/jamiebuilds/react-loadable#declaring-which-modules-are-being-loaded
 */
export type Registry = {
  readonly [chunkName: string]: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Loader: () => Promise<any>,
    ModuleName: string,
    ResolvedModuleName: string,
  ];
};
