/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import {DEFAULT_PARSE_FRONT_MATTER, TEST_VCS} from '@docusaurus/utils';
import {fromPartial} from '@total-typescript/shoehorn';
import {
  normalizePluginOptions,
  getTagsFile,
} from '@docusaurus/utils-validation';
import {tree} from 'tree-node-cli';
import {DEFAULT_OPTIONS, validateOptions} from '../options';
import {generateBlogPosts} from '../blogUtils';
import {createBlogFeedFiles} from '../feed';
import {getAuthorsMap} from '../authorsMap';
import type {LoadContext, I18n, Validate} from '@docusaurus/types';
import type {BlogContentPaths} from '../types';
import type {Options, PluginOptions} from '@docusaurus/plugin-content-blog';

const DefaultI18N: I18n = {
  currentLocale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  path: '1i8n',
  localeConfigs: {
    en: {
      label: 'English',
      direction: 'ltr',
      htmlLang: 'en',
      calendar: 'gregory',
      path: 'en',
      translate: true,
      url: 'https://docusaurus.io',
      baseUrl: '/',
    },
  },
};

const markdown = {parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER};

function getBlogContentPaths(siteDir: string): BlogContentPaths {
  return {
    contentPath: path.resolve(siteDir, 'blog'),
    contentPathLocalized: path.resolve(
      siteDir,
      'i18n',
      'en',
      'docusaurus-plugin-content-blog',
    ),
  };
}

async function testGenerateFeeds(
  contextInput: LoadContext,
  optionsInput: Options,
): Promise<void> {
  const options = validateOptions({
    validate: normalizePluginOptions as Validate<
      Options | undefined,
      PluginOptions
    >,
    options: optionsInput,
  });

  const context: LoadContext = {
    ...contextInput,
    siteConfig: {
      ...contextInput.siteConfig,
      vcs: TEST_VCS,
    },
  };

  const contentPaths = getBlogContentPaths(context.siteDir);
  const authorsMap = await getAuthorsMap({
    contentPaths,
    authorsMapPath: options.authorsMapPath,
    authorsBaseRoutePath: '/authors',
    baseUrl: '/',
  });

  const tagsFile = await getTagsFile({contentPaths, tags: options.tags});

  const blogPosts = await generateBlogPosts(
    contentPaths,
    context,
    options,
    tagsFile,
    authorsMap,
  );

  await createBlogFeedFiles({
    blogPosts,
    options,
    siteConfig: context.siteConfig,
    outDir: context.outDir,
    locale: 'en',
    contentPaths,
  });
}

describe.each(['atom', 'rss', 'json'] as const)('%s', (feedType) => {
  it('does not get generated without posts', async () => {
    using fsMock = vi.spyOn(fs, 'writeFile');

    const siteDir = __dirname;
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      markdown,
    };
    const outDir = path.join(siteDir, 'build-snap');

    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'invalid-blog-path',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: ['*.md', '*.mdx'],
        feedOptions: {
          type: [feedType],
          copyright: 'Copyright',
          xslt: {atom: null, rss: null},
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    expect(fsMock).toHaveBeenCalledTimes(0);
  });

  it('has feed item for each post', async () => {
    using fsMock = vi.spyOn(fs, 'writeFile');

    const siteDir = path.join(__dirname, '__fixtures__', 'website');
    const outDir = path.join(siteDir, 'build-snap');
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/myBaseUrl/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      markdown,
    };

    // Build is quite difficult to mock, so we built the blog beforehand and
    // copied the output to the fixture...
    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'blog',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: DEFAULT_OPTIONS.include,
        exclude: DEFAULT_OPTIONS.exclude,
        feedOptions: {
          type: [feedType],
          copyright: 'Copyright',
          xslt: {atom: null, rss: null},
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    expect(
      fsMock.mock.calls.map((call) => call[1] as string),
    ).toMatchSnapshot();
  });

  it('filters to the first two entries', async () => {
    using fsMock = vi.spyOn(fs, 'writeFile');

    const siteDir = path.join(__dirname, '__fixtures__', 'website');
    const outDir = path.join(siteDir, 'build-snap');
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/myBaseUrl/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      markdown,
    };

    // Build is quite difficult to mock, so we built the blog beforehand and
    // copied the output to the fixture...
    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'blog',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: DEFAULT_OPTIONS.include,
        exclude: DEFAULT_OPTIONS.exclude,
        feedOptions: {
          type: [feedType],
          copyright: 'Copyright',
          createFeedItems: async (params) => {
            const {blogPosts, defaultCreateFeedItems, ...rest} = params;
            const blogPostsFiltered = blogPosts.filter(
              (item, index) => index < 2,
            );
            return defaultCreateFeedItems({
              blogPosts: blogPostsFiltered,
              ...rest,
            });
          },
          xslt: {atom: null, rss: null},
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    expect(
      fsMock.mock.calls.map((call) => call[1] as string),
    ).toMatchSnapshot();
  });

  it('filters to the first two entries using limit', async () => {
    using fsMock = vi.spyOn(fs, 'writeFile');

    const siteDir = path.join(__dirname, '__fixtures__', 'website');
    const outDir = path.join(siteDir, 'build-snap');
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/myBaseUrl/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      markdown,
    };

    // Build is quite difficult to mock, so we built the blog beforehand and
    // copied the output to the fixture...
    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'blog',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: DEFAULT_OPTIONS.include,
        exclude: DEFAULT_OPTIONS.exclude,
        feedOptions: {
          type: [feedType],
          copyright: 'Copyright',
          limit: 2,
          xslt: {atom: null, rss: null},
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    expect(
      fsMock.mock.calls.map((call) => call[1] as string),
    ).toMatchSnapshot();
  });

  it('has feed item for each post - with trailing slash', async () => {
    using fsMock = vi.spyOn(fs, 'writeFile');

    const siteDir = path.join(__dirname, '__fixtures__', 'website');
    const outDir = path.join(siteDir, 'build-snap');
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/myBaseUrl/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      trailingSlash: true,
      markdown,
    };

    // Build is quite difficult to mock, so we built the blog beforehand and
    // copied the output to the fixture...
    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'blog',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: DEFAULT_OPTIONS.include,
        exclude: DEFAULT_OPTIONS.exclude,
        feedOptions: {
          type: [feedType],
          copyright: 'Copyright',
          xslt: {atom: null, rss: null},
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    expect(
      fsMock.mock.calls.map((call) => call[1] as string),
    ).toMatchSnapshot();
  });

  it('has xslt files for feed', async () => {
    using fsMock = vi.spyOn(fs, 'writeFile');

    const siteDir = path.join(__dirname, '__fixtures__', 'website');
    const outDir = path.join(siteDir, 'build-snap');
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/myBaseUrl/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      markdown,
    };

    // Build is quite difficult to mock, so we built the blog beforehand and
    // copied the output to the fixture...
    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'blog',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: DEFAULT_OPTIONS.include,
        exclude: DEFAULT_OPTIONS.exclude,
        feedOptions: {
          type: [feedType],
          copyright: 'Copyright',
          xslt: true,
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    expect(tree(path.join(outDir, 'blog'))).toMatchSnapshot('blog tree');

    expect(
      fsMock.mock.calls.map(([filePath, content]) => [filePath, content]),
    ).toMatchSnapshot();
  });

  it('has custom xslt files for feed', async () => {
    using fsMock = vi.spyOn(fs, 'writeFile');

    const siteDir = path.join(__dirname, '__fixtures__', 'website');
    const outDir = path.join(siteDir, 'build-snap');
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/myBaseUrl/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      markdown,
    };

    // Build is quite difficult to mock, so we built the blog beforehand and
    // copied the output to the fixture...
    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'blog',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: DEFAULT_OPTIONS.include,
        exclude: DEFAULT_OPTIONS.exclude,
        feedOptions: {
          type: [feedType],
          copyright: 'Copyright',
          xslt: {
            rss: 'custom-rss.xsl',
            atom: 'custom-atom.xsl',
          },
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    expect(tree(path.join(outDir, 'blog'))).toMatchSnapshot('blog tree');

    expect(
      fsMock.mock.calls.map(([filePath, content]) => [filePath, content]),
    ).toMatchSnapshot();
  });
});

describe('feed authors', () => {
  it('resolves relative author urls', async () => {
    // Don't overwrite the fixture feeds with this partial output
    using fsMock = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

    const siteDir = path.join(__dirname, '__fixtures__', 'website');
    const outDir = path.join(siteDir, 'build-snap');
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/myBaseUrl/',
      url: 'https://docusaurus.io',
      favicon: 'image/favicon.ico',
      markdown,
    };

    await testGenerateFeeds(
      fromPartial({
        siteDir,
        siteConfig,
        i18n: DefaultI18N,
        outDir,
      }),
      {
        path: 'blog',
        routeBasePath: 'blog',
        tagsBasePath: 'tags',
        authorsMapPath: 'authors.yml',
        include: DEFAULT_OPTIONS.include,
        exclude: DEFAULT_OPTIONS.exclude,
        feedOptions: {
          type: ['atom', 'json'],
          copyright: 'Copyright',
          xslt: {atom: null, rss: null},
          limit: 1,
          createFeedItems: ({blogPosts, defaultCreateFeedItems, ...rest}) =>
            defaultCreateFeedItems({
              ...rest,
              blogPosts: blogPosts.map((post) => ({
                ...post,
                metadata: {
                  ...post.metadata,
                  authors: [
                    fromPartial({name: 'Root', url: '/team/root'}),
                    fromPartial({name: 'Sibling', url: 'team/sibling'}),
                  ],
                },
              })),
            }),
        },
        readingTime: ({content, defaultReadingTime}) =>
          defaultReadingTime({content, locale: 'en'}),
        truncateMarker: /<!--\s*truncate\s*-->/,
        onInlineTags: 'ignore',
        onInlineAuthors: 'ignore',
      },
    );

    // Feeds are written concurrently: find them by file name, not call order
    const getFeedContent = (fileName: string) =>
      fsMock.mock.calls.find(([filePath]) =>
        String(filePath).endsWith(fileName),
      )?.[1] as string;
    const atom = getFeedContent('atom.xml');
    const json = getFeedContent('feed.json');
    expect(atom).toContain('<uri>https://docusaurus.io/team/root</uri>');
    expect(atom).toContain(
      '<uri>https://docusaurus.io/myBaseUrl/blog/team/sibling</uri>',
    );
    expect(JSON.parse(json!).items[0].author).toEqual({
      name: 'Root',
      url: 'https://docusaurus.io/team/root',
    });
  });
});
