/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {normalizeUrl} from '@docusaurus/utils';
import {readDefaultCodeTranslationMessages} from '@docusaurus/theme-translations';
import {
  createOpenSearchFile,
  createOpenSearchHeadTags,
  shouldCreateOpenSearchFile,
} from './opensearch';

import type {LoadContext, Plugin} from '@docusaurus/types';
import type {ThemeConfig} from '@docusaurus/theme-search-algolia';

export default function themeSearchAlgolia(context: LoadContext): Plugin<void> {
  const {
    baseUrl,
    siteConfig: {themeConfig},
    i18n: {currentLocale},
  } = context;
  const {
    algolia: {searchPagePath},
  } = themeConfig as ThemeConfig;

  return {
    name: 'docusaurus-theme-search-algolia',

    getThemePath() {
      return '../lib/theme';
    },
    getTypeScriptThemePath() {
      return '../src/theme';
    },

    getDefaultCodeTranslationMessages() {
      return readDefaultCodeTranslationMessages({
        locale: currentLocale,
        name: 'theme-search-algolia',
      });
    },

    contentLoaded({actions: {addRoute}}) {
      if (searchPagePath) {
        addRoute({
          path: normalizeUrl([baseUrl, searchPagePath]),
          component: '@theme/SearchPage',
          exact: true,
        });
      }
    },

    async postBuild() {
      if (shouldCreateOpenSearchFile({context})) {
        await createOpenSearchFile({context});
      }
    },

    injectHtmlTags() {
      if (shouldCreateOpenSearchFile({context})) {
        return {headTags: createOpenSearchHeadTags({context})};
      }
      return {};
    },
  };
}

export {validateThemeConfig} from './validateThemeConfig';
