/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getAssetRuleUtils, findAssetRule} from '@docusaurus/utils';
import {Joi} from '@docusaurus/utils-validation';
import {readDefaultCodeTranslationMessages} from '@docusaurus/theme-translations';
import type {
  LoadContext,
  Plugin,
  OptionValidationContext,
} from '@docusaurus/types';
import type {PluginOptions} from '@docusaurus/plugin-ideal-image';
import type {RuleSetRule} from 'webpack';

export default function pluginIdealImage(
  context: LoadContext,
  options: PluginOptions,
): Plugin<void> {
  const {
    i18n: {currentLocale},
  } = context;

  return {
    name: 'docusaurus-plugin-ideal-image',

    getThemePath() {
      return '../lib/theme';
    },

    getTypeScriptThemePath() {
      return '../src/theme';
    },

    getDefaultCodeTranslationMessages() {
      return readDefaultCodeTranslationMessages({
        locale: currentLocale,
        name: 'plugin-ideal-image',
      });
    },

    configureWebpack(config, isServer) {
      const {disableInDev, ...loaderOptions} = options;
      if (disableInDev && process.env.NODE_ENV !== 'production') {
        return;
      }

      const {parentRules, rule: existingImageRule} = (() => {
        const result = findAssetRule({
          rules: config.module?.rules as RuleSetRule[],
          test: getAssetRuleUtils(isServer).rules.images().test,
        });
        if (!result) {
          throw new Error(
            "Docusaurus built-in image rule couldn't be found. The ideal-image plugin can't enhance it.",
          );
        }
        return result;
      })();

      const idealImageRule: RuleSetRule = {
        test: /\.(?:png|jpe?g)$/i,
        // Ideal images are JS modules, not assets
        type: 'javascript/auto',
        // new URL('./img.png', import.meta.url) references the image asset URL
        dependency: {not: 'url'},
        // We don't want to use the image loader for non-React source code
        // ie we don't want to use ideal image loader for CSS files...
        // See https://github.com/facebook/docusaurus/issues/10862
        issuer: {
          and: [/\.(?:tsx?|jsx?|mdx?)$/i],
        },
        use: [
          require.resolve('@docusaurus/lqip-loader'),
          {
            loader: require.resolve('@docusaurus/responsive-loader'),
            options: {
              // Don't emit for server-side rendering
              emitFile: !isServer,
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              adapter: require('@docusaurus/responsive-loader/sharp'),
              name: 'assets/ideal-img/[name].[hash:hex:7].[width].[ext]',
              ...loaderOptions,
            },
          },
        ],
      };

      // We "wrap" the existing image rule, so that only one of them applies
      // Otherwise both rules would apply, leading to conflicting behavior
      const index = parentRules.indexOf(existingImageRule);
      parentRules[index] = {
        test: existingImageRule.test,
        with: {type: {not: 'text'}},
        oneOf: [idealImageRule, existingImageRule],
      };
    },
  };
}

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<PluginOptions, PluginOptions>): PluginOptions {
  const pluginOptionsSchema = Joi.object<PluginOptions>({
    disableInDev: Joi.boolean().default(true),
  }).unknown();
  return validate(pluginOptionsSchema, options);
}
