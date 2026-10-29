/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {globTranslatableSourceFiles} from '@docusaurus/glob';
import {realpath} from '@docusaurus/fs';
import {loadContext, type LoadContextParams} from '../server/site';
import {initPlugins} from '../server/plugins/init';
import {
  writePluginTranslations,
  writeCodeTranslations,
  type WriteTranslationsOptions,
  loadPluginsDefaultCodeTranslationMessages,
  applyDefaultCodeTranslations,
} from '../server/translations/translations';
import {extractSiteSourceCodeTranslations} from '../server/translations/translationsExtractor';
import type {InitializedPlugin} from '@docusaurus/types';

export type WriteTranslationsCLIOptions = Pick<
  LoadContextParams,
  'config' | 'locale'
> &
  WriteTranslationsOptions;

function resolveThemeCommonLibDir(): string | undefined {
  try {
    return path.dirname(require.resolve('@docusaurus/theme-common'));
  } catch {
    return undefined;
  }
}

/**
 * This is a hack, so that @docusaurus/theme-common translations are extracted!
 * A theme doesn't have a way to express that one of its dependency (like
 * @docusaurus/theme-common) also has translations to extract.
 * Instead of introducing a new lifecycle (like `getThemeTranslationPaths()`?)
 * We just make an exception and assume that user is using an official theme
 */
async function getExtraSourceCodeFilePaths(): Promise<string[]> {
  const themeCommonLibDir = resolveThemeCommonLibDir();
  if (!themeCommonLibDir) {
    return []; // User may not use a Docusaurus official theme? Quite unlikely...
  }
  return globTranslatableSourceFiles([themeCommonLibDir]);
}

async function writePluginTranslationFiles({
  localizationDir,
  plugin,
  options,
}: {
  localizationDir: string;
  plugin: InitializedPlugin;
  options: WriteTranslationsOptions;
}) {
  if (plugin.getTranslationFiles) {
    const content = await plugin.loadContent?.();
    const translationFiles = await plugin.getTranslationFiles({
      content,
    });

    await Promise.all(
      translationFiles.map(async (translationFile) => {
        await writePluginTranslations({
          localizationDir,
          plugin,
          translationFile,
          options,
        });
      }),
    );
  }
}

export async function writeTranslations(
  siteDirParam: string = '.',
  options: Partial<WriteTranslationsCLIOptions> = {},
): Promise<void> {
  const siteDir = await realpath(siteDirParam);

  const context = await loadContext({
    siteDir,
    config: options.config,
    locale: options.locale,
  });
  const {localizationDir} = context;
  const plugins = await initPlugins(context);

  const locale = options.locale ?? context.i18n.defaultLocale;

  if (!context.i18n.locales.includes(locale)) {
    throw new Error(
      `Can't write-translation for locale "${locale}" that is not in the locale configuration file.
Available locales are: ${context.i18n.locales.join(',')}.`,
    );
  }

  const extractedCodeTranslations = await extractSiteSourceCodeTranslations({
    siteDir,
    plugins,
    extraSourceCodeFilePaths: await getExtraSourceCodeFilePaths(),
  });

  const defaultCodeMessages =
    await loadPluginsDefaultCodeTranslationMessages(plugins);

  const codeTranslations = applyDefaultCodeTranslations({
    extractedCodeTranslations,
    defaultCodeMessages,
  });

  await writeCodeTranslations({localizationDir}, codeTranslations, options);

  await Promise.all(
    plugins.map(async (plugin) => {
      await writePluginTranslationFiles({localizationDir, plugin, options});
    }),
  );
}
