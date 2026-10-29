/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import {fromPartial} from '@total-typescript/shoehorn';
import {TEST_VCS} from '@docusaurus/utils';
import {createSitemapItem} from '../createSitemapItem';
import {DEFAULT_OPTIONS} from '../options';
import type {PluginOptions} from '../options';
import type {DocusaurusConfig, RouteConfig} from '@docusaurus/types';

const siteConfig: DocusaurusConfig = fromPartial({
  url: 'https://example.com',
  vcs: TEST_VCS,
});

function test(params: {
  route: Partial<RouteConfig>;
  siteConfig?: Partial<DocusaurusConfig>;
  options?: Partial<PluginOptions>;
}) {
  return createSitemapItem({
    route: params.route as unknown as RouteConfig,
    siteConfig: {...siteConfig, ...params.siteConfig},
    options: {...DEFAULT_OPTIONS, ...params.options},
  });
}

function testRoute(route: Partial<RouteConfig>) {
  return test({
    route,
  });
}

describe('createSitemapItem', () => {
  it('simple item', async () => {
    await expect(testRoute({path: '/routePath'})).resolves
      .toMatchInlineSnapshot(`
      {
        "lastmod": null,
        "url": "https://example.com/routePath",
      }
    `);
  });

  describe('lastmod', () => {
    const date = new Date('2024/01/01');

    describe('read from route metadata', () => {
      const route = {
        path: '/routePath',
        metadata: {lastUpdatedAt: date.getTime()},
      };

      it('lastmod default option', async () => {
        await expect(
          test({
            route,
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2024-01-01",
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod date option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'date',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2024-01-01",
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod datetime option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'datetime',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2024-01-01T00:00:00.000Z",
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod null option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: null,
            },
          }),
        ).resolves.toMatchObject({lastmod: null});
      });

      it('lastmod from epoch (0) timestamp is not dropped', async () => {
        await expect(
          test({
            options: {lastmod: 'date'},
            route: {metadata: {lastUpdatedAt: 0}, path: '/routePath'},
          }),
        ).resolves.toMatchObject({lastmod: '1970-01-01'});
      });
    });

    describe('read from git', () => {
      const route = {
        path: '/routePath',
        metadata: {sourceFilePath: 'route/file.md'},
      };

      it('lastmod default option', async () => {
        await expect(
          test({
            route,
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2018-10-14",
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod date option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'date',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2018-10-14",
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod datetime option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'datetime',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2018-10-14T07:27:35.000Z",
            "url": "https://example.com/routePath",
          }
        `);
      });
    });

    describe('read from git - VCS error', () => {
      const route = {
        path: '/routePath',
        metadata: {sourceFilePath: 'route/file.md'},
      };

      const siteConfigWithFailingVcs: Partial<DocusaurusConfig> = {
        vcs: {
          ...TEST_VCS,
          getFileLastUpdateInfo: async () => {
            throw new Error(
              'This Docusaurus site is outside any Git worktree.',
            );
          },
        },
      };

      it('omits lastmod and warns only once', async () => {
        using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await expect(
          test({route, siteConfig: siteConfigWithFailingVcs}),
        ).resolves.toMatchObject({lastmod: null});
        await expect(
          test({route, siteConfig: siteConfigWithFailingVcs}),
        ).resolves.toMatchObject({lastmod: null});

        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0]![0]).toMatch(/route\/file\.md/);
        expect(warn.mock.calls[0]![0]).toMatch(
          /This Docusaurus site is outside any Git worktree/,
        );
      });
    });

    describe('read from both - route metadata takes precedence', () => {
      const route = {
        path: '/routePath',
        metadata: {
          sourceFilePath: 'route/file.md',
          lastUpdatedAt: date.getTime(),
        },
      };

      it('lastmod default option', async () => {
        await expect(
          test({
            route,
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2024-01-01",
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod date option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'date',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2024-01-01",
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod datetime option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'datetime',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": "2024-01-01T00:00:00.000Z",
            "url": "https://example.com/routePath",
          }
        `);
      });
    });

    describe('read from both - route metadata lastUpdatedAt null', () => {
      const route = {
        path: '/routePath',
        metadata: {
          sourceFilePath: 'route/file.md',
          lastUpdatedAt: null,
        },
      };

      it('lastmod default option', async () => {
        await expect(
          test({
            route,
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": null,
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod date option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'date',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": null,
            "url": "https://example.com/routePath",
          }
        `);
      });

      it('lastmod datetime option', async () => {
        await expect(
          test({
            route,
            options: {
              lastmod: 'datetime',
            },
          }),
        ).resolves.toMatchInlineSnapshot(`
          {
            "lastmod": null,
            "url": "https://example.com/routePath",
          }
        `);
      });
    });
  });
});
