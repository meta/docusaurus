/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import RecmaMDXDisplayName from 'recma-mdx-displayname';
import {isArgosBuild} from './argosBuild';
import type {PluginConfig, Plugin} from '@docusaurus/types';
import type {Options as DocsOptions} from '@docusaurus/plugin-content-docs';
import type {Options as BlogOptions} from '@docusaurus/plugin-content-blog';
import type {Options as PageOptions} from '@docusaurus/plugin-content-pages';

// By default, we don't want to run "git log" commands on i18n sites
// This makes localized sites build much slower on Netlify
// See also https://github.com/facebook/docusaurus/issues/11208
// TODO duplicated :/
const showLastUpdate = process.env.DOCUSAURUS_CURRENT_LOCALE === 'en';

export function dogfoodingTransformFrontMatter(frontMatter: {
  [key: string]: unknown;
}): {[key: string]: unknown} {
  if (frontMatter.force_unlisted_parseFrontMatter_test === true) {
    return {...frontMatter, unlisted: true};
  }
  return frontMatter;
}

export const dogfoodingThemeInstances: PluginConfig[] = [
  function swizzleThemeTests(): Plugin {
    return {
      name: 'swizzle-theme-tests',
      getThemePath: () => './_swizzle_theme_tests/src/theme',
    };
  },
];

export const dogfoodingPluginInstances: PluginConfig[] = [
  [
    'content-docs', // Shorthand
    {
      id: 'docs-tests',
      routeBasePath: '/tests/docs',
      sidebarPath: '_dogfooding/docs-tests-sidebars.js',
      editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
      versions: {
        current: {
          noIndex: !isArgosBuild,
        },
      },
      onInlineTags: 'warn',
      tags: 'tags.yml',
      recmaPlugins: [
        [
          RecmaMDXDisplayName,
          (vfile: {path: string}) =>
            `MDXContent(${path.relative(process.cwd(), vfile.path)})`,
        ],
      ],

      // Using a _ prefix to test against an edge case regarding MDX partials: https://github.com/facebook/docusaurus/discussions/5181#discussioncomment-1018079
      path: '_dogfooding/_docs tests',
      showLastUpdateTime: showLastUpdate,
      showLastUpdateAuthor: showLastUpdate,
      sidebarItemsGenerator(args) {
        return args.defaultSidebarItemsGenerator({
          ...args,
          isCategoryIndex({fileName, directories}) {
            const eligibleDocIndexNames = [
              'index',
              'readme',
              directories[0]!.toLowerCase(),
              'intro',
            ];
            return eligibleDocIndexNames.includes(fileName.toLowerCase());
          },
        });
      },
    } satisfies DocsOptions,
  ],

  [
    '@docusaurus/plugin-content-blog', // Longhand
    /** @type {import('@docusaurus/plugin-content-blog').Options} */
    {
      id: 'blog-tests',
      path: '_dogfooding/_blog tests',
      routeBasePath: '/tests/blog',
      editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
      postsPerPage: 3,
      blogSidebarCount: 'ALL',
      feedOptions: {
        type: 'all',
        title: 'Docusaurus Tests Blog',
        copyright: `Copyright © ${new Date().getFullYear()} Facebook, Inc.`,
        xslt: {
          rss: 'custom-rss.xsl',
          atom: 'custom-atom.xsl',
        },
      },
      readingTime: ({content, frontMatter, defaultReadingTime}) =>
        frontMatter.hide_reading_time
          ? undefined
          : defaultReadingTime({
              content,
              locale: 'en',
              options: {wordsPerMinute: 5},
            }),
      onInlineTags: 'warn',
      onInlineAuthors: 'ignore',
      onUntruncatedBlogPosts: 'ignore',
      tags: 'tags.yml',
    } satisfies BlogOptions,
  ],

  [
    require.resolve('@docusaurus/plugin-content-pages'), // Full path
    {
      id: 'pages-tests',
      path: '_dogfooding/_pages tests',
      routeBasePath: '/tests/pages',
      showLastUpdateTime: showLastUpdate,
      showLastUpdateAuthor: showLastUpdate,
      editUrl: ({pagesPath}) =>
        `https://github.com/facebook/docusaurus/edit/main/website/_dogfooding/_pages tests/${pagesPath}`,
    } satisfies PageOptions,
  ],

  function clientModuleTestPlugin(): Plugin {
    return {
      name: 'client-module-test-plugin',
      getClientModules() {
        return [
          require.resolve('./clientModuleExample.ts'),
          require.resolve('./clientModuleCSS.css'),
          require.resolve('./migrateStorageNamespace.ts'),
        ];
      },
    };
  },
];

export const dogfoodingRedirects: {from: string[]; to: string}[] = [
  {
    from: ['/home/'],
    to: '/',
  },
  {
    from: ['/home/qs'],
    to: '/?a=1',
  },
  {
    from: ['/home/anchor'],
    to: '/#anchor',
  },
  {
    from: ['/home/absolute'],
    to: 'https://docusaurus.io/',
  },
  {
    from: ['/home/absolute/qs'],
    to: 'https://docusaurus.io/?a=1',
  },
  {
    from: ['/home/absolute/anchor'],
    to: 'https://docusaurus.io/#anchor',
  },
];
