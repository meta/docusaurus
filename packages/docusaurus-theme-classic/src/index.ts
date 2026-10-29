/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import rtlcss from 'rtlcss';
import {readDefaultCodeTranslationMessages} from '@docusaurus/theme-translations';
import {getTranslationFiles, translateThemeConfig} from './translations';
import {
  getThemeInlineScript,
  getAnnouncementBarInlineScript,
  DataAttributeQueryStringInlineJavaScript,
} from './inlineScripts';
import {SvgSpriteDefs} from './inlineSvgSprites';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {ThemeConfig} from '@docusaurus/theme-common';
import type {Plugin as PostCssPlugin} from 'postcss';
import type {PluginOptions} from '@docusaurus/theme-classic';

function getInfimaCSSFile(direction: string) {
  return `infima/dist/css/default/default${
    direction === 'rtl' ? '-rtl' : ''
  }.css`;
}

export default function themeClassic(
  context: LoadContext,
  options: PluginOptions,
): Plugin<undefined> {
  const {
    i18n: {currentLocale, localeConfigs},
    siteStorage,
  } = context;
  const themeConfig = context.siteConfig.themeConfig as ThemeConfig;
  const {
    announcementBar,
    colorMode,
    prism: {additionalLanguages},
  } = themeConfig;
  const {customCss} = options;
  const {direction} = localeConfigs[currentLocale]!;

  return {
    name: 'docusaurus-theme-classic',

    getThemePath() {
      return '../lib/theme';
    },

    getTypeScriptThemePath() {
      return '../src/theme';
    },

    getTranslationFiles: () => getTranslationFiles({themeConfig}),

    translateThemeConfig: (params) =>
      translateThemeConfig({
        themeConfig: params.themeConfig as ThemeConfig,
        translationFiles: params.translationFiles,
      }),

    getDefaultCodeTranslationMessages() {
      return readDefaultCodeTranslationMessages({
        locale: currentLocale,
        name: 'theme-common',
      });
    },

    getClientModules() {
      const modules = [
        require.resolve(getInfimaCSSFile(direction)),
        './prism-include-languages',
        './nprogress',
      ];

      modules.push(...customCss.map((p) => path.resolve(context.siteDir, p)));

      return modules;
    },

    configureWebpack(__config, __isServer, {currentBundler}) {
      const prismLanguages = additionalLanguages
        .map((lang) => `prism-${lang}`)
        .join('|');

      return {
        plugins: [
          // This allows better optimization by only bundling those components
          // that the user actually needs, because the modules are dynamically
          // required and can't be known during compile time.
          new currentBundler.instance.ContextReplacementPlugin(
            /prismjs[\\/]components$/,
            new RegExp(`^./(${prismLanguages})$`),
          ),
        ],
      };
    },

    configurePostCss(postCssOptions) {
      if (direction === 'rtl') {
        const resolvedInfimaFile = require.resolve(getInfimaCSSFile(direction));
        const plugin: PostCssPlugin = {
          postcssPlugin: 'RtlCssPlugin',
          prepare: (result) => {
            const file = result.root.source?.input.file;
            // Skip Infima as we are using the its RTL version.
            if (file === resolvedInfimaFile) {
              return {};
            }
            return rtlcss(result.root as unknown as rtlcss.ConfigOptions);
          },
        };
        postCssOptions.plugins.push(plugin);
      }

      return postCssOptions;
    },

    injectHtmlTags() {
      return {
        preBodyTags: [
          {
            tagName: 'svg',
            attributes: {
              style: 'display: none;',
            },
            innerHTML: SvgSpriteDefs,
          },
          {
            tagName: 'script',
            innerHTML: `
${getThemeInlineScript({colorMode, siteStorage})}
${DataAttributeQueryStringInlineJavaScript}
${announcementBar ? getAnnouncementBarInlineScript({siteStorage}) : ''}
            `,
          },
        ],
      };
    },
  };
}

export {default as getSwizzleConfig} from './getSwizzleConfig';
export {validateThemeConfig, validateOptions} from './options';
