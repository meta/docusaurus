/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import logger from '@docusaurus/logger';
import leven from 'leven';
import {askThemeName} from './prompts';
import {findStringIgnoringCase, type SwizzlePlugin} from './common';

function pluginToThemeName(plugin: SwizzlePlugin): string | undefined {
  if (plugin.instance.getThemePath) {
    return (
      (plugin.instance.version as {name?: string}).name ?? plugin.instance.name
    );
  }
  return undefined;
}

export function getPluginByThemeName(
  plugins: SwizzlePlugin[],
  themeName: string,
): SwizzlePlugin {
  const plugin = plugins.find((p) => pluginToThemeName(p) === themeName);
  if (!plugin) {
    throw new Error(`Theme ${themeName} not found`);
  }
  return plugin;
}

export function getThemeNames(plugins: SwizzlePlugin[]): string[] {
  const themeNames = _.uniq(
    // The fact that getThemePath is attached to the plugin instance makes
    // this code impossible to optimize. If this is a static method, we don't
    // need to initialize all plugins just to filter which are themes
    // Benchmark: loadContext-58ms; initPlugins-323ms
    plugins.map((plugin) => pluginToThemeName(plugin)).filter(Boolean),
  ) as string[];

  // Opinionated ordering: user is most likely to swizzle:
  // - the classic theme
  // - official themes
  // - official plugins
  return _.orderBy(
    themeNames,
    [
      (t) => t === '@docusaurus/theme-classic',
      (t) => t.includes('@docusaurus/theme'),
      (t) => t.includes('@docusaurus'),
    ],
    ['desc', 'desc', 'desc'],
  );
}

// Returns a valid value if recovering is possible
function handleInvalidThemeName({
  themeNameParam,
  themeNames,
}: {
  themeNameParam: string;
  themeNames: string[];
}): string {
  // Trying to recover invalid value
  // We look for potential matches that only differ in casing.
  const differentCaseMatch = findStringIgnoringCase(themeNameParam, themeNames);
  if (differentCaseMatch) {
    logger.warn`Theme name=${themeNameParam} doesn't exist.`;
    logger.info`name=${differentCaseMatch} will be used instead of name=${themeNameParam}.`;
    return differentCaseMatch;
  }

  // TODO recover from short theme-names here: "classic" => "@docusaurus/theme-classic"

  // No recovery value is possible: print error
  const suggestion = themeNames.find((name) => leven(name, themeNameParam) < 4);
  logger.error`Theme name=${themeNameParam} not found. ${
    suggestion
      ? logger.interpolate`Did you mean name=${suggestion}?`
      : logger.interpolate`Themes available for swizzle: ${themeNames}`
  }`;
  return process.exit(1);
}

function validateThemeName({
  themeNameParam,
  themeNames,
}: {
  themeNameParam: string;
  themeNames: string[];
}): string {
  const isValidName = themeNames.includes(themeNameParam);
  if (!isValidName) {
    return handleInvalidThemeName({
      themeNameParam,
      themeNames,
    });
  }
  return themeNameParam;
}

export async function getThemeName({
  themeNameParam,
  themeNames,
  list,
}: {
  themeNameParam: string | undefined;
  themeNames: string[];
  list: boolean | undefined;
}): Promise<string> {
  if (list && !themeNameParam) {
    logger.info`Themes available for swizzle: name=${themeNames}`;
    return process.exit(0);
  }
  return themeNameParam
    ? validateThemeName({themeNameParam, themeNames})
    : askThemeName(themeNames);
}

export function getThemePath({
  plugins,
  themeName,
  typescript,
}: {
  plugins: SwizzlePlugin[];
  themeName: string;
  typescript: boolean | undefined;
}): string {
  const pluginInstance = getPluginByThemeName(plugins, themeName);
  const themePath = typescript
    ? pluginInstance.instance.getTypeScriptThemePath &&
      path.resolve(
        pluginInstance.instance.path,
        pluginInstance.instance.getTypeScriptThemePath(),
      )
    : pluginInstance.instance.getThemePath &&
      path.resolve(
        pluginInstance.instance.path,
        pluginInstance.instance.getThemePath(),
      );
  if (!themePath) {
    logger.warn(
      typescript
        ? logger.interpolate`name=${themeName} does not provide TypeScript theme code via ${'getTypeScriptThemePath()'}.`
        : // This is... technically possible to happen, e.g. returning undefined
          // from getThemePath. Plugins may intentionally or unintentionally
          // disguise as themes?
          logger.interpolate`name=${themeName} does not provide any theme code.`,
    );
    return process.exit(1);
  }
  return themePath;
}
