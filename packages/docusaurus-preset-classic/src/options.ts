/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Options as DocsPluginOptions} from '@docusaurus/plugin-content-docs';
import type {Options as BlogPluginOptions} from '@docusaurus/plugin-content-blog';
import type {Options as PagesPluginOptions} from '@docusaurus/plugin-content-pages';
import type {Options as SitemapPluginOptions} from '@docusaurus/plugin-sitemap';
import type {Options as SVGRPluginOptions} from '@docusaurus/plugin-svgr';
import type {Options as GtagPluginOptions} from '@docusaurus/plugin-google-gtag';
import type {Options as GTMPluginOptions} from '@docusaurus/plugin-google-tag-manager';
import type {Options as CssCascadeLayersPluginOptions} from '@docusaurus/plugin-css-cascade-layers';
import type {Options as ThemeOptions} from '@docusaurus/theme-classic';
import type {ThemeConfig as BaseThemeConfig} from '@docusaurus/types';
import type {UserThemeConfig as ClassicThemeConfig} from '@docusaurus/theme-common';
import type {UserThemeConfig as AlgoliaThemeConfig} from '@docusaurus/theme-search-algolia';

export type Options = {
  /**
   * Options for `@docusaurus/plugin-debug`. Use `false` to disable, or `true`
   * to enable even in production.
   */
  debug?: boolean;
  /** Options for `@docusaurus/plugin-content-docs`. Use `false` to disable. */
  docs?: false | DocsPluginOptions;
  /** Options for `@docusaurus/plugin-content-blog`. Use `false` to disable. */
  blog?: false | BlogPluginOptions;
  /** Options for `@docusaurus/plugin-content-pages`. Use `false` to disable. */
  pages?: false | PagesPluginOptions;
  /** Options for `@docusaurus/plugin-sitemap`. Use `false` to disable. */
  sitemap?: false | SitemapPluginOptions;
  /** Options for `@docusaurus/plugin-svgr`. Use `false` to disable. */
  svgr?: false | SVGRPluginOptions;
  /** Options for `@docusaurus/theme-classic`. */
  theme?: ThemeOptions;
  /**
   * Options for `@docusaurus/plugin-google-gtag`. Only enabled when the key
   * is present.
   */
  gtag?: GtagPluginOptions;
  googleTagManager?: GTMPluginOptions;
  /**
   * Options for `@docusaurus/plugin-css-cascade-layers`. Use `false` to
   * disable.
   */
  cssCascadeLayers?: false | CssCascadeLayersPluginOptions;
};

export type ThemeConfig = BaseThemeConfig &
  ClassicThemeConfig &
  AlgoliaThemeConfig;
