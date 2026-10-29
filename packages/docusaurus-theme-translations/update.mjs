/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-check

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import _ from 'lodash';
import {logger} from '@docusaurus/logger';
import {pathExists, outputFile, readJSON} from '@docusaurus/fs';
import {getThemes, extractThemeCodeMessages} from './lib/utils.js';

const LocalesDirPath = fileURLToPath(new URL('locales', import.meta.url));
const Themes = await getThemes();
const AllThemesSrcDirs = Themes.flatMap((theme) => theme.src);

logger.info`Will scan folders for code translations:path=${AllThemesSrcDirs}`;

/**
 * @param {string} locale
 * @param {string} themeName
 */
function getThemeLocalePath(locale, themeName) {
  return path.join(LocalesDirPath, locale, `${themeName}.json`);
}

/**
 * @param {string} key
 */
function removeDescriptionSuffix(key) {
  if (key.replace('___DESCRIPTION', '')) {
    return key.replace('___DESCRIPTION', '');
  }
  return key;
}

/**
 * @param {Record<string, string>} obj
 */
function sortObjectKeys(obj) {
  const keys = _.orderBy(Object.keys(obj), (k) => removeDescriptionSuffix(k));
  return Object.fromEntries(keys.map((k) => [k, obj[k]]));
}

/**
 * @param {string} filePath
 * @returns {Promise<Record<string, string>>}
 */
async function readMessagesFile(filePath) {
  if (!(await pathExists(filePath))) {
    logger.info`File path=${filePath} not found. Creating new translation base file.`;
    await outputFile(filePath, '{}\n');
  }
  return /** @type {Promise<Record<string, string>>} */ (readJSON(filePath));
}

/**
 * @param {string} filePath
 * @param {Record<string, string>} messages
 */
async function writeMessagesFile(filePath, messages) {
  const sortedMessages = sortObjectKeys(messages);

  const content = `${JSON.stringify(sortedMessages, null, 2)}\n`; // \n makes prettier happy
  await outputFile(filePath, content);
  logger.info`path=${path.basename(
    filePath,
  )} updated subdue=${logger.interpolate`(number=${
    Object.keys(sortedMessages).length
  } messages)`}\n`;
}

/**
 * @param {string} themeName
 */
async function getCodeTranslationFiles(themeName) {
  const baseFile = getThemeLocalePath('base', themeName);
  const localesFiles = (await fs.readdir(LocalesDirPath))
    .filter((dirName) => dirName !== 'base' && !dirName.startsWith('__'))
    .map((locale) => getThemeLocalePath(locale, themeName));
  return {baseFile, localesFiles};
}

const DescriptionSuffix = '___DESCRIPTION';

/**
 * @param {string} baseFile
 * @param {string[]} targetDirs
 */
async function updateBaseFile(baseFile, targetDirs) {
  const baseMessagesWithDescriptions = await readMessagesFile(baseFile);
  const baseMessages = _.pickBy(
    baseMessagesWithDescriptions,
    (v, key) => !key.endsWith(DescriptionSuffix),
  );

  const codeExtractedTranslations = await extractThemeCodeMessages(targetDirs);
  const codeMessages = _.mapValues(
    codeExtractedTranslations,
    (translation) => translation.message,
  );

  const unknownMessages = _.difference(
    Object.keys(baseMessages),
    Object.keys(codeMessages),
  );

  if (unknownMessages.length) {
    logger.error`Some messages exist in base locale but were not found by the code extractor!
They won't be removed automatically, so do the cleanup manually if necessary! code=${unknownMessages}`;
  }

  const newBaseMessages = {
    ...baseMessages, // Ensure we don't automatically remove unknown messages
    ...codeMessages,
  };

  /** @type {Record<string, string>} */
  const newBaseMessagesDescriptions = Object.entries(newBaseMessages).reduce(
    (acc, [key]) => {
      const codeTranslation = codeExtractedTranslations[key];
      return {
        ...acc,
        [`${key}${DescriptionSuffix}`]: codeTranslation
          ? codeTranslation.description
          : undefined,
      };
    },
    {},
  );

  const newBaseMessagesWitDescription = {
    ...newBaseMessages,
    ...newBaseMessagesDescriptions,
  };

  await writeMessagesFile(baseFile, newBaseMessagesWitDescription);

  return newBaseMessages;
}

/**
 * @param {string} localeFile
 * @param {Record<string, string>} baseFileMessages
 */
async function updateLocaleCodeTranslations(localeFile, baseFileMessages) {
  const localeFileMessages = await readMessagesFile(localeFile);

  const unknownMessages = _.difference(
    Object.keys(localeFileMessages),
    Object.keys(baseFileMessages),
  );

  if (unknownMessages.length) {
    logger.error`Some localized messages do not exist in base.json!
You may want to delete these! code=${unknownMessages}`;
  }

  const newLocaleFileMessages = {
    ...baseFileMessages,
    ...localeFileMessages,
  };

  const untranslatedKeys = Object.entries(newLocaleFileMessages)
    .filter(([key, value]) => value === baseFileMessages[key])
    .map(([key]) => key);

  if (untranslatedKeys.length) {
    logger.warn`Some messages do not seem to be translated! code=${untranslatedKeys}`;
  }

  await writeMessagesFile(localeFile, newLocaleFileMessages);
  return {untranslated: untranslatedKeys.length};
}

/** @type {Record<string, {untranslated: number}>} */
const stats = {};
let messageCount = 0;
const {2: newLocale} = process.argv;
for (const theme of Themes) {
  const {baseFile, localesFiles} = await getCodeTranslationFiles(theme.name);
  logger.info`Will update base file for name=${theme.name}\n`;
  const baseFileMessages = await updateBaseFile(baseFile, theme.src);

  if (newLocale) {
    const newLocalePath = getThemeLocalePath(newLocale, theme.name);

    if (!(await pathExists(newLocalePath))) {
      await writeMessagesFile(newLocalePath, baseFileMessages);
      logger.success`Locale file path=${path.basename(
        newLocalePath,
      )} have been created.`;
    } else {
      logger.warn`Locale file path=${path.basename(
        newLocalePath,
      )} was already created!`;
    }
  } else {
    for (const localeFile of localesFiles) {
      const localeName = path.basename(path.dirname(localeFile));
      const pluginName = path.basename(localeFile, path.extname(localeFile));
      logger.info`Will update name=${localeName} locale in name=${pluginName}`;
      const stat = await updateLocaleCodeTranslations(
        localeFile,
        baseFileMessages,
      );

      (stats[localeName] ??= {untranslated: 0}).untranslated +=
        stat.untranslated;
    }
    messageCount += Object.keys(baseFileMessages).length;
  }
}

logger.success('updateCodeTranslations end\n');
if (newLocale) {
  process.exit();
}
const locales = Object.entries(stats).sort(
  (a, b) => a[1].untranslated - b[1].untranslated,
);
const messages = locales.map(([name, stat]) => {
  const percentage = (messageCount - stat.untranslated) / messageCount;
  const filled = Math.floor(percentage * 30);
  const color =
    // eslint-disable-next-line no-nested-ternary
    percentage > 0.99
      ? logger.green
      : percentage > 0.7
        ? logger.yellow
        : logger.red;
  const progress = color(
    `[${''.padStart(filled, '=')}${''.padStart(30 - filled, ' ')}]`,
  );
  return logger.interpolate`name=${name.padStart(8)} ${progress} ${(
    percentage * 100
  ).toFixed(1)} subdue=${`(${
    messageCount - stat.untranslated
  }/${messageCount})`}`;
});
logger.info`Translation coverage:
${messages.join('\n')}`;
