/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {readJSON} from '@docusaurus/fs';
import {
  codeTranslationLocalesToTry,
  readDefaultCodeTranslationMessages,
} from '../index';

describe('codeTranslationLocalesToTry', () => {
  it('returns appropriate locale lists', () => {
    expect(codeTranslationLocalesToTry('fr')).toEqual([
      'fr',
      'fr-FR',
      'fr-Latn',
      'fr',
    ]);
    expect(codeTranslationLocalesToTry('fr-FR')).toEqual([
      'fr-FR',
      'fr-FR',
      'fr-Latn',
      'fr',
    ]);
    // Note: "pt" is expanded into "pt-BR", not "pt-PT", as "pt-BR" is more
    // widely used! See https://github.com/facebook/docusaurus/pull/4536#issuecomment-810088783
    expect(codeTranslationLocalesToTry('pt')).toEqual([
      'pt',
      'pt-BR',
      'pt-Latn',
      'pt',
    ]);
    expect(codeTranslationLocalesToTry('pt-BR')).toEqual([
      'pt-BR',
      'pt-BR',
      'pt-Latn',
      'pt',
    ]);
    expect(codeTranslationLocalesToTry('pt-PT')).toEqual([
      'pt-PT',
      'pt-PT',
      'pt-Latn',
      'pt',
    ]);
    expect(codeTranslationLocalesToTry('zh')).toEqual([
      'zh',
      'zh-CN',
      'zh-Hans',
      'zh',
    ]);
    expect(codeTranslationLocalesToTry('zh-cn')).toEqual([
      'zh-cn',
      'zh-CN',
      'zh-Hans',
      'zh',
    ]);
  });
});

describe('readDefaultCodeTranslationMessages', () => {
  const dirPath = path.resolve(
    __dirname,
    '__fixtures__',
    'defaultCodeTranslations',
  );
  const name = 'default';

  async function readAsJSON(locale: string, filename: string = name) {
    console.log(path.resolve(dirPath, locale, `${filename}.json`));

    return readJSON(path.resolve(dirPath, locale, `${filename}.json`));
  }

  it('for empty locale', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        name: 'default',
        locale: '',
        dirPath,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RangeError: First argument to Intl.Locale constructor can't be empty or missing]`,
    );
  });

  it('for nonexistent locale', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'es',
        dirPath,
        name,
      }),
    ).resolves.toEqual({});
  });

  it('for fr but bad folder', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'fr',
        dirPath: __dirname,
        name,
      }),
    ).resolves.toEqual({});
  });

  it('for fr', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'fr',
        dirPath,
        name,
      }),
    ).resolves.toEqual(await readAsJSON('fr'));
  });

  it('for fr-FR', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'fr-FR',
        dirPath,
        name,
      }),
    ).resolves.toEqual(await readAsJSON('fr-FR'));
  });

  it('for en', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'en',
        dirPath,
        name,
      }),
    ).resolves.toEqual(await readAsJSON('en'));
  });

  it('for en-US', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'en-US',
        dirPath,
        name,
      }),
    ).resolves.toEqual(await readAsJSON('en'));
  });

  it('for en-WHATEVER', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'en-WHATEVER',
        dirPath,
        name,
      }),
    ).resolves.toEqual(await readAsJSON('en'));
  });

  it('default locale', async () => {
    await expect(
      readDefaultCodeTranslationMessages({
        locale: 'zh',
        name: 'plugin-pwa',
      }),
    ).resolves.toEqual({
      'theme.PwaReloadPopup.closeButtonAriaLabel': '关闭',
      'theme.PwaReloadPopup.info': '有可用的新版本',
      'theme.PwaReloadPopup.refreshButtonText': '刷新',
    });
  });
});
