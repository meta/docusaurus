/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  Preset,
  LoadContext,
  PluginConfig,
  PluginOptions,
} from '@docusaurus/types';
import type {Options, ThemeConfig} from './options';

function makePluginConfig(
  source: string,
  options?: PluginOptions,
): string | [string, PluginOptions] {
  if (options) {
    return [require.resolve(source), options];
  }
  return require.resolve(source);
}

export default function preset(
  context: LoadContext,
  opts: Options = {},
): Preset {
  const {siteConfig} = context;
  const {themeConfig} = siteConfig;
  const {algolia} = themeConfig as Partial<ThemeConfig>;
  const isProd = process.env.NODE_ENV === 'production';
  const {
    debug,
    docs,
    blog,
    pages,
    sitemap,
    svgr,
    theme,
    gtag,
    googleTagManager,
    cssCascadeLayers,
    ...rest
  } = opts;

  const themes: PluginConfig[] = [];
  themes.push(makePluginConfig('@docusaurus/theme-classic', theme));
  if (algolia) {
    themes.push(require.resolve('@docusaurus/theme-search-algolia'));
  }
  // TODO Docusaurus v5: remove
  if ('googleAnalytics' in opts || 'googleAnalytics' in themeConfig) {
    throw new Error(
      `In Docusaurus v4, the Google Analytics plugin has been removed.
You can now use either:
- @docusaurus/plugin-google-gtag - presetOptions.gtag
- @docusaurus/plugin-google-tag-manager - presetOptions.googleTagManager

See also: https://github.com/facebook/docusaurus/issues/7221`,
    );
  }

  const plugins: PluginConfig[] = [];

  if (cssCascadeLayers !== false) {
    plugins.push(
      makePluginConfig(
        '@docusaurus/plugin-css-cascade-layers',
        cssCascadeLayers,
      ),
    );
  }

  if (docs !== false) {
    plugins.push(makePluginConfig('@docusaurus/plugin-content-docs', docs));
  }
  if (blog !== false) {
    plugins.push(makePluginConfig('@docusaurus/plugin-content-blog', blog));
  }
  if (pages !== false) {
    plugins.push(makePluginConfig('@docusaurus/plugin-content-pages', pages));
  }
  if (debug || (debug === undefined && !isProd)) {
    plugins.push(require.resolve('@docusaurus/plugin-debug'));
  }
  if (gtag) {
    plugins.push(makePluginConfig('@docusaurus/plugin-google-gtag', gtag));
  }
  if (googleTagManager) {
    plugins.push(
      makePluginConfig(
        '@docusaurus/plugin-google-tag-manager',
        googleTagManager,
      ),
    );
  }
  if (sitemap !== false && (isProd || debug)) {
    plugins.push(makePluginConfig('@docusaurus/plugin-sitemap', sitemap));
  }
  if (svgr !== false) {
    plugins.push(makePluginConfig('@docusaurus/plugin-svgr', svgr));
  }
  if (Object.keys(rest).length > 0) {
    throw new Error(
      `Unrecognized keys ${Object.keys(rest).join(
        ', ',
      )} found in preset-classic configuration. The allowed keys are debug, docs, blog, pages, sitemap, svgr, theme, gtag, googleTagManager, and cssCascadeLayers. Check the documentation: https://docusaurus.io/docs/using-plugins#docusauruspreset-classic for more information on how to configure individual plugins.`,
    );
  }

  return {themes, plugins};
}

export type {Options, ThemeConfig};
