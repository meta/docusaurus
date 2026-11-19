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
        require.resolve('@docusaurus/infima/infima.css'),
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
        const plugin: PostCssPlugin = {
          postcssPlugin: 'RtlCssPlugin',
          // Flip the final CSS: run alongside the other plugins, rtlcss misses
          // the var() fallbacks of postcss-preset-env in cascade layers
          OnceExit(root, {result, postcss}) {
            const rtlResult = postcss([rtlcss()])
              .process(root, {from: result.opts.from})
              .sync();
            result.messages.push(...rtlResult.messages);
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
