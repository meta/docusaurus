/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import {
  THEME_PATH,
  fileToPath,
  posixPath,
  normalizeUrl,
} from '@docusaurus/utils';
import {glob} from '@docusaurus/glob';
import {fs, pathExists} from '@docusaurus/fs';
import type {LoadedPlugin} from '@docusaurus/types';

/**
 * Aliases used for Webpack resolution (useful for implementing swizzling)
 */
type ThemeAliases = {[alias: string]: string};

const ThemeFallbackDir = path.join(__dirname, '../../client/theme-fallback');

/**
 * Order of Webpack aliases is important because one alias can shadow another.
 * This ensures `@theme/NavbarItem` alias is after
 * `@theme/NavbarItem/LocaleDropdown`.
 *
 * @see https://github.com/facebook/docusaurus/pull/3922
 * @see https://github.com/facebook/docusaurus/issues/5382
 */
export function sortAliases(aliases: ThemeAliases): ThemeAliases {
  // Alphabetical order by default
  const entries = _.sortBy(Object.entries(aliases), ([alias]) => alias);
  // @theme/NavbarItem should be after @theme/NavbarItem/LocaleDropdown
  entries.sort(([alias1], [alias2]) =>
    // eslint-disable-next-line no-nested-ternary
    alias1.includes(`${alias2}/`) ? -1 : alias2.includes(`${alias1}/`) ? 1 : 0,
  );
  return Object.fromEntries(entries);
}

export async function createAliasesForTheme(
  themePath: string,
  addOriginalAlias: boolean,
): Promise<ThemeAliases> {
  if (!(await pathExists(themePath))) {
    return {};
  }

  const themeComponentFiles = await glob(['**/*.{js,jsx,ts,tsx}'], {
    cwd: themePath,
    ignore: [
      // Ignore co-located test files
      '**/__tests__/**',
      '**/*.test.{js,jsx,ts,tsx}',
      // Ignore type declaration files
      '**/*.d.ts',
    ],
  });

  const aliases: ThemeAliases = {};

  themeComponentFiles.forEach((relativeSource) => {
    const filePath = path.join(themePath, relativeSource);
    const fileName = fileToPath(relativeSource);

    const aliasName = posixPath(
      normalizeUrl(['@theme', fileName]).replace(/\/$/, ''),
    );
    aliases[aliasName] = filePath;

    if (addOriginalAlias) {
      // For swizzled components to access the original.
      const originalAliasName = posixPath(
        normalizeUrl(['@theme-original', fileName]).replace(/\/$/, ''),
      );
      aliases[originalAliasName] = filePath;
    }
  });

  return sortAliases(aliases);
}

async function createThemeAliases(
  themePaths: string[],
  userThemePaths: string[],
): Promise<ThemeAliases> {
  const aliases: ThemeAliases = {};

  for (const themePath of themePaths) {
    const themeAliases = await createAliasesForTheme(themePath, true);
    Object.entries(themeAliases).forEach(([aliasKey, alias]) => {
      // If this alias shadows a previous one, use @theme-init to preserve the
      // initial one. @theme-init is only applied once: to the initial theme
      // that provided this component
      if (aliasKey in aliases) {
        const componentName = aliasKey.substring(aliasKey.indexOf('/') + 1);
        const initAlias = `@theme-init/${componentName}`;
        if (!(initAlias in aliases)) {
          aliases[initAlias] = aliases[aliasKey]!;
        }
      }
      aliases[aliasKey] = alias;
    });
  }

  for (const themePath of userThemePaths) {
    const userThemeAliases = await createAliasesForTheme(themePath, false);
    Object.assign(aliases, userThemeAliases);
  }

  return sortAliases(aliases);
}

export function loadThemeAliases({
  siteDir,
  plugins,
}: {
  siteDir: string;
  plugins: LoadedPlugin[];
}): Promise<ThemeAliases> {
  const pluginThemes: string[] = plugins
    .map(
      (plugin) =>
        plugin.getThemePath && path.resolve(plugin.path, plugin.getThemePath()),
    )
    .filter((x): x is string => Boolean(x));
  const userTheme = path.resolve(siteDir, THEME_PATH);
  return createThemeAliases([ThemeFallbackDir, ...pluginThemes], [userTheme]);
}

/**
 * Note: a `@docusaurus` alias would also catch `@docusaurus/theme-common`, so
 * instead of naively aliasing this to `client/exports`, we use fine-grained
 * aliases instead.
 */
export async function loadDocusaurusAliases(): Promise<ThemeAliases> {
  const dirPath = path.resolve(__dirname, '../../client/exports');
  const extensions = ['.js', '.ts', '.tsx'];

  const aliases: ThemeAliases = {};

  (await fs.readdir(dirPath))
    .filter((fileName) => extensions.includes(path.extname(fileName)))
    .forEach((fileName) => {
      const fileNameWithoutExtension = path.basename(
        fileName,
        path.extname(fileName),
      );
      const aliasName = `@docusaurus/${fileNameWithoutExtension}`;
      aliases[aliasName] = path.resolve(dirPath, fileName);
    });

  return aliases;
}
