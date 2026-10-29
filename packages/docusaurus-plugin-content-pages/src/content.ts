/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {
  encodePath,
  fileToPath,
  aliasedSitePath,
  getFolderContainingFile,
  normalizeUrl,
  parseMarkdownFile,
  isUnlisted,
  isDraft,
  readLastUpdateData,
  getEditUrl,
  posixPath,
  getPluginI18nPath,
  getContentPathList,
  getLocaleConfig,
  type ContentPaths,
} from '@docusaurus/utils';
import {glob} from '@docusaurus/glob';
import {fs} from '@docusaurus/fs';
import {validatePageFrontMatter} from './frontMatter';
import type {LoadContext} from '@docusaurus/types';
import type {
  PluginOptions,
  Metadata,
  LoadedContent,
} from '@docusaurus/plugin-content-pages';

export function createPagesContentPaths({
  context,
  options,
}: {
  context: LoadContext;
  options: PluginOptions;
}): ContentPaths {
  const {siteDir, localizationDir} = context;

  const shouldTranslate = getLocaleConfig(context.i18n).translate;
  return {
    contentPath: path.resolve(siteDir, options.path),
    contentPathLocalized: shouldTranslate
      ? getPluginI18nPath({
          localizationDir,
          pluginName: 'docusaurus-plugin-content-pages',
          pluginId: options.id,
        })
      : undefined,
  };
}

const isMarkdownSource = (source: string) =>
  source.endsWith('.md') || source.endsWith('.mdx');

type LoadContentParams = {
  context: LoadContext;
  options: PluginOptions;
  contentPaths: ContentPaths;
};

export async function loadPagesContent(
  params: LoadContentParams,
): Promise<LoadedContent> {
  const {options} = params;

  const pagesFiles = await glob(params.options.include, {
    cwd: params.contentPaths.contentPath,
    ignore: options.exclude,
  });

  async function doProcessPageSourceFile(relativeSource: string) {
    try {
      return await processPageSourceFile(relativeSource, params);
    } catch (err) {
      throw new Error(
        `Processing of page source file path=${relativeSource} failed.`,
        {cause: err},
      );
    }
  }

  return (await Promise.all(pagesFiles.map(doProcessPageSourceFile))).filter(
    (res): res is Metadata => {
      return res !== undefined;
    },
  );
}

async function processPageSourceFile(
  relativeSource: string,
  params: LoadContentParams,
): Promise<Metadata | undefined> {
  const {context, options, contentPaths} = params;
  const {siteConfig, baseUrl, siteDir, i18n} = context;
  const {vcs} = siteConfig;
  const {editUrl} = options;

  // Lookup in localized folder in priority
  const contentPath = await getFolderContainingFile(
    getContentPathList(contentPaths),
    relativeSource,
  );

  const source = path.join(contentPath, relativeSource);
  const aliasedSourcePath = aliasedSitePath(source, siteDir);

  const filenameSlug = encodePath(fileToPath(relativeSource));

  if (!isMarkdownSource(relativeSource)) {
    // For now, slug can't be customized for JSX pages
    const slug = filenameSlug;
    const permalink = normalizeUrl([baseUrl, options.routeBasePath, slug]);
    return {
      type: 'jsx',
      permalink,
      source: aliasedSourcePath,
    };
  }

  const content = await fs.readFile(source, 'utf-8');
  const {
    frontMatter: unsafeFrontMatter,
    contentTitle,
    excerpt,
  } = await parseMarkdownFile({
    filePath: source,
    fileContent: content,
    parseFrontMatter: siteConfig.markdown.parseFrontMatter,
  });
  const frontMatter = validatePageFrontMatter(unsafeFrontMatter);

  const slug = frontMatter.slug ?? filenameSlug;
  const permalink = normalizeUrl([baseUrl, options.routeBasePath, slug]);

  const pagesDirPath = await getFolderContainingFile(
    getContentPathList(contentPaths),
    relativeSource,
  );

  const pagesSourceAbsolute = path.join(pagesDirPath, relativeSource);

  function getPagesEditUrl() {
    const pagesPathRelative = path.relative(
      pagesDirPath,
      path.resolve(pagesSourceAbsolute),
    );

    if (typeof editUrl === 'function') {
      return editUrl({
        pagesDirPath: posixPath(path.relative(siteDir, pagesDirPath)),
        pagesPath: posixPath(pagesPathRelative),
        permalink,
        locale: i18n.currentLocale,
      });
    } else if (typeof editUrl === 'string') {
      const isLocalized = pagesDirPath === contentPaths.contentPathLocalized;
      const fileContentPath =
        isLocalized &&
        options.editLocalizedFiles &&
        contentPaths.contentPathLocalized
          ? contentPaths.contentPathLocalized
          : contentPaths.contentPath;

      const contentPathEditUrl = normalizeUrl([
        editUrl,
        posixPath(path.relative(siteDir, fileContentPath)),
      ]);

      return getEditUrl(pagesPathRelative, contentPathEditUrl);
    }
    return undefined;
  }

  const lastUpdatedData = await readLastUpdateData(
    source,
    options,
    frontMatter.last_update,
    vcs,
  );

  if (isDraft({frontMatter})) {
    return undefined;
  }
  const unlisted = isUnlisted({frontMatter});

  return {
    type: 'mdx',
    permalink,
    source: aliasedSourcePath,
    title: frontMatter.title ?? contentTitle,
    description: frontMatter.description ?? excerpt,
    frontMatter,
    lastUpdatedBy: lastUpdatedData.lastUpdatedBy,
    lastUpdatedAt: lastUpdatedData.lastUpdatedAt,
    editUrl: getPagesEditUrl(),
    unlisted,
  };
}
