/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import * as reactRouterConfig from 'react-router-config';
import {handleBrokenLinks} from '../brokenLinks';
import type {RouteConfig} from '@docusaurus/types';

vi.mock('react-router-config', async () => {
  const actual = await vi.importActual<typeof import('react-router-config')>(
    'react-router-config',
  );

  return {
    ...actual,
    matchRoutes: vi.fn(actual.matchRoutes),
  };
});

type Params = Parameters<typeof handleBrokenLinks>[0];

// We don't need all the routes attributes for our tests
type SimpleRoute = {
  path: string;
  routes?: SimpleRoute[];
  exact?: boolean;
  strict?: boolean;
};

// Conveniently apply defaults to function under test
async function testBrokenLinks(params: {
  collectedLinks?: Params['collectedLinks'];
  onBrokenLinks?: Params['onBrokenLinks'];
  onBrokenAnchors?: Params['onBrokenAnchors'];
  routes?: SimpleRoute[];
}) {
  await handleBrokenLinks({
    collectedLinks: {},
    onBrokenLinks: 'throw',
    onBrokenAnchors: 'throw',
    ...params,
    // Unsafe but convenient for tests
    routes: (params.routes ?? []) as RouteConfig[],
  });
}

describe('handleBrokenLinks', () => {
  it('accepts valid link', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1'}, {path: '/page2'}],
      collectedLinks: {
        '/page1': {links: ['/page2'], anchors: []},
        '/page2': {links: [], anchors: []},
      },
    });
  });

  it('accepts valid non-exact link', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1', exact: false}, {path: '/page2/'}],
      collectedLinks: {
        '/page1': {
          links: [
            '/page1',
            '/page1/',
            '/page2',
            '/page2/',
            '/page1/subPath',
            '/page2/subPath',
          ],
          anchors: [],
        },
        '/page2/': {
          links: [
            '/page1',
            '/page1/',
            '/page2',
            '/page2/',
            '/page1/subPath',
            '/page2/subPath',
          ],
          anchors: [],
        },
      },
    });
  });

  it('accepts valid non-strict link', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1', strict: false}, {path: '/page2/'}],
      collectedLinks: {
        '/page1': {
          links: ['/page1', '/page1/', '/page2', '/page2/'],
          anchors: [],
        },
        '/page2/': {
          links: ['/page1', '/page1/', '/page2', '/page2/'],
          anchors: [],
        },
      },
    });
  });

  it('accepts valid link to uncollected page', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1'}, {path: '/page2'}],
      collectedLinks: {
        '/page1': {links: ['/page2'], anchors: []},
        // /page2 is absent on purpose: it doesn't contain any link/anchor
      },
    });
  });

  it('accepts valid link to nested route', async () => {
    await testBrokenLinks({
      routes: [
        {path: '/page1'},
        {path: '/nested/', routes: [{path: '/nested/page2'}]},
      ],
      collectedLinks: {
        '/page1': {links: ['/nested/page2'], anchors: []},
      },
    });
  });

  it('accepts valid relative link', async () => {
    await testBrokenLinks({
      routes: [{path: '/dir/page1'}, {path: '/dir/page2'}],
      collectedLinks: {
        '/dir/page1': {
          links: ['./page2', '../dir/page2', '/dir/page2'],
          anchors: [],
        },
      },
    });
  });

  it('accepts valid link with anchor', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1'}, {path: '/page2'}],
      collectedLinks: {
        '/page1': {links: ['/page2#page2anchor'], anchors: []},
        '/page2': {links: [], anchors: ['page2anchor']},
      },
    });
  });

  it('accepts valid link with anchor reported with hash prefix', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1'}, {path: '/page2'}],
      collectedLinks: {
        '/page1': {links: ['/page2#page2anchor'], anchors: []},
        '/page2': {links: [], anchors: ['#page2anchor']},
      },
    });
  });

  it('accepts valid non-strict link with anchor', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1', strict: false}, {path: '/page2/'}],
      collectedLinks: {
        '/page1': {
          links: [
            '/page1#page1anchor',
            '/page1/#page1anchor',
            '/page2#page2anchor',
            '/page2/#page2anchor',
          ],
          anchors: ['page1anchor'],
        },
        '/page2/': {
          links: [
            '/page1#page1anchor',
            '/page1/#page1anchor',
            '/page2#page2anchor',
            '/page2/#page2anchor',
          ],
          anchors: ['page2anchor'],
        },
      },
    });
  });

  it('accepts valid links and anchors, sparse arrays', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1'}, {path: '/page2'}],
      collectedLinks: {
        '/page1': {
          links: [
            '/page1',
            // @ts-expect-error: invalid type on purpose
            undefined,
            // @ts-expect-error: invalid type on purpose
            null,
            // @ts-expect-error: invalid type on purpose
            42,
            '/page2',
            '/page2#page2anchor1',
            '/page2#page2anchor2',
          ],
          anchors: [],
        },
        '/page2': {
          links: [],
          anchors: [
            'page2anchor1',
            // @ts-expect-error: invalid type on purpose
            undefined,
            // @ts-expect-error: invalid type on purpose
            null,
            // @ts-expect-error: invalid type on purpose
            42,
            'page2anchor2',
          ],
        },
      },
    });
  });

  it('accepts valid link and anchor to collected pages that are not in routes', async () => {
    // This tests the edge-case of the 404 page:
    // We don't have a {path: '404.html'} route
    // But yet we collect links/anchors to it and allow linking to it
    await testBrokenLinks({
      routes: [],
      collectedLinks: {
        '/page 1': {
          links: ['/page 2#anchor-page-2'],
          anchors: ['anchor-page-1'],
        },
        '/page 2': {
          links: ['/page 1#anchor-page-1', '/page%201#anchor-page-1'],
          anchors: ['anchor-page-2'],
        },
      },
    });
  });

  it('accepts valid link with querystring + anchor', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1'}, {path: '/page2'}],
      collectedLinks: {
        '/page1': {
          links: ['/page2?age=42&theme=dark#page2anchor'],
          anchors: [],
        },
        '/page2': {links: [], anchors: ['page2anchor']},
      },
    });
  });

  it('accepts valid link to self', async () => {
    await testBrokenLinks({
      routes: [{path: '/page1'}],
      collectedLinks: {
        '/page1': {
          links: [
            '/page1',
            './page1',
            '',
            '/page1#anchor1',
            '#anchor1',
            '/page1?age=42#anchor1',
            '?age=42#anchor1',
          ],
          anchors: ['anchor1'],
        },
      },
    });
  });

  it('accepts valid link with spaces and encoding', async () => {
    await testBrokenLinks({
      routes: [{path: '/page 1'}, {path: '/page 2'}],
      collectedLinks: {
        '/page 1': {
          links: [
            '/page 1',
            '/page%201',
            '/page%201?age=42',
            '/page 2',
            '/page%202',
            '/page%202?age=42',
            '/page%202?age=42#page2anchor',

            '/some dir/page 3',
            '/some dir/page 3#page3anchor',
            '/some%20dir/page%203',
            '/some%20dir/page%203#page3anchor',
            '/some%20dir/page 3',
            '/some dir/page%203',
            '/some dir/page%203#page3anchor',
          ],
          anchors: [],
        },
        '/page 2': {links: [], anchors: ['page2anchor']},
        '/some dir/page 3': {links: [], anchors: ['page3anchor']},
      },
    });
  });

  it('accepts valid link with anchor with spaces and encoding', async () => {
    await testBrokenLinks({
      routes: [{path: '/page 1'}, {path: '/page 2'}],
      collectedLinks: {
        '/page 1': {
          links: [
            '/page 1#a b',
            '#a b',
            '#a%20b',
            '#c d',
            '#c%20d',

            '/page 2#你好',
            '/page%202#你好',
            '/page 2#%E4%BD%A0%E5%A5%BD',
            '/page%202#%E4%BD%A0%E5%A5%BD',

            '/page 2#schrödingers-cat-principle',
            '/page%202#schrödingers-cat-principle',
            '/page 2#schr%C3%B6dingers-cat-principle',
            '/page%202#schr%C3%B6dingers-cat-principle',
          ],
          anchors: ['a b', 'c%20d'],
        },
        '/page 2': {
          links: ['/page 1#a b', '/page%201#c d'],
          anchors: ['你好', '#schr%C3%B6dingers-cat-principle'],
        },
      },
    });
  });

  it('reports malformed percent encoded path as broken instead of crashing', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}],
        collectedLinks: {
          '/page1': {links: ['/page%'], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /page%
      ]
    `);
  });

  it('reports malformed percent encoded anchor as broken instead of crashing', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page 2'}],
        collectedLinks: {
          '/page1': {links: ['/page 2#100%'], anchors: []},
          '/page 2': {links: [], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page 2#100% (resolved as: /page%202#100%)
      ]
    `);
  });

  it('reports malformed percent encoded anchors when broken paths are ignored', async () => {
    await expect(() =>
      testBrokenLinks({
        onBrokenLinks: 'ignore',
        routes: [{path: '/page1'}],
        collectedLinks: {
          '/page1': {links: ['/page1#100%'], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page1#100%
      ]
    `);
  });

  it('accepts valid link with empty anchor', async () => {
    await testBrokenLinks({
      routes: [{path: '/page 1'}, {path: '/page 2'}],
      collectedLinks: {
        '/page 1': {
          links: [
            '/page 1',
            '/page 2',
            '/page 1#',
            '/page 2#',
            '/page 1?age=42#',
            '/page 2?age=42#',
            '#',
            '#',
            './page 1#',
            './page 2#',
          ],
          anchors: [],
        },
        '/page 2': {links: [], anchors: []},
      },
    });
  });

  it('rejects broken link', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page2'}],
        collectedLinks: {
          '/page1': {links: ['/brokenLink'], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /brokenLink
      ]
    `);
  });

  it('rejects broken link due to strict matching', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [
          {path: '/page1', strict: true},
          {path: '/page2/', strict: true},
        ],

        collectedLinks: {
          '/page1': {
            links: ['/page1', '/page1/', '/page2', '/page2/'],
            anchors: [],
          },
          '/page2/': {
            links: ['/page1', '/page1/', '/page2', '/page2/'],
            anchors: [],
          },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /page2
      - Broken link on source page path = /page2/:
         -> linking to /page2
      ]
    `);
  });

  it('rejects broken link due to strict exact matching', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [
          {path: '/page1', exact: true, strict: true},
          {path: '/page2/', exact: true, strict: true},
        ],

        collectedLinks: {
          '/page1': {
            links: ['/page1', '/page1/', '/page2', '/page2/'],
            anchors: [],
          },
          '/page2/': {
            links: ['/page1', '/page1/', '/page2', '/page2/'],
            anchors: [],
          },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /page1/
         -> linking to /page2
      - Broken link on source page path = /page2/:
         -> linking to /page1/
         -> linking to /page2
      ]
    `);
  });

  it('rejects broken link with anchor', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page2'}],
        collectedLinks: {
          '/page1': {links: ['/brokenLink#anchor'], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /brokenLink#anchor
      ]
    `);
  });

  it('rejects broken link with querystring + anchor', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page2'}],
        collectedLinks: {
          '/page1': {links: ['/brokenLink?age=42#anchor'], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /brokenLink?age=42#anchor
      ]
    `);
  });

  it('rejects valid link with broken anchor', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page2'}],
        collectedLinks: {
          '/page1': {links: ['/page2#brokenAnchor'], anchors: []},
          '/page2': {links: [], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page2#brokenAnchor
      ]
    `);
  });

  it('rejects valid link with broken anchor + query-string', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page2'}],
        collectedLinks: {
          '/page1': {
            links: ['/page2?age=42&theme=dark#brokenAnchor'],
            anchors: [],
          },
          '/page2': {links: [], anchors: []},
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page2?age=42&theme=dark#brokenAnchor
      ]
    `);
  });

  it('rejects valid link with broken anchor to self', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}],
        collectedLinks: {
          '/page1': {
            links: [
              '/page1',
              '',
              '#goodAnchor',
              '/page1#goodAnchor',
              '/page1?age=42#goodAnchor',
              '#badAnchor1',
              '/page1#badAnchor2',
              '/page1?age=42#badAnchor3',
            ],

            anchors: ['goodAnchor'],
          },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to #badAnchor1 (resolved as: /page1#badAnchor1)
         -> linking to /page1#badAnchor2
         -> linking to /page1?age=42#badAnchor3
      ]
    `);
  });

  it('rejects valid link with broken anchor to uncollected page', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page2'}],
        collectedLinks: {
          '/page1': {links: ['/page2#brokenAnchor'], anchors: []},
          // /page2 is absent on purpose: it doesn't contain any link/anchor
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page2#brokenAnchor
      ]
    `);
  });

  it('rejects broken anchor with query-string to uncollected page', async () => {
    await expect(() =>
      testBrokenLinks({
        routes: [{path: '/page1'}, {path: '/page2'}],
        collectedLinks: {
          '/page1': {
            links: ['/page2?age=42&theme=dark#brokenAnchor'],
            anchors: [],
          },
          // /page2 is absent on purpose: it doesn't contain any link/anchor
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page2?age=42&theme=dark#brokenAnchor
      ]
    `);
  });

  it('can ignore broken links', async () => {
    await testBrokenLinks({
      onBrokenLinks: 'ignore',
      routes: [{path: '/page1'}],
      collectedLinks: {
        '/page1': {
          links: ['/page2'],
          anchors: [],
        },
      },
    });
  });

  it('can ignore broken anchors', async () => {
    await testBrokenLinks({
      onBrokenAnchors: 'ignore',
      routes: [{path: '/page1'}],
      collectedLinks: {
        '/page1': {
          links: ['/page1#brokenAnchor'],
          anchors: [],
        },
      },
    });
  });

  it('can ignore broken anchors but report broken link', async () => {
    await expect(() =>
      testBrokenLinks({
        onBrokenAnchors: 'ignore',
        routes: [{path: '/page1'}],
        collectedLinks: {
          '/page1': {
            links: ['/page1#brokenAnchor', '/page2'],
            anchors: [],
          },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /page2
      ]
    `);
  });

  it('can ignore broken link but report broken anchors', async () => {
    await expect(() =>
      testBrokenLinks({
        onBrokenLinks: 'ignore',
        routes: [{path: '/page1'}],
        collectedLinks: {
          '/page1': {
            links: [
              '/page2',
              '/page1#brokenAnchor1',
              '/page1#brokenAnchor2',
              '#brokenAnchor3',
            ],

            anchors: [],
          },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page1#brokenAnchor1
         -> linking to /page1#brokenAnchor2
         -> linking to #brokenAnchor3 (resolved as: /page1#brokenAnchor3)
      ]
    `);
  });

  it('can warn for broken links', async () => {
    using warn = vi.spyOn(console, 'warn');

    await testBrokenLinks({
      onBrokenLinks: 'warn',
      routes: [{path: '/page1'}],
      collectedLinks: {
        '/page1': {
          links: ['/page2'],
          anchors: [],
        },
      },
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[WARNING] Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /page2
      ",
        ],
      ]
    `);
  });

  it('can warn for broken anchors', async () => {
    using warn = vi.spyOn(console, 'warn');

    await testBrokenLinks({
      onBrokenAnchors: 'warn',
      routes: [{path: '/page1'}],
      collectedLinks: {
        '/page1': {
          links: ['/page1#brokenAnchor'],
          anchors: [],
        },
      },
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[WARNING] Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page1#brokenAnchor
      ",
        ],
      ]
    `);
  });

  it('can warn for both broken links and anchors', async () => {
    using warn = vi.spyOn(console, 'warn');

    await testBrokenLinks({
      onBrokenLinks: 'warn',
      onBrokenAnchors: 'warn',
      routes: [{path: '/page1'}],
      collectedLinks: {
        '/page1': {
          links: ['/page1#brokenAnchor', '/page2'],
          anchors: [],
        },
      },
    });

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[WARNING] Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /page2
      ",
        ],
        [
          "[WARNING] Docusaurus found broken anchors!

      Please check the pages of your site in the list below, and make sure you don't reference any anchor that does not exist.
      Note: it's possible to ignore broken anchors with the 'onBrokenAnchors' Docusaurus configuration, and let the build pass.

      Exhaustive list of all broken anchors found:
      - Broken anchor on source page path = /page1:
         -> linking to /page1#brokenAnchor
      ",
        ],
      ]
    `);
  });

  it('reports frequent broken links differently', async () => {
    const pagePaths = [
      '/page1',
      '/page2',
      '/dir/page3',
      '/dir/page4',
      '/dir/page5',
    ];

    const routes: SimpleRoute[] = pagePaths.map((pagePath) => ({
      path: pagePath,
    }));

    const collectedLinks: Params['collectedLinks'] = Object.fromEntries(
      pagePaths.map((pagePath) => [
        pagePath,
        {
          links: ['/frequentBrokenLink', './relativeFrequentBrokenLink'],
          anchors: [],
        },
      ]),
    );

    await expect(() =>
      testBrokenLinks({
        routes,
        collectedLinks,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus found broken links!

      Please check the pages of your site in the list below, and make sure you don't reference any path that does not exist.
      Note: it's possible to ignore broken links with the 'onBrokenLinks' Docusaurus configuration, and let the build pass.

      It looks like some of the broken links we found appear in many pages of your site.
      Maybe those broken links appear on all pages through your site layout?
      We recommend that you check your theme configuration for such links (particularly, theme navbar and footer).
      Frequent broken links are linking to:
      - /frequentBrokenLink
      - ./relativeFrequentBrokenLink

      Exhaustive list of all broken links found:
      - Broken link on source page path = /page1:
         -> linking to /frequentBrokenLink
         -> linking to ./relativeFrequentBrokenLink (resolved as: /relativeFrequentBrokenLink)
      - Broken link on source page path = /page2:
         -> linking to /frequentBrokenLink
         -> linking to ./relativeFrequentBrokenLink (resolved as: /relativeFrequentBrokenLink)
      - Broken link on source page path = /dir/page3:
         -> linking to /frequentBrokenLink
         -> linking to ./relativeFrequentBrokenLink (resolved as: /dir/relativeFrequentBrokenLink)
      - Broken link on source page path = /dir/page4:
         -> linking to /frequentBrokenLink
         -> linking to ./relativeFrequentBrokenLink (resolved as: /dir/relativeFrequentBrokenLink)
      - Broken link on source page path = /dir/page5:
         -> linking to /frequentBrokenLink
         -> linking to ./relativeFrequentBrokenLink (resolved as: /dir/relativeFrequentBrokenLink)
      ]
    `);
  });

  it('is performant and minimize calls to matchRoutes', async () => {
    const matchRoutesMock = vi.mocked(reactRouterConfig.matchRoutes);

    const scale = 100;

    const routes: SimpleRoute[] = [
      ...Array.from<SimpleRoute>({length: scale}).map((_, i) => ({
        path: `/page${i}`,
        exact: true,
      })),
      ...Array.from<SimpleRoute>({length: scale}).map((_, i) => ({
        path: `/page/nonExact/${i}`,
      })),
      ...Array.from<SimpleRoute>({length: scale}).fill({
        path: '/pageDynamic/:subpath1',
      }),
    ];

    const collectedLinks: Params['collectedLinks'] = Object.fromEntries(
      Array.from<SimpleRoute>({length: scale}).map((_, i) => [
        `/page${i}`,
        {
          links: [
            ...Array.from<SimpleRoute>({length: scale}).flatMap((_2, j) => [
              `/page${j}`,
              `/page/nonExact/${j}`,
              `/page${j}?age=42`,
              `/page${j}#anchor${j}`,
              `/page${j}?age=42#anchor${j}`,
              `/pageDynamic/subPath${j}`,
              `/pageDynamic/subPath${j}?age=42`,
              // `/pageDynamic/subPath${j}#anchor${j}`,
              // `/pageDynamic/subPath${j}?age=42#anchor${j}`,
            ]),
          ],
          anchors: Array.from<SimpleRoute>({length: scale}).map(
            (_2, j) => `anchor${j}`,
          ),
        },
      ]),
    );

    // console.time('testBrokenLinks');
    await testBrokenLinks({
      routes,
      collectedLinks,
    });
    // console.timeEnd('testBrokenLinks');

    // Idiomatic code calling matchRoutes multiple times is not performant
    // We try to minimize the calls to this expensive function
    // Otherwise large sites will have super long execution times
    // See https://github.com/facebook/docusaurus/issues/9754
    // See https://x.com/sebastienlorber/status/1749392773415858587
    // We expect no more matchRoutes calls than number of dynamic route links
    expect(matchRoutesMock).toHaveBeenCalledTimes(scale * 2);
    // We expect matchRoutes to be called with a reduced number of routes
    expect(routes).toHaveLength(scale * 3);
    expect(matchRoutesMock.mock.calls[0]![0]).toHaveLength(scale * 2);
  });
});
