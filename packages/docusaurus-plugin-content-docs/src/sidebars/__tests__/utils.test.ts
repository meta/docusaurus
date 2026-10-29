/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  createSidebarsUtils,
  collectSidebarDocItems,
  collectSidebarCategories,
  collectSidebarLinks,
  transformSidebarItems,
  collectSidebarsDocIds,
  toDocNavigationLink,
  toNavigationLink,
} from '../utils';
import type {Sidebar, Sidebars} from '../types';
import type {
  DocMetadataBase,
  PropNavigationLink,
} from '@docusaurus/plugin-content-docs';

describe('createSidebarsUtils', () => {
  const sidebar1: Sidebar = [
    {
      type: 'category',
      collapsed: false,
      collapsible: true,
      label: 'S1 Category',
      items: [
        {
          type: 'category',
          collapsed: false,
          collapsible: true,
          label: 'S1 Subcategory',
          items: [{type: 'doc', id: 'doc1'}],
        },
        {type: 'doc', id: 'doc2'},
      ],
    },
  ];

  const sidebar2: Sidebar = [
    {
      type: 'category',
      collapsed: false,
      collapsible: true,
      label: 'S2 Category',
      items: [
        {type: 'doc', id: 'doc3', label: 'Doc 3'},
        {type: 'doc', id: 'doc4'},
      ],
    },
  ];

  const sidebar3: Sidebar = [
    {
      type: 'category',
      collapsed: false,
      collapsible: true,
      label: 'S3 Category',
      link: {
        type: 'doc',
        id: 'doc5',
      },
      items: [
        {
          type: 'category',
          collapsed: false,
          collapsible: true,
          label: 'S3 SubCategory',
          link: {
            type: 'generated-index',
            slug: '/s3-subcategory-index-slug',
            permalink: '/s3-subcategory-index-permalink',
          },
          items: [
            {
              type: 'category',
              collapsed: false,
              collapsible: true,
              label: 'S3 SubSubCategory',
              link: {
                type: 'generated-index',
                slug: '/s3-subsubcategory-slug',
                permalink: '/s3-subsubcategory-index-permalink',
              },
              items: [
                {type: 'doc', id: 'doc6'},
                {type: 'doc', id: 'doc7'},
              ],
            },
          ],
        },
      ],
    },
  ];

  const sidebar4: Sidebar = [
    {
      type: 'category',
      collapsed: false,
      collapsible: true,
      label: 'Related',
      items: [
        {type: 'link', href: 'https://facebook.com', label: 'Facebook'},
        {type: 'link', href: 'https://reactjs.org', label: 'React'},
        {type: 'link', href: 'https://docusaurus.io', label: 'Docusaurus'},
      ],
    },
    {
      type: 'category',
      collapsed: false,
      collapsible: true,
      label: 'S4 Category',
      link: {
        type: 'generated-index',
        slug: '/s4-category-slug',
        permalink: '/s4-category-slug',
      },
      items: [
        {type: 'doc', id: 'doc8'},
        {type: 'doc', id: 'doc9'},
      ],
    },
  ];

  const sidebars: Sidebars = {sidebar1, sidebar2, sidebar3, sidebar4};

  const {
    getFirstDocIdOfFirstSidebar,
    getSidebarNameByDocId,
    getDocNavigation,
    getCategoryGeneratedIndexNavigation,
    getCategoryGeneratedIndexList,
    getFirstLink,
  } = createSidebarsUtils(sidebars);

  it('getFirstDocIdOfFirstSidebar', () => {
    expect(getFirstDocIdOfFirstSidebar()).toBe('doc1');
  });

  it('getSidebarNameByDocId', () => {
    expect(getSidebarNameByDocId('doc1')).toBe('sidebar1');
    expect(getSidebarNameByDocId('doc2')).toBe('sidebar1');
    expect(getSidebarNameByDocId('doc3')).toBe('sidebar2');
    expect(getSidebarNameByDocId('doc4')).toBe('sidebar2');
    expect(getSidebarNameByDocId('doc5')).toBe('sidebar3');
    expect(getSidebarNameByDocId('doc6')).toBe('sidebar3');
    expect(getSidebarNameByDocId('doc7')).toBe('sidebar3');
    expect(getSidebarNameByDocId('unknown_id')).toBeUndefined();
  });

  it('getDocNavigation', () => {
    expect(
      getDocNavigation({
        docId: 'doc1',
        displayedSidebar: undefined,
        unlistedIds: new Set(),
      }),
    ).toEqual({
      sidebarName: 'sidebar1',
      previous: undefined,
      next: {
        type: 'doc',
        id: 'doc2',
      },
    });
    expect(
      getDocNavigation({
        docId: 'doc2',
        displayedSidebar: undefined,
        unlistedIds: new Set(),
      }),
    ).toEqual({
      sidebarName: 'sidebar1',
      previous: {
        type: 'doc',
        id: 'doc1',
      },
      next: undefined,
    });

    expect(
      getDocNavigation({
        docId: 'doc3',
        displayedSidebar: undefined,
        unlistedIds: new Set(),
      }),
    ).toEqual({
      sidebarName: 'sidebar2',
      previous: undefined,
      next: {
        type: 'doc',
        id: 'doc4',
      },
    });
    expect(
      getDocNavigation({
        docId: 'doc4',
        displayedSidebar: undefined,
        unlistedIds: new Set(),
      }),
    ).toEqual({
      sidebarName: 'sidebar2',
      previous: {
        type: 'doc',
        id: 'doc3',
        label: 'Doc 3',
      },
      next: undefined,
    });

    expect(
      getDocNavigation({
        docId: 'doc5',
        displayedSidebar: undefined,
        unlistedIds: new Set(),
      }),
    ).toMatchObject({
      sidebarName: 'sidebar3',
      previous: undefined,
      next: {
        type: 'category',
        label: 'S3 SubCategory',
      },
    });
    expect(
      getDocNavigation({
        docId: 'doc6',
        displayedSidebar: undefined,
        unlistedIds: new Set(),
      }),
    ).toMatchObject({
      sidebarName: 'sidebar3',
      previous: {
        type: 'category',
        label: 'S3 SubSubCategory',
      },
      next: {
        type: 'doc',
        id: 'doc7',
      },
    });
    expect(
      getDocNavigation({
        docId: 'doc7',
        displayedSidebar: undefined,
        unlistedIds: new Set(),
      }),
    ).toEqual({
      sidebarName: 'sidebar3',
      previous: {
        type: 'doc',
        id: 'doc6',
      },
      next: undefined,
    });
    expect(
      getDocNavigation({
        docId: 'doc3',
        displayedSidebar: null,
        unlistedIds: new Set(),
      }),
    ).toEqual({
      sidebarName: undefined,
      previous: undefined,
      next: undefined,
    });
    expect(() =>
      getDocNavigation({
        docId: 'doc3',
        displayedSidebar: 'foo',
        unlistedIds: new Set(),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Doc with ID doc3 wants to display sidebar foo but a sidebar with this name doesn't exist]`,
    );
    expect(
      getDocNavigation({
        docId: 'doc3',
        displayedSidebar: 'sidebar1',
        unlistedIds: new Set(),
      }),
    ).toEqual({
      sidebarName: 'sidebar1',
      previous: undefined,
      next: undefined,
    });
  });

  it('getCategoryGeneratedIndexNavigation', () => {
    expect(
      getCategoryGeneratedIndexNavigation('/s3-subcategory-index-permalink'),
    ).toMatchObject({
      sidebarName: 'sidebar3',
      previous: {
        type: 'category',
        label: 'S3 Category',
      },
      next: {
        type: 'category',
        label: 'S3 SubSubCategory',
      },
    });

    expect(
      getCategoryGeneratedIndexNavigation('/s3-subsubcategory-index-permalink'),
    ).toMatchObject({
      sidebarName: 'sidebar3',
      previous: {
        type: 'category',
        label: 'S3 SubCategory',
      },
      next: {
        type: 'doc',
        id: 'doc6',
      },
    });
  });

  it('getCategoryGeneratedIndexList', () => {
    expect(getCategoryGeneratedIndexList()).toMatchObject([
      {
        type: 'category',
        label: 'S3 SubCategory',
      },
      {
        type: 'category',
        label: 'S3 SubSubCategory',
      },
      {
        type: 'category',
        label: 'S4 Category',
      },
    ]);
  });

  it('getFirstLink', () => {
    expect(getFirstLink('sidebar1')).toEqual({
      id: 'doc1',
      type: 'doc',
      label: 'doc1',
    });
    expect(getFirstLink('sidebar2')).toEqual({
      id: 'doc3',
      type: 'doc',
      label: 'Doc 3',
    });
    expect(getFirstLink('sidebar3')).toEqual({
      id: 'doc5',
      type: 'doc',
      label: 'S3 Category',
    });
    expect(getFirstLink('sidebar4')).toEqual({
      type: 'generated-index',
      permalink: '/s4-category-slug',
      label: 'S4 Category',
    });
  });
});

describe('collectSidebarDocItems', () => {
  it('can collect docs', () => {
    const sidebar: Sidebar = [
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category1',
        items: [
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 1',
            items: [{type: 'doc', id: 'doc1'}],
          },
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 2',
            items: [
              {type: 'doc', id: 'doc2'},
              {
                type: 'category',
                collapsed: false,
                collapsible: true,
                label: 'Sub sub category 1',
                items: [{type: 'doc', id: 'doc3'}],
              },
            ],
          },
        ],
      },
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category2',
        items: [
          {type: 'doc', id: 'doc4'},
          {type: 'doc', id: 'doc5'},
        ],
      },
    ];

    expect(collectSidebarDocItems(sidebar).map((doc) => doc.id)).toEqual([
      'doc1',
      'doc2',
      'doc3',
      'doc4',
      'doc5',
    ]);
  });
});

describe('collectSidebarCategories', () => {
  it('can collect categories', () => {
    const sidebar: Sidebar = [
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category1',
        items: [
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 1',
            items: [{type: 'doc', id: 'doc1'}],
          },
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 2',
            items: [
              {type: 'doc', id: 'doc2'},
              {
                type: 'category',
                collapsed: false,
                collapsible: true,
                label: 'Sub sub category 1',
                items: [{type: 'doc', id: 'doc3'}],
              },
            ],
          },
        ],
      },
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category2',
        items: [
          {type: 'doc', id: 'doc4'},
          {type: 'doc', id: 'doc5'},
        ],
      },
    ];

    expect(
      collectSidebarCategories(sidebar).map((category) => category.label),
    ).toEqual([
      'Category1',
      'Subcategory 1',
      'Subcategory 2',
      'Sub sub category 1',
      'Category2',
    ]);
  });
});

describe('collectSidebarLinks', () => {
  it('can collect links', () => {
    const sidebar: Sidebar = [
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category1',
        items: [
          {
            type: 'link',
            href: 'https://google.com',
            label: 'Google',
          },
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 2',
            items: [
              {
                type: 'link',
                href: 'https://facebook.com',
                label: 'Facebook',
              },
            ],
          },
        ],
      },
    ];

    expect(collectSidebarLinks(sidebar).map((link) => link.href)).toEqual([
      'https://google.com',
      'https://facebook.com',
    ]);
  });
});

describe('collectSidebarsDocIds', () => {
  it('can collect sidebars doc items', () => {
    const sidebar1: Sidebar = [
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category1',
        items: [
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 1',
            items: [{type: 'doc', id: 'doc1'}],
          },
          {type: 'doc', id: 'doc2'},
        ],
      },
    ];

    const sidebar2: Sidebar = [
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category2',
        items: [
          {type: 'doc', id: 'doc3'},
          {type: 'doc', id: 'doc4'},
        ],
      },
    ];

    const sidebar3: Sidebar = [
      {type: 'doc', id: 'doc5'},
      {type: 'doc', id: 'doc6'},
    ];
    expect(collectSidebarsDocIds({sidebar1, sidebar2, sidebar3})).toEqual({
      sidebar1: ['doc1', 'doc2'],
      sidebar2: ['doc3', 'doc4'],
      sidebar3: ['doc5', 'doc6'],
    });
  });
});

describe('transformSidebarItems', () => {
  it('can transform sidebar items', () => {
    const sidebar: Sidebar = [
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category1',
        items: [
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 1',
            items: [{type: 'doc', id: 'doc1'}],
            customProps: {fakeProp: false},
          },
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'Subcategory 2',
            items: [
              {type: 'doc', id: 'doc2'},
              {
                type: 'category',
                collapsed: false,
                collapsible: true,
                label: 'Sub sub category 1',
                items: [
                  {type: 'doc', id: 'doc3', customProps: {lorem: 'ipsum'}},
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'Category2',
        items: [
          {type: 'doc', id: 'doc4'},
          {type: 'doc', id: 'doc5'},
        ],
      },
    ];

    expect(
      transformSidebarItems(sidebar, (item) => {
        if (item.type === 'category') {
          return {...item, label: `MODIFIED LABEL: ${item.label}`};
        }
        return item;
      }),
    ).toEqual([
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'MODIFIED LABEL: Category1',
        items: [
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'MODIFIED LABEL: Subcategory 1',
            items: [{type: 'doc', id: 'doc1'}],
            customProps: {fakeProp: false},
          },
          {
            type: 'category',
            collapsed: false,
            collapsible: true,
            label: 'MODIFIED LABEL: Subcategory 2',
            items: [
              {type: 'doc', id: 'doc2'},
              {
                type: 'category',
                collapsed: false,
                collapsible: true,
                label: 'MODIFIED LABEL: Sub sub category 1',
                items: [
                  {type: 'doc', id: 'doc3', customProps: {lorem: 'ipsum'}},
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'category',
        collapsed: false,
        collapsible: true,
        label: 'MODIFIED LABEL: Category2',
        items: [
          {type: 'doc', id: 'doc4'},
          {type: 'doc', id: 'doc5'},
        ],
      },
    ]);
  });
});

describe('toDocNavigationLink', () => {
  type TestDoc = Pick<DocMetadataBase, 'permalink' | 'title' | 'frontMatter'>;
  function testDoc(data: TestDoc) {
    return data as DocMetadataBase;
  }

  it('with no front matter', () => {
    expect(
      toDocNavigationLink(
        testDoc({
          title: 'Doc Title',
          permalink: '/docPermalink',
          frontMatter: {},
        }),
      ),
    ).toEqual({
      title: 'Doc Title',
      permalink: '/docPermalink',
    } as PropNavigationLink);
  });

  it('with pagination_label front matter', () => {
    expect(
      toDocNavigationLink(
        testDoc({
          title: 'Doc Title',
          permalink: '/docPermalink',
          frontMatter: {
            pagination_label: 'pagination_label',
          },
        }),
      ),
    ).toEqual({
      title: 'pagination_label',
      permalink: '/docPermalink',
    } as PropNavigationLink);
  });

  it('with sidebar_label front matter', () => {
    expect(
      toDocNavigationLink(
        testDoc({
          title: 'Doc Title',
          permalink: '/docPermalink',
          frontMatter: {
            sidebar_label: 'sidebar_label',
          },
        }),
      ),
    ).toEqual({
      title: 'sidebar_label',
      permalink: '/docPermalink',
    } as PropNavigationLink);
  });

  it('with sidebar item label', () => {
    expect(
      toDocNavigationLink(
        testDoc({
          title: 'Doc Title',
          permalink: '/docPermalink',
          frontMatter: {},
        }),
        {sidebarItemLabel: 'Doc sidebar item label'},
      ),
    ).toEqual({
      title: 'Doc sidebar item label',
      permalink: '/docPermalink',
    } as PropNavigationLink);
  });

  it('with pagination_label + sidebar_label front matter', () => {
    expect(
      toDocNavigationLink(
        testDoc({
          title: 'Doc Title',
          permalink: '/docPermalink',
          frontMatter: {
            pagination_label: 'pagination_label',
            sidebar_label: 'sidebar_label',
          },
        }),
      ),
    ).toEqual({
      title: 'pagination_label',
      permalink: '/docPermalink',
    } as PropNavigationLink);
  });

  it('with sidebar_label + sidebar item label', () => {
    expect(
      toDocNavigationLink(
        testDoc({
          title: 'Doc Title',
          permalink: '/docPermalink',
          frontMatter: {
            sidebar_label: 'sidebar_label',
          },
        }),
        {sidebarItemLabel: 'Doc sidebar item label'},
      ),
    ).toEqual({
      title: 'sidebar_label',
      permalink: '/docPermalink',
    } as PropNavigationLink);
  });
});

describe('toNavigationLink', () => {
  type TestDoc = Pick<DocMetadataBase, 'permalink' | 'title'>;
  function testDoc(data: TestDoc) {
    return {...data, frontMatter: {}} as DocMetadataBase;
  }

  const docsById: {[docId: string]: DocMetadataBase} = {
    doc1: testDoc({
      title: 'Doc 1',
      permalink: '/doc1',
    }),
    doc2: testDoc({
      title: 'Doc 1',
      permalink: '/doc1',
    }),
  };

  it('with doc items', () => {
    expect(toNavigationLink({type: 'doc', id: 'doc1'}, docsById)).toEqual(
      toDocNavigationLink(docsById.doc1!),
    );
    expect(toNavigationLink({type: 'doc', id: 'doc2'}, docsById)).toEqual(
      toDocNavigationLink(docsById.doc2!),
    );
    expect(() =>
      toNavigationLink({type: 'doc', id: 'doc3'}, docsById),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't create navigation link: no doc found with id=doc3]`,
    );
  });

  it('with category item and doc link', () => {
    expect(
      toNavigationLink(
        {
          type: 'category',
          label: 'Category',
          items: [],
          link: {
            type: 'doc',
            id: 'doc1',
          },
          collapsed: true,
          collapsible: true,
        },
        docsById,
      ),
    ).toEqual(toDocNavigationLink(docsById.doc1!));
    expect(() =>
      toNavigationLink(
        {
          type: 'category',
          label: 'Category',
          items: [],
          link: {
            type: 'doc',
            id: 'doc3',
          },
          collapsed: true,
          collapsible: true,
        },
        docsById,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't create navigation link: no doc found with id=doc3]`,
    );
  });

  it('with category item and generated-index link', () => {
    expect(
      toNavigationLink(
        {
          type: 'category',
          label: 'Category',
          items: [],
          link: {
            type: 'generated-index',
            slug: 'slug',
            permalink: 'generated-index-permalink',
          },
          collapsed: true,
          collapsible: true,
        },
        docsById,
      ),
    ).toEqual({title: 'Category', permalink: 'generated-index-permalink'});
  });
});
