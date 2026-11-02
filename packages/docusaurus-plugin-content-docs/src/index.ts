/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {
  normalizeUrl,
  docuHash,
  aliasedSitePath,
  getContentPathList,
  posixPath,
  addTrailingPathSeparator,
  resolveMarkdownLinkPathname,
  DEFAULT_PLUGIN_ID,
} from '@docusaurus/utils';
import {createAbsoluteFilePathMatcher} from '@docusaurus/glob';
import {getTagsFilePathsToWatch} from '@docusaurus/utils-validation';
import {createMDXLoaderRule} from '@docusaurus/mdx-loader';
import {fs} from '@docusaurus/fs';
import {resolveSidebarPathOption} from './sidebars';
import {CategoryMetadataFilenamePattern} from './sidebars/generator';
import {type DocEnv} from './docs';
import {
  getVersionFromSourceFilePath,
  readVersionsMetadata,
  toFullVersion,
} from './versions/version';
import cliDocs from './cli';
import {VERSIONS_JSON_FILE} from './constants';
import {toGlobalDataVersion} from './globalData';
import {
  translateLoadedContent,
  getLoadedContentTranslationFiles,
} from './translations';
import {createAllRoutes} from './routes';

import {createContentHelpers} from './contentHelpers';
import {loadVersion} from './versions/loadVersion';
import type {
  PluginOptions,
  VersionMetadata,
  DocFrontMatter,
  LoadedContent,
} from '@docusaurus/plugin-content-docs';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {FullVersion} from './types';
import type {RuleSetRule} from 'webpack';

// MDX loader is not 100% deterministic, leading to cache invalidation issue
// This permits to invalidate the MDX loader cache entries when content changes
// Problem documented here: https://github.com/facebook/docusaurus/pull/10934
// TODO this is not a perfect solution, find better?
async function createMdxLoaderDependencyFile({
  dataDir,
  options,
  versionsMetadata,
}: {
  dataDir: string;
  options: PluginOptions;
  versionsMetadata: VersionMetadata[];
}): Promise<string | undefined> {
  // Disabled for unit tests, the side effect produces infinite watch loops
  // TODO find a better way :/
  if (process.env.NODE_ENV === 'test') {
    return undefined;
  }

  const filePath = path.join(dataDir, '__mdx-loader-dependency.json');
  // the cache is invalidated whenever this file content changes
  const fileContent = {
    options,
    versionsMetadata,
  };
  await fs.mkdir(dataDir, {recursive: true});
  await fs.writeFile(filePath, JSON.stringify(fileContent));
  return filePath;
}

export default async function pluginContentDocs(
  context: LoadContext,
  options: PluginOptions,
): Promise<Plugin<LoadedContent>> {
  const {siteDir, generatedFilesDir, baseUrl, siteConfig, siteMarkdownLinks} =
    context;
  // Mutate options to resolve sidebar path according to siteDir
  options.sidebarPath = resolveSidebarPathOption(siteDir, options.sidebarPath);

  const versionsMetadata = await readVersionsMetadata({context, options});

  const pluginId = options.id;

  const pluginDataDirRoot = path.join(
    generatedFilesDir,
    'docusaurus-plugin-content-docs',
  );
  const dataDir = path.join(pluginDataDirRoot, pluginId);
  // TODO Docusaurus v4 breaking change
  //  module aliasing should be automatic
  //  we should never find local absolute FS paths in the codegen registry
  const aliasedSource = (source: string) =>
    `~docs/${posixPath(path.relative(pluginDataDirRoot, source))}`;

  // TODO env should be injected into all plugins
  const env = process.env.NODE_ENV as DocEnv;

  const contentHelpers = createContentHelpers();

  const mdxLoaderDependency = await createMdxLoaderDependencyFile({
    dataDir,
    options,
    versionsMetadata,
  });

  function createDocsMDXLoaderRule(): RuleSetRule {
    const {
      rehypePlugins,
      remarkPlugins,
      recmaPlugins,
      beforeDefaultRehypePlugins,
      beforeDefaultRemarkPlugins,
    } = options;
    const contentDirs = versionsMetadata
      .flatMap(getContentPathList)
      // Trailing slash is important, see https://github.com/facebook/docusaurus/pull/3970
      .map(addTrailingPathSeparator);

    return createMDXLoaderRule({
      include: contentDirs,
      options: {
        dependencies: [mdxLoaderDependency].filter(
          (d): d is string => typeof d === 'string',
        ),
        admonitions: options.admonitions,
        remarkPlugins,
        rehypePlugins,
        recmaPlugins,
        beforeDefaultRehypePlugins,
        beforeDefaultRemarkPlugins,
        staticDirs: siteConfig.staticDirectories.map((dir) =>
          path.resolve(siteDir, dir),
        ),
        siteDir,
        isMDXPartial: createAbsoluteFilePathMatcher(
          options.exclude,
          contentDirs,
        ),
        metadataPath: (mdxPath: string) => {
          // Note that metadataPath must be the same/in-sync as
          // the path from createData for each MDX.
          const aliasedPath = aliasedSitePath(mdxPath, siteDir);
          return path.join(dataDir, `${docuHash(aliasedPath)}.json`);
        },
        // createAssets converts relative paths to require() calls
        createAssets: ({frontMatter}: {frontMatter: DocFrontMatter}) => ({
          image: frontMatter.image,
        }),
        markdownConfig: siteConfig.markdown,
        resolveMarkdownLink: ({linkPathname, sourceFilePath}) => {
          const version = getVersionFromSourceFilePath(
            sourceFilePath,
            versionsMetadata,
          );
          return resolveMarkdownLinkPathname(linkPathname, {
            sourceFilePath,
            sourceToPermalink: contentHelpers.sourceToPermalink,
            siteDir,
            contentPaths: version,
          });
        },
        resolveSiteMarkdownLink: siteMarkdownLinks.resolveMarkdownLink,
      },
    });
  }

  const docsMDXLoaderRule = createDocsMDXLoaderRule();

  return {
    name: 'docusaurus-plugin-content-docs',

    extendCli(cli) {
      const isDefaultPluginId = pluginId === DEFAULT_PLUGIN_ID;

      // Need to create one distinct command per plugin instance
      // otherwise 2 instances would try to execute the command!
      const command = isDefaultPluginId
        ? 'docs:version'
        : `docs:version:${pluginId}`;
      const commandDescription = isDefaultPluginId
        ? 'Tag a new docs version'
        : `Tag a new docs version (${pluginId})`;

      cli
        .command(command)
        .arguments('<version>')
        .description(commandDescription)
        .action((version: unknown) =>
          cliDocs.cliDocsVersionCommand(version, options, context),
        );
    },

    getTranslationFiles({content}) {
      return getLoadedContentTranslationFiles(content);
    },

    getPathsToWatch() {
      function getVersionPathsToWatch(version: VersionMetadata): string[] {
        const result = [
          ...options.include.flatMap((pattern) =>
            getContentPathList(version).map(
              (docsDirPath) => `${docsDirPath}/${pattern}`,
            ),
          ),
          ...getTagsFilePathsToWatch({
            contentPaths: version,
            tags: options.tags,
          }),
          `${version.contentPath}/**/${CategoryMetadataFilenamePattern}`,
        ];
        if (typeof version.sidebarFilePath === 'string') {
          result.unshift(version.sidebarFilePath);
        }
        return result;
      }

      return versionsMetadata.flatMap(getVersionPathsToWatch);
    },

    async loadContent() {
      return {
        loadedVersions: await Promise.all(
          versionsMetadata.map((versionMetadata) =>
            loadVersion({
              context,
              options,
              env,
              versionMetadata,
            }),
          ),
        ),
      };
    },

    translateContent({content, translationFiles}) {
      return translateLoadedContent(content, translationFiles);
    },

    async contentLoaded({content, actions}) {
      contentHelpers.updateContent(content);

      const versions: FullVersion[] = content.loadedVersions.map(toFullVersion);

      await createAllRoutes({
        baseUrl,
        versions,
        options,
        actions,
        aliasedSource,
      });

      actions.setGlobalData({
        path: normalizeUrl([baseUrl, options.routeBasePath]),
        versions: versions.map(toGlobalDataVersion),
        breadcrumbs: options.breadcrumbs,
      });
    },

    configureWebpack() {
      return {
        ignoreWarnings: [
          // Suppress warnings about non-existing of versions file.
          (e) =>
            e.message.includes("Can't resolve") &&
            e.message.includes(VERSIONS_JSON_FILE),
        ],
        resolve: {
          alias: {
            '~docs': pluginDataDirRoot,
          },
        },
        module: {
          rules: [docsMDXLoaderRule],
        },
      };
    },
  };
}

export {validateOptions} from './options';
