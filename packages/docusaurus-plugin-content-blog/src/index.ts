/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import logger from '@docusaurus/logger';
import combinePromises from 'combine-promises';

import {
  normalizeUrl,
  docuHash,
  aliasedSitePath,
  getPluginI18nPath,
  posixPath,
  addTrailingPathSeparator,
  getContentPathList,
  getDataFilePath,
  resolveMarkdownLinkPathname,
  getLocaleConfig,
} from '@docusaurus/utils';
import {createAbsoluteFilePathMatcher} from '@docusaurus/glob';
import {
  getTagsFilePathsToWatch,
  getTagsFile,
} from '@docusaurus/utils-validation';
import {createMDXLoaderItem} from '@docusaurus/mdx-loader';
import {
  getBlogTags,
  shouldBeListed,
  applyProcessBlogPosts,
  generateBlogPosts,
  reportUntruncatedBlogPosts,
} from './blogUtils';
import footnoteIDFixer from './remark/footnoteIDFixer';
import {translateContent, getTranslationFiles} from './translations';
import {createBlogFeedFiles, createFeedHtmlHeadTags} from './feed';

import {createAllRoutes} from './routes';
import {checkAuthorsMapPermalinkCollisions, getAuthorsMap} from './authorsMap';
import {createContentHelpers} from './contentHelpers';
import type {BlogContentPaths, BlogMarkdownLoaderOptions} from './types';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {
  PluginOptions,
  Assets,
  BlogTags,
  BlogContent,
} from '@docusaurus/plugin-content-blog';
import type {RuleSetRule, RuleSetUseItem} from 'webpack';

const PluginName = 'docusaurus-plugin-content-blog';

export default async function pluginContentBlog(
  context: LoadContext,
  options: PluginOptions,
): Promise<Plugin<BlogContent>> {
  const {
    siteDir,
    siteConfig,
    generatedFilesDir,
    localizationDir,
    i18n: {currentLocale},
  } = context;

  const router = siteConfig.future.experimental_router;
  const isBlogFeedDisabledBecauseOfHashRouter =
    router === 'hash' && !!options.feedOptions.type;
  if (isBlogFeedDisabledBecauseOfHashRouter) {
    logger.warn(
      `${PluginName} feed feature does not support the Hash Router. Feeds won't be generated.`,
    );
  }

  const {baseUrl} = siteConfig;

  const shouldTranslate = getLocaleConfig(context.i18n).translate;
  const contentPaths: BlogContentPaths = {
    contentPath: path.resolve(siteDir, options.path),
    contentPathLocalized: shouldTranslate
      ? getPluginI18nPath({
          localizationDir,
          pluginName: PluginName,
          pluginId: options.id,
        })
      : undefined,
  };
  const pluginId = options.id;

  const pluginDataDirRoot = path.join(generatedFilesDir, PluginName);
  const dataDir = path.join(pluginDataDirRoot, pluginId);
  // TODO Docusaurus v4 breaking change
  //  module aliasing should be automatic
  //  we should never find local absolute FS paths in the codegen registry
  const aliasedSource = (source: string) =>
    `~blog/${posixPath(path.relative(pluginDataDirRoot, source))}`;

  const authorsMapFilePath = await getDataFilePath({
    filePath: options.authorsMapPath,
    contentPaths,
  });

  const contentHelpers = createContentHelpers();

  function createBlogMDXLoaderRule(): RuleSetRule {
    const {
      admonitions,
      rehypePlugins,
      remarkPlugins,
      recmaPlugins,
      truncateMarker,
      beforeDefaultRemarkPlugins,
      beforeDefaultRehypePlugins,
    } = options;

    const contentDirs = getContentPathList(contentPaths);

    const mdxLoaderItem = createMDXLoaderItem({
      admonitions,
      remarkPlugins,
      rehypePlugins,
      recmaPlugins,
      beforeDefaultRemarkPlugins: [
        footnoteIDFixer,
        ...beforeDefaultRemarkPlugins,
      ],
      beforeDefaultRehypePlugins,
      staticDirs: siteConfig.staticDirectories.map((dir) =>
        path.resolve(siteDir, dir),
      ),
      siteDir,
      isMDXPartial: createAbsoluteFilePathMatcher(options.exclude, contentDirs),
      metadataPath: (mdxPath: string) => {
        // Note that metadataPath must be the same/in-sync as
        // the path from createData for each MDX.
        const aliasedPath = aliasedSitePath(mdxPath, siteDir);
        return path.join(dataDir, `${docuHash(aliasedPath)}.json`);
      },
      // For blog posts a title in markdown is always removed
      // Blog posts title are rendered separately
      removeContentTitle: true,
      // createAssets converts relative paths to require() calls
      createAssets: ({filePath}: {filePath: string}): Assets => {
        const blogPost = contentHelpers.sourceToBlogPost.get(
          aliasedSitePath(filePath, siteDir),
        )!;
        if (!blogPost) {
          throw new Error(`Blog post not found for  filePath=${filePath}`);
        }
        return {
          image: blogPost.metadata.frontMatter.image as string,
          authorsImageUrls: blogPost.metadata.authors.map(
            (author) => author.imageURL,
          ),
        };
      },
      markdownConfig: siteConfig.markdown,
      resolveMarkdownLink: ({linkPathname, sourceFilePath}) => {
        return resolveMarkdownLinkPathname(linkPathname, {
          sourceFilePath,
          sourceToPermalink: contentHelpers.sourceToPermalink,
          siteDir,
          contentPaths,
        });
      },
    });

    function createBlogMarkdownLoader(): RuleSetUseItem {
      const markdownLoaderOptions: BlogMarkdownLoaderOptions = {
        truncateMarker,
        siteDir,
        sourceToPermalink: contentHelpers.sourceToPermalink,
      };
      return {
        loader: path.resolve(__dirname, './markdownLoader.js'),
        options: markdownLoaderOptions,
      };
    }

    return {
      test: /\.mdx?$/i,
      include: contentDirs
        // Trailing slash is important, see https://github.com/facebook/docusaurus/pull/3970
        .map(addTrailingPathSeparator),
      use: [mdxLoaderItem, createBlogMarkdownLoader()],
    };
  }

  const blogMDXLoaderRule = createBlogMDXLoaderRule();

  return {
    name: PluginName,

    getPathsToWatch() {
      const {include} = options;
      const contentMarkdownGlobs = getContentPathList(contentPaths).flatMap(
        (contentPath) => include.map((pattern) => `${contentPath}/${pattern}`),
      );

      const tagsFilePaths = getTagsFilePathsToWatch({
        contentPaths,
        tags: options.tags,
      });

      return [
        authorsMapFilePath,
        ...tagsFilePaths,
        ...contentMarkdownGlobs,
      ].filter(Boolean) as string[];
    },

    getTranslationFiles() {
      return getTranslationFiles(options);
    },

    // Fetches blog contents and returns metadata for the necessary routes.
    async loadContent() {
      const {
        postsPerPage: postsPerPageOption,
        routeBasePath,
        tagsBasePath,
        blogDescription,
        blogTitle,
        blogSidebarTitle,
        pageBasePath,
        authorsBasePath,
        authorsMapPath,
      } = options;

      const baseBlogUrl = normalizeUrl([baseUrl, routeBasePath]);
      const blogTagsListPath = normalizeUrl([baseBlogUrl, tagsBasePath]);

      async function getAuthorsMapChecked() {
        const result = await getAuthorsMap({
          contentPaths,
          authorsMapPath,
          authorsBaseRoutePath: normalizeUrl([
            baseUrl,
            routeBasePath,
            authorsBasePath,
          ]),
          baseUrl,
        });
        checkAuthorsMapPermalinkCollisions(result);
        return result;
      }

      // Read all the input files in parallel
      const {authorsMap, tagsFile} = await combinePromises({
        authorsMap: getAuthorsMapChecked(),
        tagsFile: getTagsFile({contentPaths, tags: options.tags}),
      });

      let blogPosts = await generateBlogPosts(
        contentPaths,
        context,
        options,
        tagsFile,
        authorsMap,
      );
      blogPosts = await applyProcessBlogPosts({
        blogPosts,
        processBlogPosts: options.processBlogPosts,
      });
      reportUntruncatedBlogPosts({
        blogPosts,
        onUntruncatedBlogPosts: options.onUntruncatedBlogPosts,
      });
      const listedBlogPosts = blogPosts.filter(shouldBeListed);

      if (!blogPosts.length) {
        return {
          blogTitle,
          blogDescription,
          blogSidebarTitle,
          blogPosts: [],
          blogTags: {},
          blogTagsListPath,
          authorsMap,
        };
      }

      // Collocate next and prev metadata.
      listedBlogPosts.forEach((blogPost, index) => {
        const prevItem = index > 0 ? listedBlogPosts[index - 1] : null;
        if (prevItem) {
          blogPost.metadata.prevItem = {
            title: prevItem.metadata.title,
            permalink: prevItem.metadata.permalink,
          };
        }

        const nextItem =
          index < listedBlogPosts.length - 1
            ? listedBlogPosts[index + 1]
            : null;
        if (nextItem) {
          blogPost.metadata.nextItem = {
            title: nextItem.metadata.title,
            permalink: nextItem.metadata.permalink,
          };
        }
      });

      // TODO this is not the correct place to aggregate and paginate tags
      //  for reasons similar to https://github.com/facebook/docusaurus/pull/11562
      //  What we should do here is only read the tags file (similar to authors)
      const blogTags: BlogTags = getBlogTags({
        blogPosts,
        postsPerPageOption,
        blogDescription,
        blogTitle,
        pageBasePath,
      });

      return {
        blogTitle,
        blogDescription,
        blogSidebarTitle,
        blogPosts,
        blogTags,
        blogTagsListPath,
        authorsMap,
      };
    },

    async contentLoaded({content, actions}) {
      contentHelpers.updateContent(content);

      await createAllRoutes({
        baseUrl,
        content,
        actions,
        options,
        aliasedSource,
      });
    },

    translateContent({content, translationFiles}) {
      return translateContent(content, translationFiles);
    },

    configureWebpack() {
      return {
        resolve: {
          alias: {
            '~blog': pluginDataDirRoot,
          },
        },
        module: {
          rules: [blogMDXLoaderRule],
        },
      };
    },

    async postBuild({outDir, content}) {
      if (
        !content.blogPosts.length ||
        !options.feedOptions.type ||
        isBlogFeedDisabledBecauseOfHashRouter
      ) {
        return;
      }

      await createBlogFeedFiles({
        blogPosts: content.blogPosts,
        options,
        outDir,
        siteConfig,
        locale: currentLocale,
        contentPaths,
      });
    },

    injectHtmlTags({content}) {
      if (
        !content.blogPosts.length ||
        !options.feedOptions.type ||
        isBlogFeedDisabledBecauseOfHashRouter
      ) {
        return {};
      }

      return {headTags: createFeedHtmlHeadTags({context, options})};
    },
  };
}

export {validateOptions} from './options';
