/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import nodePath from 'node:path';
import logger from '@docusaurus/logger';
import {SRC_DIR_NAME} from '@docusaurus/utils';
import {globTranslatableSourceFiles} from '@docusaurus/glob';
import {
  getBabelOptions,
  getCustomBabelConfigFilePath,
  extractAllSourceCodeFileTranslations,
} from '@docusaurus/babel';
import type {
  InitializedPlugin,
  TranslationFileContent,
} from '@docusaurus/types';

function getSiteSourceCodeFilePaths(siteDir: string): string[] {
  return [nodePath.join(siteDir, SRC_DIR_NAME)];
}

function getPluginSourceCodeFilePaths(plugin: InitializedPlugin): string[] {
  // The getPathsToWatch() generally returns the js/jsx/ts/tsx/md/mdx file paths
  // We can use this method as well to know which folders we should try to
  // extract translations from. Hacky/implicit, but do we want to introduce a
  // new lifecycle method just for that???
  const codePaths: string[] = plugin.getPathsToWatch?.() ?? [];

  // We also include theme code
  const themePath = plugin.getThemePath?.();
  if (themePath) {
    codePaths.push(themePath);
  }

  return codePaths.map((p) => nodePath.resolve(plugin.path, p));
}

async function getSourceCodeFilePaths(
  siteDir: string,
  plugins: InitializedPlugin[],
): Promise<string[]> {
  const sitePaths = getSiteSourceCodeFilePaths(siteDir);

  // The getPathsToWatch() generally returns the js/jsx/ts/tsx/md/mdx file paths
  // We can use this method as well to know which folders we should try to
  // extract translations from. Hacky/implicit, but do we want to introduce a
  // new lifecycle method for that???
  const pluginsPaths = plugins.flatMap(getPluginSourceCodeFilePaths);

  const allPaths = [...sitePaths, ...pluginsPaths];

  return globTranslatableSourceFiles(allPaths);
}

export async function extractSiteSourceCodeTranslations({
  siteDir,
  plugins,
  extraSourceCodeFilePaths = [],
}: {
  siteDir: string;
  plugins: InitializedPlugin[];
  extraSourceCodeFilePaths?: string[];
}): Promise<TranslationFileContent> {
  const babelOptions = getBabelOptions({
    isServer: true,
    configFile: await getCustomBabelConfigFilePath(siteDir),
  });

  // Should we warn here if the same translation "key" is found in multiple
  // source code files?
  function toTranslationFileContent(
    sourceCodeFileTranslations: SourceCodeFileTranslations[],
  ): TranslationFileContent {
    return sourceCodeFileTranslations.reduce(
      (acc, item) => ({...acc, ...item.translations}),
      {},
    );
  }

  const sourceCodeFilePaths = await getSourceCodeFilePaths(siteDir, plugins);

  const allSourceCodeFilePaths = [
    ...sourceCodeFilePaths,
    ...extraSourceCodeFilePaths,
  ];

  const sourceCodeFilesTranslations =
    await extractAllSourceCodeFileTranslations(
      allSourceCodeFilePaths,
      babelOptions,
    );

  logSourceCodeFileTranslationsWarnings(sourceCodeFilesTranslations);

  return toTranslationFileContent(sourceCodeFilesTranslations);
}

function logSourceCodeFileTranslationsWarnings(
  sourceCodeFilesTranslations: SourceCodeFileTranslations[],
) {
  sourceCodeFilesTranslations.forEach(({sourceCodeFilePath, warnings}) => {
    if (warnings.length > 0) {
      logger.warn`Translation extraction warnings for file path=${sourceCodeFilePath}: ${warnings}`;
    }
  });
}

type SourceCodeFileTranslations = {
  sourceCodeFilePath: string;
  translations: TranslationFileContent;
  warnings: string[];
};
