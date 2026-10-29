/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {Joi} from '@docusaurus/utils-validation';
import {SwizzleActions, SwizzleActionsStatuses} from './common';
import {getPluginByThemeName} from './themes';
import type {SwizzleComponentConfig, SwizzleConfig} from '@docusaurus/types';
import type {SwizzlePlugin} from './common';

function getModuleSwizzleConfig(
  swizzlePlugin: SwizzlePlugin,
  themeName: string,
): SwizzleConfig | undefined {
  const getSwizzleConfig =
    swizzlePlugin.plugin.plugin.getSwizzleConfig ??
    swizzlePlugin.plugin.pluginModule?.module.getSwizzleConfig;

  if (getSwizzleConfig) {
    return getSwizzleConfig();
  }

  // TODO Docusaurus v5: remove the deprecated getSwizzleComponentList() API
  const getSwizzleComponentList =
    swizzlePlugin.plugin.plugin.getSwizzleComponentList ??
    swizzlePlugin.plugin.pluginModule?.module.getSwizzleComponentList;

  if (getSwizzleComponentList) {
    logger.warn`Theme name=${themeName} uses the deprecated code=${'getSwizzleComponentList()'} API, which will be removed in Docusaurus v5. The theme should implement code=${'getSwizzleConfig()'} instead: url=${'https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#getSwizzleConfig'}`;
    const safeComponents = getSwizzleComponentList() ?? [];
    const safeComponentConfig: SwizzleComponentConfig = {
      actions: {
        eject: 'safe',
        wrap: 'safe',
      },
      description: undefined,
    };
    return {
      components: Object.fromEntries(
        safeComponents.map((comp) => [comp, safeComponentConfig]),
      ),
    };
  }

  return undefined;
}

const SwizzleConfigSchema = Joi.object<SwizzleConfig>({
  components: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object({
        actions: Joi.object().pattern(
          Joi.string().valid(...SwizzleActions),
          Joi.string().valid(...SwizzleActionsStatuses),
        ),
        description: Joi.string(),
      }),
    )
    .required(),
});

function validateSwizzleConfig(unsafeSwizzleConfig: unknown): SwizzleConfig {
  const result = SwizzleConfigSchema.validate(unsafeSwizzleConfig);
  if (result.error) {
    throw new Error(
      `Swizzle config does not match expected schema: ${result.error.message}`,
    );
  }
  return result.value;
}

export function normalizeSwizzleConfig(
  unsafeSwizzleConfig: unknown,
): SwizzleConfig {
  const swizzleConfig = validateSwizzleConfig(unsafeSwizzleConfig);

  // Ensure all components always declare all actions
  Object.values(swizzleConfig.components).forEach((componentConfig) => {
    SwizzleActions.forEach((action) => {
      if (!componentConfig.actions[action]) {
        componentConfig.actions[action] = 'unsafe';
      }
    });
  });

  return swizzleConfig;
}

const FallbackSwizzleConfig: SwizzleConfig = {
  components: {},
};

export function getThemeSwizzleConfig(
  themeName: string,
  plugins: SwizzlePlugin[],
): SwizzleConfig {
  const plugin = getPluginByThemeName(plugins, themeName);
  const config = getModuleSwizzleConfig(plugin, themeName);
  if (config) {
    try {
      return normalizeSwizzleConfig(config);
    } catch (err) {
      logger.error`Invalid Swizzle config for theme name=${themeName}.`;
      throw err;
    }
  }
  return FallbackSwizzleConfig;
}
