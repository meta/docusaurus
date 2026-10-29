/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {DocusaurusConfig} from './config';
import type {CodeTranslations, I18n} from './i18n';
import type {LoadedPlugin, PluginVersionInformation} from './plugin';
import type {PluginRouteConfig} from './routing';
import type {CurrentBundler} from './bundler';

export type DocusaurusContext = {
  siteConfig: DocusaurusConfig;
  siteMetadata: SiteMetadata;
  globalData: GlobalData;
  i18n: I18n;
  codeTranslations: CodeTranslations;

  // Don't put mutable values here, to avoid triggering re-renders
  // We could reconsider that choice if context selectors are implemented
  // isBrowser: boolean; // Not here on purpose!
};

export type SiteMetadata = {
  readonly docusaurusVersion: string;
  readonly siteVersion?: string;
  readonly pluginVersions: {[pluginName: string]: PluginVersionInformation};
};

export type SiteStorage = {
  /**
   * Which browser storage do you want to use?
   * Between "localStorage" and "sessionStorage".
   * The default is "localStorage".
   */
  type: 'localStorage' | 'sessionStorage';

  /**
   * Applies a namespace to the theme storage key
   * For readability, the namespace is applied at the end of the key
   * The final storage key will be = `${key}${namespace}`
   *
   * The namespace starts with a "-" separator ("-myNamespace")
   * By default, it is a hash of the site url + baseUrl ("-a1b")
   * It is "" when namespacing is disabled (`storage.namespace: false`)
   */
  namespace: string;
};

export type GlobalData = {[pluginName: string]: {[pluginId: string]: unknown}};

export type LoadContext = {
  siteDir: string;
  siteVersion: string | undefined;
  generatedFilesDir: string;
  siteConfig: DocusaurusConfig;
  siteConfigPath: string;
  outDir: string;
  /**
   * Directory where all source translations for the current locale can be found
   * in. Constructed with `i18n.path` + `i18n.currentLocale.path` (e.g.
   * `<siteDir>/i18n/en`)
   */
  localizationDir: string;
  /**
   * Duplicated from `siteConfig.baseUrl`, but probably worth keeping. We mutate
   * `siteConfig` to make `baseUrl` there localized as well, but that's mostly
   * for client-side. `context.baseUrl` is still more convenient for plugins.
   */
  baseUrl: string;
  i18n: I18n;
  codeTranslations: CodeTranslations;

  /**
   * Defines the default browser storage behavior for a site
   */
  siteStorage: SiteStorage;

  /**
   * The bundler used to build the site (Webpack or Rspack)
   */
  currentBundler: CurrentBundler;
};

export type Props = LoadContext & {
  headTags: string;
  preBodyTags: string;
  postBodyTags: string;
  siteMetadata: SiteMetadata;
  routes: PluginRouteConfig[];
  routesPaths: string[];
  plugins: LoadedPlugin[];
};
