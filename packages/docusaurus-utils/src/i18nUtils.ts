/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import logger from '@docusaurus/logger';
import {DEFAULT_PLUGIN_ID} from './constants';
import type {
  TranslationFileContent,
  TranslationFile,
  I18n,
  I18nLocaleConfig,
} from '@docusaurus/types';

/**
 * Takes a list of translation file contents, and shallow-merges them into one.
 */
export function mergeTranslations(
  contents: TranslationFileContent[],
): TranslationFileContent {
  return contents.reduce((acc, content) => ({...acc, ...content}), {});
}

/**
 * Useful to update all the messages of a translation file. Used in tests to
 * simulate translations.
 */
export function updateTranslationFileMessages(
  translationFile: TranslationFile,
  updateMessage: (message: string) => string,
): TranslationFile {
  return {
    ...translationFile,
    content: _.mapValues(translationFile.content, (translation) => ({
      ...translation,
      message: updateMessage(translation.message),
    })),
  };
}

/**
 * Takes everything needed and constructs a plugin i18n path. Plugins should
 * expect everything it needs for translations to be found under this path.
 */
export function getPluginI18nPath({
  localizationDir,
  pluginName,
  pluginId = DEFAULT_PLUGIN_ID,
  subPaths = [],
}: {
  localizationDir: string;
  pluginName: string;
  pluginId?: string | undefined;
  subPaths?: string[];
}): string {
  return path.join(
    localizationDir,
    // Make it convenient to use for single-instance
    // ie: return "docs", not "docs-default" nor "docs/default"
    `${pluginName}${pluginId === DEFAULT_PLUGIN_ID ? '' : `-${pluginId}`}`,
    ...subPaths,
  );
}

// TODO we may extract this to a separate package
//  we want to use it on the frontend too
//  but "docusaurus-utils-common" (agnostic utils) is not an ideal place since
export function getLocaleConfig(i18n: I18n, locale?: string): I18nLocaleConfig {
  const localeToLookFor = locale ?? i18n.currentLocale;
  const localeConfig = i18n.localeConfigs[localeToLookFor];
  if (!localeConfig) {
    throw new Error(
      `Can't find locale config for locale ${logger.code(localeToLookFor)}`,
    );
  }
  return localeConfig;
}
