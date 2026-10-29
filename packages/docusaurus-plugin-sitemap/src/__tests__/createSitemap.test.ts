/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {fromPartial} from '@total-typescript/shoehorn';
import {TEST_VCS} from '@docusaurus/utils';
import createSitemap from '../createSitemap';
import type {PluginOptions} from '../options';
import type {DocusaurusConfig, RouteConfig} from '@docusaurus/types';

const siteConfig: DocusaurusConfig = fromPartial({
  url: 'https://example.com',
  vcs: TEST_VCS,
});

const options: PluginOptions = {
  ignorePatterns: [],
  filename: 'sitemap.xml',
  lastmod: 'datetime',
};

const route = (routePath: string, routePaths?: string[]): RouteConfig => {
  return fromPartial({
    path: routePath,
    routes: routePaths?.map((p) => route(p)),
  });
};

const routes = (routePaths: string[]): RouteConfig[] => {
  return routePaths.map((p) => route(p));
};

describe('createSitemap', () => {
  it('simple site', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes(['/', '/test']),
      routesBuildMetadata: {},
      options,
    });
    expect(sitemap).toContain(
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
    );
    expect(sitemap).not.toContain('<changefreq>');
    expect(sitemap).not.toContain('<priority>');
  });

  it('site with no routes', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes([]),
      routesBuildMetadata: {},
      options,
    });
    expect(sitemap).toBeNull();
  });

  it('excludes patterns configured to be ignored', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes([
        '/',
        '/search/',
        '/tags/',
        '/search/foo',
        '/tags/foo/bar',
      ]),
      routesBuildMetadata: {},
      options: {
        ...options,
        ignorePatterns: [
          // Shallow ignore
          '/search/',
          // Deep ignore
          '/tags/**',
        ],
      },
    });

    expect(sitemap).not.toContain('/search/</loc>');
    expect(sitemap).toContain('/search/foo');
    expect(sitemap).not.toContain('/tags');
  });

  it('excludes items that createSitemapItems configures to be ignored', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes([
        '/',
        '/search/',
        '/tags/',
        '/search/foo',
        '/tags/foo/bar',
      ]),
      routesBuildMetadata: {},
      options: {
        ...options,
        createSitemapItems: async (params) => {
          const {defaultCreateSitemapItems, ...rest} = params;
          const sitemapItems = await defaultCreateSitemapItems(rest);
          const sitemapsWithoutPageAndTags = sitemapItems.filter(
            (sitemapItem) =>
              !sitemapItem.url.includes('/tags/') &&
              !sitemapItem.url.endsWith('/search/'),
          );
          return sitemapsWithoutPageAndTags;
        },
      },
    });

    expect(sitemap).not.toContain('/search/</loc>');
    expect(sitemap).toContain('/search/foo');
    expect(sitemap).not.toContain('/tags');
  });

  it('emits changefreq and priority added by createSitemapItems', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes(['/', '/docs/myDoc']),
      routesBuildMetadata: {},
      options: {
        ...options,
        createSitemapItems: async (params) => {
          const {defaultCreateSitemapItems, ...rest} = params;
          const items = await defaultCreateSitemapItems(rest);
          return items.map((item) => ({
            ...item,
            changefreq: 'weekly',
            priority: item.url.includes('/docs/') ? 0.8 : 0.5,
          }));
        },
      },
    });

    expect(sitemap).toContain(
      '<url><loc>https://example.com/</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>',
    );
    expect(sitemap).toContain(
      '<url><loc>https://example.com/docs/myDoc</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>',
    );
  });

  it('returns null when createSitemapItems returns no items', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes(['/', '/docs/myDoc/', '/blog/post']),
      routesBuildMetadata: {},
      options: {
        ...options,
        createSitemapItems: async () => {
          return [];
        },
      },
    });

    expect(sitemap).toBeNull();
  });

  it('keep trailing slash unchanged', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes(['/', '/test', '/nested/test', '/nested/test2/']),
      routesBuildMetadata: {},
      options,
    });

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/test</loc>');
    expect(sitemap).toContain('<loc>https://example.com/nested/test</loc>');
    expect(sitemap).toContain('<loc>https://example.com/nested/test2/</loc>');
  });

  it('add trailing slash', async () => {
    const sitemap = await createSitemap({
      siteConfig: {...siteConfig, trailingSlash: true},
      routes: routes(['/', '/test', '/nested/test', '/nested/test2/']),
      routesBuildMetadata: {},
      options,
    });

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/test/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/nested/test/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/nested/test2/</loc>');
  });

  it('remove trailing slash', async () => {
    const sitemap = await createSitemap({
      siteConfig: {
        ...siteConfig,
        url: 'https://example.com',
        trailingSlash: false,
      },
      routes: routes(['/', '/test', '/nested/test', '/nested/test2/']),
      routesBuildMetadata: {},
      options,
    });

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/test</loc>');
    expect(sitemap).toContain('<loc>https://example.com/nested/test</loc>');
    expect(sitemap).toContain('<loc>https://example.com/nested/test2</loc>');
  });

  it('filters pages with noindex', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes(['/', '/noindex', '/nested/test', '/nested/test2/']),
      routesBuildMetadata: {
        '/noindex': {
          noIndex: true,
        },
      },
      options,
    });

    expect(sitemap).not.toContain('/noindex');
  });

  it('does not generate anything for all pages with noindex', async () => {
    const sitemap = await createSitemap({
      siteConfig,
      routes: routes(['/', '/noindex']),
      routesBuildMetadata: {
        '/': {
          noIndex: true,
        },
        '/noindex': {
          noIndex: true,
        },
      },
      options,
    });

    expect(sitemap).toBeNull();
  });
});
