/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import _ from 'lodash';
import {readJSON} from '@docusaurus/fs';
import {extractThemeCodeMessages} from '../../src/utils';

describe('theme translations', () => {
  it('has base messages files contain EXACTLY all the translations extracted from the theme. Please run "pnpm --filter @docusaurus/theme-translations run update" to keep base messages files up-to-date', async () => {
    const baseMessagesDirPath = path.join(__dirname, '../base');
    const baseMessages = await fs
      .readdir(baseMessagesDirPath)
      .then((files) =>
        Promise.all(
          files.map(
            (baseMessagesFile) =>
              readJSON(
                path.join(baseMessagesDirPath, baseMessagesFile),
              ) as Promise<{[key: string]: string}>,
          ),
        ),
      )
      .then((translations) =>
        Object.fromEntries(
          translations
            .map(Object.entries)
            .flat()
            .filter(([key]) => !key.endsWith('___DESCRIPTION')),
        ),
      );
    const codeMessages = _.mapValues(
      await extractThemeCodeMessages(),
      (translation) => translation.message,
    );

    expect(codeMessages).toEqual(baseMessages);
  });

  // The update script only logs "Some localized messages do not exist in
  // base.json!" and never fails. When a message id is renamed in the theme
  // code, the translation stays under the old id that nothing reads anymore,
  // and the new id falls back to the English base text.
  it('has localized messages files that only use the message ids of the base messages files', async () => {
    const staleMessages = await getStaleLocalizedMessages();

    expect(
      staleMessages,
      'These localized message ids do not exist in the base messages files. Move their translation to the new message id if it was renamed, or delete them',
    ).toEqual([]);
  });
});

const LocalesDirPath = path.join(__dirname, '..');

type Messages = {[id: string]: string};

// Returns the "<locale>/<file>: <id>" localized messages whose id is not in
// the matching base messages file
async function getStaleLocalizedMessages(): Promise<string[]> {
  const files = await fs.readdir(path.join(LocalesDirPath, 'base'));
  const locales = await getLocales();

  const staleMessages = await Promise.all(
    locales.flatMap((locale) =>
      files.map((file) => getStaleLocaleFileMessages(locale, file)),
    ),
  );
  return staleMessages.flat();
}

async function getStaleLocaleFileMessages(
  locale: string,
  file: string,
): Promise<string[]> {
  const baseMessages = await readMessagesFile('base', file);
  const localeMessages = await readMessagesFile(locale, file);

  const staleIds = _.difference(
    Object.keys(localeMessages),
    Object.keys(baseMessages),
  );
  return staleIds.map((id) => `${locale}/${file}: ${id}`);
}

async function getLocales(): Promise<string[]> {
  const entries = await fs.readdir(LocalesDirPath, {withFileTypes: true});
  const localeDirs = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      // Ignore hidden directories created by tools
      !entry.name.startsWith('.') &&
      entry.name !== 'base' &&
      entry.name !== '__tests__',
  );
  return localeDirs.map((entry) => entry.name);
}

function readMessagesFile(locale: string, file: string): Promise<Messages> {
  return readJSON(path.join(LocalesDirPath, locale, file)) as Promise<Messages>;
}
