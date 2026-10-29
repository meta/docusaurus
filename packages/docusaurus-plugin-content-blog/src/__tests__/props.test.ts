/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {fromPartial} from '@total-typescript/shoehorn';
import {toBlogSidebarProp, toTagsProp} from '../props';
import type {BlogPost} from '@docusaurus/plugin-content-blog';

describe('toTagsProp', () => {
  type Tags = Parameters<typeof toTagsProp>[0]['blogTags'];
  type Tag = Tags[number];

  const tag1: Tag = {
    label: 'Tag 1',
    permalink: '/tag1',
    description: undefined,
    inline: false,
    items: ['item1', 'item2'],
    pages: [],
    unlisted: false,
  };

  const tag2: Tag = {
    label: 'Tag 2',
    permalink: '/tag2',
    description: undefined,
    inline: false,
    items: ['item3'],
    pages: [],
    unlisted: false,
  };

  function testTags(...tags: Tag[]) {
    const blogTags: Tags = {};
    tags.forEach((tag) => {
      blogTags[tag.permalink] = tag;
    });
    return toTagsProp({blogTags});
  }

  it('works', () => {
    expect(testTags(tag1, tag2)).toEqual([
      {
        count: tag1.items.length,
        label: tag1.label,
        permalink: tag1.permalink,
      },
      {
        count: tag2.items.length,
        label: tag2.label,
        permalink: tag2.permalink,
      },
    ]);
  });

  it('filters unlisted tags', () => {
    expect(testTags(tag1, {...tag2, unlisted: true})).toEqual([
      {
        count: tag1.items.length,
        label: tag1.label,
        permalink: tag1.permalink,
      },
    ]);

    expect(testTags({...tag1, unlisted: true}, tag2)).toEqual([
      {
        count: tag2.items.length,
        label: tag2.label,
        permalink: tag2.permalink,
      },
    ]);
  });
});

describe('toBlogSidebarProp', () => {
  it('creates sidebar prop', () => {
    const blogPosts: BlogPost[] = [
      fromPartial({
        id: '1',
        metadata: {
          title: 'title 1',
          permalink: '/blog/blog-1',
          unlisted: false,
          date: '2021-01-01',
          frontMatter: {toto: 42},
          authors: [{name: 'author'}],
          source: 'xyz',
          hasTruncateMarker: true,
        },
      }),
      fromPartial({
        id: '2',
        metadata: {
          title: 'title 2',
          permalink: '/blog/blog-2',
          unlisted: true,
          date: '2024-01-01',
          frontMatter: {hello: 'world', sidebar_label: 'title 2 (custom)'},
          tags: [{label: 'tag1', permalink: '/tag1', inline: false}],
        },
      }),
    ];

    const sidebarProp = toBlogSidebarProp({
      blogSidebarTitle: 'sidebar title',
      blogPosts,
    });

    expect(sidebarProp).toMatchInlineSnapshot(`
      {
        "items": [
          {
            "date": "2021-01-01",
            "permalink": "/blog/blog-1",
            "title": "title 1",
            "unlisted": false,
          },
          {
            "date": "2024-01-01",
            "permalink": "/blog/blog-2",
            "title": "title 2 (custom)",
            "unlisted": true,
          },
        ],
        "title": "sidebar title",
      }
    `);
  });
});
