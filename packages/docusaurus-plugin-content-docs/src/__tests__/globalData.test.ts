/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {toGlobalDataVersion} from '../globalData';
import {createSidebarsUtils} from '../sidebars/utils';
import {getCategoryGeneratedIndexMetadataList} from '../categoryGeneratedIndex';
import type {Sidebars} from '../sidebars/types';
import type {DocMetadata} from '@docusaurus/plugin-content-docs';

describe('toGlobalDataVersion', () => {
  it('generates the right docs, sidebars, and metadata', () => {
    const docs = [
      {
        id: 'main',
        permalink: '/current/main',
        sidebar: 'tutorial',
        frontMatter: {},
        unlisted: false,
      },
      {
        id: 'doc',
        permalink: '/current/doc',
        sidebar: 'tutorial',
        frontMatter: {},
        unlisted: undefined,
      },
      {
        id: 'docNoSidebarUnlisted',
        permalink: '/current/docNoSidebarUnlisted',
        sidebar: undefined,
        frontMatter: {},
        unlisted: true,
      },
    ] as DocMetadata[];
    const sidebars: Sidebars = {
      tutorial: [
        {
          type: 'doc',
          id: 'main',
        },
        {
          type: 'category',
          label: 'Generated',
          link: {
            type: 'generated-index',
            permalink: '/current/generated',
            slug: '/current/generated',
          },
          items: [
            {
              type: 'doc',
              id: 'doc',
            },
          ],
          collapsed: false,
          collapsible: true,
        },
      ],
      links: [
        {
          type: 'link',
          href: 'foo',
          label: 'Foo',
        },
        {
          type: 'link',
          href: 'bar',
          label: 'Bar',
        },
      ],
      another: [
        {
          type: 'category',
          label: 'Generated',
          link: {
            type: 'generated-index',
            permalink: '/current/generated-2',
            slug: '/current/generated-2',
          },
          items: [
            {
              type: 'doc',
              id: 'doc',
            },
          ],
          collapsed: false,
          collapsible: true,
        },
      ],
    };
    const sidebarsUtils = createSidebarsUtils(sidebars);
    expect(
      toGlobalDataVersion({
        versionName: 'current',
        label: 'Label',
        isLast: true,
        path: '/current',
        docs,
        drafts: [
          {
            id: 'some-draft-id',
            permalink: '/current/draft',
            sidebar: undefined,
          },
        ] as DocMetadata[],
        sidebars,
        categoryGeneratedIndices: getCategoryGeneratedIndexMetadataList({
          docs,
          sidebarsUtils,
        }),
        sidebarsUtils,
        banner: 'unreleased',
        badge: true,
        className: 'current-cls',
        tagsPath: '/current/tags',
        contentPath: '',
        contentPathLocalized: '',
        sidebarFilePath: '',
        routePriority: 0.5,
        noIndex: false,
      }),
    ).toMatchSnapshot();
  });
});
