/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import * as _ from 'lodash';
import {fromPartial} from '@total-typescript/shoehorn';
import {buildAllRoutes} from '../routes';
import {DEFAULT_OPTIONS} from '../options';
import type {PartialDeep} from '@total-typescript/shoehorn';
import type {BlogPost, BlogPostMetadata} from '@docusaurus/plugin-content-blog';

type Params = Parameters<typeof buildAllRoutes>[0];

async function testBuildAllRoutes(overrides: PartialDeep<Params> = {}) {
  const createData = vi.fn(
    async (name: string, _data: unknown) => `/data/${name}`,
  );

  const params: Params = fromPartial<Params>({
    baseUrl: '/',
    aliasedSource: (str: string) => `@aliased${str}`,
    ...overrides,

    content: {
      blogTitle: 'Blog Title',
      blogDescription: 'Blog Description',
      blogSidebarTitle: 'Blog Sidebar Title',
      authorsMap: {},
      blogTagsListPath: '',
      blogTags: {},
      blogPosts: [],
      ...overrides?.content,
    },
    options: {
      ...DEFAULT_OPTIONS,
      ...overrides?.options,
    },
    actions: {
      createData,
      ...overrides?.actions,
    },
  });

  const routes = await buildAllRoutes(params);

  const data = Object.fromEntries(
    createData.mock.calls.map((call) => [call[0], call[1]]),
  );

  function getRouteByPath(path: string) {
    const route = routes.find((r) => r.path === path);
    if (!route) {
      throw new Error(`Route not found for path: ${path}`);
    }
    return route;
  }

  function getRoutesByComponent(component: string) {
    return routes.filter((r) => r.component === component);
  }

  return {routes, data, utils: {getRouteByPath, getRoutesByComponent}};
}

function blogPost(overrides: PartialDeep<BlogPost> = {}): BlogPost {
  const id = overrides.id ?? 'blog-post';
  return fromPartial<BlogPost>({
    id,
    content: `Content for ${id}`,
    ...overrides,
    metadata: fromPartial<BlogPostMetadata>({
      title: `Title for ${id}`,
      description: `Description for ${id}`,
      permalink: `/blog/${id}`,
      source: `@site/blog/${id}.md`,
      date: new Date('2020-01-01'),
      tags: [],
      readingTime: 2,
      authors: [],
      frontMatter: {
        ...overrides?.metadata?.frontMatter,
      },
      ...overrides?.metadata,
    }),
  });
}

describe('buildAllRoutes', () => {
  it('works for empty blog', async () => {
    const {routes, data} = await testBuildAllRoutes({
      content: {
        blogPosts: [],
      },
    });

    expect(routes).toMatchInlineSnapshot(`
      [
        {
          "component": "@theme/BlogListPage",
          "exact": true,
          "modules": {
            "items": [],
            "sidebar": "@aliased/data/blog-post-list-prop-default.json",
          },
          "path": "/blog",
          "props": {
            "metadata": {
              "blogDescription": "Blog Description",
              "blogTitle": "Blog Title",
              "nextPage": undefined,
              "page": 1,
              "permalink": "/blog",
              "postsPerPage": 10,
              "previousPage": undefined,
              "totalCount": 0,
              "totalPages": 1,
            },
          },
        },
      ]
    `);
    expect(data).toMatchInlineSnapshot(`
      {
        "blog-post-list-prop-default.json": {
          "items": [],
          "title": "Blog Sidebar Title",
        },
        "blogMetadata-default.json": {
          "authorsListPath": "/blog/authors",
          "blogBasePath": "/blog",
          "blogTitle": "Blog Title",
        },
      }
    `);
  });

  it('works for single blog post', async () => {
    const {routes, data} = await testBuildAllRoutes({
      content: {
        blogPosts: [blogPost()],
      },
    });

    expect(routes).toMatchInlineSnapshot(`
      [
        {
          "component": "@theme/BlogPostPage",
          "context": {
            "blogMetadata": "@aliased/data/blogMetadata-default.json",
          },
          "exact": true,
          "metadata": {
            "lastUpdatedAt": undefined,
            "sourceFilePath": "blog/blog-post.md",
          },
          "modules": {
            "content": "@site/blog/blog-post.md",
            "sidebar": "@aliased/data/blog-post-list-prop-default.json",
          },
          "path": "/blog/blog-post",
        },
        {
          "component": "@theme/BlogListPage",
          "exact": true,
          "modules": {
            "items": [
              {
                "content": {
                  "__import": true,
                  "path": "@site/blog/blog-post.md",
                  "query": {
                    "truncated": true,
                  },
                },
              },
            ],
            "sidebar": "@aliased/data/blog-post-list-prop-default.json",
          },
          "path": "/blog",
          "props": {
            "metadata": {
              "blogDescription": "Blog Description",
              "blogTitle": "Blog Title",
              "nextPage": undefined,
              "page": 1,
              "permalink": "/blog",
              "postsPerPage": 10,
              "previousPage": undefined,
              "totalCount": 1,
              "totalPages": 1,
            },
          },
        },
        {
          "component": "@theme/BlogArchivePage",
          "exact": true,
          "path": "/blog/archive",
          "props": {
            "archive": {
              "blogPosts": [
                {
                  "content": "Content for blog-post",
                  "id": "blog-post",
                  "metadata": {
                    "authors": [],
                    "date": 2020-01-01T00:00:00.000Z,
                    "description": "Description for blog-post",
                    "frontMatter": {},
                    "permalink": "/blog/blog-post",
                    "readingTime": 2,
                    "source": "@site/blog/blog-post.md",
                    "tags": [],
                    "title": "Title for blog-post",
                  },
                },
              ],
            },
          },
        },
      ]
    `);
    expect(data).toMatchInlineSnapshot(`
      {
        "blog-post-list-prop-default.json": {
          "items": [
            {
              "date": 2020-01-01T00:00:00.000Z,
              "permalink": "/blog/blog-post",
              "title": "Title for blog-post",
              "unlisted": undefined,
            },
          ],
          "title": "Blog Sidebar Title",
        },
        "blogMetadata-default.json": {
          "authorsListPath": "/blog/authors",
          "blogBasePath": "/blog",
          "blogTitle": "Blog Title",
        },
        "site-blog-blog-post-md-0d7.json": {
          "authors": [],
          "date": 2020-01-01T00:00:00.000Z,
          "description": "Description for blog-post",
          "frontMatter": {},
          "permalink": "/blog/blog-post",
          "readingTime": 2,
          "source": "@site/blog/blog-post.md",
          "tags": [],
          "title": "Title for blog-post",
        },
      }
    `);
  });

  it('works for realistic blog post', async () => {
    const {routes, data} = await testBuildAllRoutes({
      options: {
        postsPerPage: 2,
      },
      content: {
        blogTitle: 'Custom blog title',
        blogDescription: 'Custom blog description',
        blogSidebarTitle: 'Custom blog sidebar title',

        blogPosts: [
          blogPost({id: 'post1', metadata: {authors: [{key: 'author1'}]}}),
          blogPost({id: 'post2', metadata: {authors: [{key: 'author1'}]}}),
          blogPost({
            id: 'post3',
            metadata: {
              authors: [{key: 'author3'}],
              unlisted: true,
            },
          }),
          blogPost({
            id: 'post4',
            metadata: {
              authors: [{key: 'author1'}, {key: 'author2'}],
            },
          }),
          blogPost({
            id: 'post5',
            metadata: {authors: [{key: 'author2'}, {key: 'author3'}]},
          }),
          blogPost({id: 'post6'}),
        ],

        authorsMap: {
          author1: {
            key: 'author1',
            name: 'Author 1',
            page: {permalink: '/blog/authors/author1'},
          },
          author2: {
            key: 'author2',
            name: 'Author 2',
            page: null,
          },
          author3: {
            key: 'author3',
            name: 'Author 3',
            page: {permalink: '/blog/authors/author3'},
          },
        },
      },
    });

    expect(_.countBy(routes, 'component')).toMatchInlineSnapshot(`
      {
        "@theme/Blog/Pages/BlogAuthorsListPage": 1,
        "@theme/Blog/Pages/BlogAuthorsPostsPage": 3,
        "@theme/BlogArchivePage": 1,
        "@theme/BlogListPage": 3,
        "@theme/BlogPostPage": 6,
      }
    `);

    expect(routes).toMatchSnapshot();
    expect(data).toMatchSnapshot();
  });
});
