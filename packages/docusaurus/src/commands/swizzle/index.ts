/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {realpath} from '@docusaurus/fs';
import {
  getThemeName,
  getThemePath,
  getThemeNames,
  getPluginByThemeName,
} from './themes';
import {getThemeComponents, getComponentName} from './components';
import {helpTables, themeComponentsTable} from './tables';
import {normalizeOptions} from './common';
import {eject, getAction, wrap} from './actions';
import {getThemeSwizzleConfig} from './config';
import {
  askSwizzleDangerousComponent,
  askSwizzlePreferredLanguage,
} from './prompts';
import {initSwizzleContext} from './context';
import type {SwizzleAction, SwizzleComponentConfig} from '@docusaurus/types';
import type {SwizzleCLIOptions, SwizzlePlugin} from './common';
import type {ActionResult} from './actions';

async function getLanguageForThemeName({
  themeName,
  plugins,
  options,
}: {
  themeName: string;
  plugins: SwizzlePlugin[];
  options: SwizzleCLIOptions;
}): Promise<'javascript' | 'typescript'> {
  const plugin = getPluginByThemeName(plugins, themeName);
  const supportsTS = !!plugin.instance.getTypeScriptThemePath?.();

  if (options.typescript) {
    if (!supportsTS) {
      throw new Error(
        logger.interpolate`Theme name=${
          plugin.instance.name
        } does not support the code=${'--typescript'} CLI option.`,
      );
    }
    return 'typescript';
  }

  if (options.javascript) {
    return 'javascript';
  }

  // It's only useful to prompt the user for themes that support both JS/TS
  if (supportsTS) {
    return askSwizzlePreferredLanguage();
  }

  return 'javascript';
}

async function listAllThemeComponents({
  themeNames,
  plugins,
  typescript,
}: {
  themeNames: string[];
  plugins: SwizzlePlugin[];
  typescript: SwizzleCLIOptions['typescript'];
}) {
  const themeComponentsTables = (
    await Promise.all(
      themeNames.map(async (themeName) => {
        const themePath = getThemePath({themeName, plugins, typescript});
        const swizzleConfig = getThemeSwizzleConfig(themeName, plugins);
        const themeComponents = await getThemeComponents({
          themeName,
          themePath,
          swizzleConfig,
        });
        return themeComponentsTable(themeComponents);
      }),
    )
  ).join('\n\n');

  logger.info(`All theme components available to swizzle:

${themeComponentsTables}

${helpTables()}
    `);
  return process.exit(0);
}

async function ensureActionSafety({
  componentName,
  componentConfig,
  action,
  danger,
}: {
  componentName: string;
  componentConfig: SwizzleComponentConfig;
  action: SwizzleAction;
  danger: boolean;
}): Promise<void> {
  const actionStatus = componentConfig.actions[action];

  if (actionStatus === 'forbidden') {
    logger.error`
Swizzle action name=${action} is forbidden for component name=${componentName}
`;
    return process.exit(1);
  }

  if (actionStatus === 'unsafe' && !danger) {
    logger.warn`
Swizzle action name=${action} is unsafe to perform on name=${componentName}.
It is more likely to be affected by breaking changes in the future
If you want to swizzle it, use the code=${'--danger'} flag, or confirm that you understand the risks.
`;
    const swizzleDangerousComponent = await askSwizzleDangerousComponent();
    if (!swizzleDangerousComponent) {
      return process.exit(1);
    }
  }

  return undefined;
}

export async function swizzle(
  themeNameParam: string | undefined = undefined,
  componentNameParam: string | undefined = undefined,
  siteDirParam: string = '.',
  optionsParam: Partial<SwizzleCLIOptions> = {},
): Promise<void> {
  const siteDir = await realpath(siteDirParam);

  const options = normalizeOptions(optionsParam);
  const {list, danger} = options;

  const {plugins} = await initSwizzleContext(siteDir, options);
  const themeNames = getThemeNames(plugins);

  if (list && !themeNameParam) {
    await listAllThemeComponents({
      themeNames,
      plugins,
      typescript: options.typescript,
    });
  }

  const themeName = await getThemeName({themeNameParam, themeNames, list});

  const language = await getLanguageForThemeName({themeName, plugins, options});
  const typescript = language === 'typescript';

  const themePath = getThemePath({
    themeName,
    plugins,
    typescript,
  });

  const swizzleConfig = getThemeSwizzleConfig(themeName, plugins);

  const themeComponents = await getThemeComponents({
    themeName,
    themePath,
    swizzleConfig,
  });

  const componentName = await getComponentName({
    componentNameParam,
    themeComponents,
    list,
  });
  const componentConfig = themeComponents.getConfig(componentName);

  const action = await getAction(componentConfig, options);

  await ensureActionSafety({componentName, componentConfig, action, danger});

  async function executeAction(): Promise<ActionResult> {
    switch (action) {
      case 'wrap': {
        const result = await wrap({
          siteDir,
          themePath,
          componentName,
          typescript,
        });
        logger.success`
Created wrapper of name=${componentName} from name=${themeName} in path=${result.createdFiles}
`;
        return result;
      }
      case 'eject': {
        const result = await eject({
          siteDir,
          themePath,
          componentName,
          typescript,
        });
        logger.success`
Ejected name=${componentName} from name=${themeName} to path=${result.createdFiles}
`;
        return result;
      }
      default:
        throw new Error(`Unexpected action ${action}`);
    }
  }

  await executeAction();

  return process.exit(0);
}
