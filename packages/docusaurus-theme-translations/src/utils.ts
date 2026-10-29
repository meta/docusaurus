/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This file isn't used by index.ts. It's used by update.mjs and tests. It's
// only here so that (a) we get a partially typed infrastructure (although the
// update script has ts-check anyways) (b) the test coverage isn't destroyed by
// the untested update.mjs file (c) we can ergonomically import the util
// functions in the Jest test without using `await import`

import path from 'node:path';
import {globTranslatableSourceFiles} from '@docusaurus/glob';
import {extractAllSourceCodeFileTranslations} from '@docusaurus/babel';
import {readJSON} from '@docusaurus/fs';
import type {TranslationFileContent} from '@docusaurus/types';

async function getPackageCodePath(packageName: string) {
  const packagePath = path.join(__dirname, '../..', packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  const {main} = (await readJSON(packageJsonPath)) as {main: string};
  const packageSrcPath = path.join(packagePath, path.dirname(main));
  return packageSrcPath;
}

export async function getThemes(): Promise<{name: string; src: string[]}[]> {
  return [
    {
      name: 'theme-common',
      src: [
        await getPackageCodePath('docusaurus-theme-classic'),
        await getPackageCodePath('docusaurus-theme-common'),
        path.join(
          await getPackageCodePath('docusaurus-plugin-content-docs'),
          'client',
        ),
        path.join(
          await getPackageCodePath('docusaurus-plugin-content-blog'),
          'client',
        ),
      ],
    },
    {
      name: 'theme-search-algolia',
      src: [await getPackageCodePath('docusaurus-theme-search-algolia')],
    },
    {
      name: 'theme-live-codeblock',
      src: [await getPackageCodePath('docusaurus-theme-live-codeblock')],
    },
    {
      name: 'plugin-pwa',
      src: [await getPackageCodePath('docusaurus-plugin-pwa')],
    },
    {
      name: 'plugin-ideal-image',
      src: [await getPackageCodePath('docusaurus-plugin-ideal-image')],
    },
  ];
}

export async function extractThemeCodeMessages(
  targetDirs?: string[],
): Promise<TranslationFileContent> {
  // eslint-disable-next-line no-param-reassign
  targetDirs ??= (await getThemes()).flatMap((theme) => theme.src);

  const filePaths = (await globTranslatableSourceFiles(targetDirs)).filter(
    (filePath) => ['.js', '.jsx'].includes(path.extname(filePath)),
  );

  const filesExtractedTranslations = await extractAllSourceCodeFileTranslations(
    filePaths,
    {
      presets: [require.resolve('@docusaurus/babel/preset')],
    },
  );

  filesExtractedTranslations.forEach((fileExtractedTranslations) => {
    if (fileExtractedTranslations.warnings.length > 0) {
      throw new Error(`Please make sure all theme translations are static!
Some warnings were found!

${fileExtractedTranslations.warnings.join('\n\n')}
`);
    }
  });

  const translations = filesExtractedTranslations.reduce(
    (acc, extractedTranslations) => ({
      ...acc,
      ...extractedTranslations.translations,
    }),
    {},
  );

  return translations;
}
