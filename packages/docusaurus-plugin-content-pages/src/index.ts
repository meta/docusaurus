/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {
  aliasedSitePath,
  docuHash,
  addTrailingPathSeparator,
  getContentPathList,
  resolveMarkdownLinkPathname,
} from '@docusaurus/utils';
import {createAbsoluteFilePathMatcher} from '@docusaurus/glob';
import {createMDXLoaderRule} from '@docusaurus/mdx-loader';
import {pathExists} from '@docusaurus/fs';
import {createAllRoutes} from './routes';
import {createPagesContentPaths, loadPagesContent} from './content';
import {createContentHelpers} from './contentHelpers';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {
  PluginOptions,
  LoadedContent,
  PageFrontMatter,
} from '@docusaurus/plugin-content-pages';
import type {RuleSetRule} from 'webpack';

export default function pluginContentPages(
  context: LoadContext,
  options: PluginOptions,
): Plugin<LoadedContent | null> {
  const {siteConfig, siteDir, generatedFilesDir, siteMarkdownLinks} = context;

  const contentPaths = createPagesContentPaths({context, options});
  const contentHelpers = createContentHelpers();

  const pluginDataDirRoot = path.join(
    generatedFilesDir,
    'docusaurus-plugin-content-pages',
  );
  const dataDir = path.join(pluginDataDirRoot, options.id);

  function createPagesMDXLoaderRule(): RuleSetRule {
    const {
      admonitions,
      rehypePlugins,
      remarkPlugins,
      recmaPlugins,
      beforeDefaultRehypePlugins,
      beforeDefaultRemarkPlugins,
    } = options;
    const contentDirs = getContentPathList(contentPaths);

    return createMDXLoaderRule({
      include: contentDirs
        // Trailing slash is important, see https://github.com/facebook/docusaurus/pull/3970
        .map(addTrailingPathSeparator),
      options: {
        admonitions,
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
          const aliasedSource = aliasedSitePath(mdxPath, siteDir);
          return path.join(dataDir, `${docuHash(aliasedSource)}.json`);
        },
        // createAssets converts relative paths to require() calls
        createAssets: ({frontMatter}: {frontMatter: PageFrontMatter}) => ({
          image: frontMatter.image,
        }),
        markdownConfig: siteConfig.markdown,
        resolveMarkdownLink: ({linkPathname, sourceFilePath}) => {
          return resolveMarkdownLinkPathname(linkPathname, {
            sourceFilePath,
            sourceToPermalink: contentHelpers.sourceToPermalink,
            siteDir,
            contentPaths,
          });
        },
        resolveSiteMarkdownLink: siteMarkdownLinks.resolveMarkdownLink,
      },
    });
  }

  const pagesMDXLoaderRule = createPagesMDXLoaderRule();

  return {
    name: 'docusaurus-plugin-content-pages',

    getPathsToWatch() {
      const {include} = options;
      return getContentPathList(contentPaths).flatMap((contentPath) =>
        include.map((pattern) => `${contentPath}/${pattern}`),
      );
    },

    async loadContent() {
      if (!(await pathExists(contentPaths.contentPath))) {
        return null;
      }
      return loadPagesContent({context, options, contentPaths});
    },

    async contentLoaded({content, actions}) {
      if (!content) {
        return;
      }
      contentHelpers.updateContent(content);
      await createAllRoutes({content, options, actions});
    },

    configureWebpack() {
      return {
        module: {
          rules: [pagesMDXLoaderRule],
        },
      };
    },
  };
}

export {validateOptions} from './options';
