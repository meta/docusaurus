/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  postProcessSidebars,
  type SidebarPostProcessorParams,
} from '../postProcessor';

describe('postProcess', () => {
  it('transforms category without subitems', () => {
    const processedSidebar = postProcessSidebars(
      {
        sidebar: [
          {
            type: 'category',
            label: 'Category',
            link: {
              type: 'generated-index',
              slug: 'generated/permalink',
            },
            items: [],
          },
          {
            type: 'category',
            label: 'Category 2',
            link: {
              type: 'doc',
              id: 'doc ID',
            },
            className: 'category-className',
            customProps: {custom: true},
            items: [],
          },
        ],
      },
      {
        sidebarOptions: {sidebarCollapsed: true, sidebarCollapsible: true},
        version: {path: 'version'},
        drafts: [],
      } as unknown as SidebarPostProcessorParams,
    );

    expect(processedSidebar).toMatchSnapshot();

    expect(() => {
      postProcessSidebars(
        {
          sidebar: [
            {
              type: 'category',
              label: 'Bad category',
              items: [],
            },
          ],
        },
        {
          sidebarOptions: {sidebarCollapsed: true, sidebarCollapsible: true},
          version: {path: 'version'},
          drafts: [],
        } as unknown as SidebarPostProcessorParams,
      );
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Sidebar category Bad category has neither any subitem nor a link. This makes this item not able to link to anything.]`,
    );
  });

  it('corrects collapsed state inconsistencies', () => {
    expect(
      postProcessSidebars(
        {
          sidebar: [
            {
              type: 'category',
              label: 'Category',
              collapsed: true,
              collapsible: false,
              items: [{type: 'doc', id: 'foo'}],
            },
          ],
        },

        {
          sidebarOptions: {sidebarCollapsed: true, sidebarCollapsible: true},
          version: {path: 'version'},
          drafts: [],
        } as unknown as SidebarPostProcessorParams,
      ),
    ).toMatchSnapshot();

    expect(
      postProcessSidebars(
        {
          sidebar: [
            {
              type: 'category',
              label: 'Category',
              collapsed: true,
              items: [{type: 'doc', id: 'foo'}],
            },
          ],
        },

        {
          sidebarOptions: {sidebarCollapsed: false, sidebarCollapsible: false},
          version: {path: 'version'},
          drafts: [],
        } as unknown as SidebarPostProcessorParams,
      ),
    ).toMatchSnapshot();

    expect(
      postProcessSidebars(
        {
          sidebar: [
            {
              type: 'category',
              label: 'Category',
              items: [{type: 'doc', id: 'foo'}],
            },
          ],
        },

        {
          sidebarOptions: {sidebarCollapsed: true, sidebarCollapsible: false},
          version: {path: 'version'},
          drafts: [],
        } as unknown as SidebarPostProcessorParams,
      ),
    ).toMatchSnapshot();
  });

  it('filters draft items', () => {
    expect(
      postProcessSidebars(
        {
          sidebar: [
            {
              type: 'category',
              label: 'Category',
              items: [{type: 'doc', id: 'foo'}],
            },
            {
              type: 'category',
              label: 'Category',
              link: {
                type: 'doc',
                id: 'another',
              },
              items: [{type: 'doc', id: 'foo'}],
            },
          ],
        },
        {
          sidebarOptions: {sidebarCollapsed: true, sidebarCollapsible: true},
          version: {path: 'version'},
          drafts: [{id: 'foo'}],
        } as unknown as SidebarPostProcessorParams,
      ),
    ).toMatchSnapshot();
  });
});
