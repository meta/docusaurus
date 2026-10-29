/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {sitemapItemsToXmlString} from '../xml';
import {ChangeFreqList} from '../types';
import type {LastModOption, SitemapItem} from '../types';

const options = {lastmod: 'datetime'} as const;

describe('createSitemap', () => {
  it('no items', async () => {
    const items: SitemapItem[] = [];

    await expect(
      sitemapItemsToXmlString(items, options),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't generate a sitemap with no items]`,
    );
  });

  it('simple item', async () => {
    const items: SitemapItem[] = [{url: 'https://docusaurus.io/docs/doc1'}];

    await expect(
      sitemapItemsToXmlString(items, options),
    ).resolves.toMatchInlineSnapshot(
      `"<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"><url><loc>https://docusaurus.io/docs/doc1</loc></url></urlset>"`,
    );
  });

  it('complex item', async () => {
    const items: SitemapItem[] = [
      {
        url: 'https://docusaurus.io/docs/doc1',
        changefreq: 'always',
        priority: 1,
        lastmod: new Date('01/01/2024').toISOString(),
      },
    ];

    await expect(
      sitemapItemsToXmlString(items, options),
    ).resolves.toMatchInlineSnapshot(
      `"<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"><url><loc>https://docusaurus.io/docs/doc1</loc><lastmod>2024-01-01T00:00:00.000Z</lastmod><changefreq>always</changefreq><priority>1.0</priority></url></urlset>"`,
    );
  });

  it('date only lastmod', async () => {
    const items: SitemapItem[] = [
      {
        url: 'https://docusaurus.io/docs/doc1',
        changefreq: 'always',
        priority: 1,
        lastmod: new Date('01/01/2024').toISOString(),
      },
    ];

    await expect(
      sitemapItemsToXmlString(items, {lastmod: 'date'}),
    ).resolves.toMatchInlineSnapshot(
      `"<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"><url><loc>https://docusaurus.io/docs/doc1</loc><lastmod>2024-01-01</lastmod><changefreq>always</changefreq><priority>1.0</priority></url></urlset>"`,
    );
  });
});

// These tests pin the exact XML output, byte for byte
// They act as a safety net to upgrade or replace the "sitemap" lib
describe('sitemapItemsToXmlString exact output', () => {
  const xmlHeader =
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">';
  const xmlFooter = '</urlset>';

  // Asserts the exact XML header/footer, and returns the <url> entries
  // Entries are split for readability: joining them gives back the exact XML
  async function getUrlEntries(
    items: SitemapItem[],
    lastmod: LastModOption | null = null,
  ): Promise<string[]> {
    const xml = await sitemapItemsToXmlString(items, {lastmod});
    expect(xml.slice(0, xmlHeader.length)).toBe(xmlHeader);
    expect(xml.slice(-xmlFooter.length)).toBe(xmlFooter);
    return xml.slice(xmlHeader.length, -xmlFooter.length).split(/(?=<url>)/);
  }

  it('emits the exact XML declaration and urlset namespaces', async () => {
    const xml = await sitemapItemsToXmlString(
      [{url: 'https://example.com/docs'}],
      {lastmod: null},
    );
    expect(xml).toMatchInlineSnapshot(
      `"<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"><url><loc>https://example.com/docs</loc></url></urlset>"`,
    );
    expect(xml).toBe(
      `${xmlHeader}<url><loc>https://example.com/docs</loc></url>${xmlFooter}`,
    );
  });

  describe('lastmod', () => {
    const items: SitemapItem[] = [
      {url: 'https://example.com/null', lastmod: null},
      {url: 'https://example.com/undefined'},
      {url: 'https://example.com/empty', lastmod: ''},
      {
        url: 'https://example.com/datetime',
        lastmod: '2024-03-15T10:20:30.456Z',
      },
      {url: 'https://example.com/date', lastmod: '2024-03-15'},
      {url: 'https://example.com/offset', lastmod: '2024-03-15T01:30:00+02:00'},
      {url: 'https://example.com/epoch', lastmod: new Date(0).toISOString()},
    ];

    it('lastmod: null', async () => {
      await expect(getUrlEntries(items, null)).resolves.toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/null</loc></url>",
          "<url><loc>https://example.com/undefined</loc></url>",
          "<url><loc>https://example.com/empty</loc></url>",
          "<url><loc>https://example.com/datetime</loc><lastmod>2024-03-15T10:20:30.456Z</lastmod></url>",
          "<url><loc>https://example.com/date</loc><lastmod>2024-03-15T00:00:00.000Z</lastmod></url>",
          "<url><loc>https://example.com/offset</loc><lastmod>2024-03-14T23:30:00.000Z</lastmod></url>",
          "<url><loc>https://example.com/epoch</loc><lastmod>1970-01-01T00:00:00.000Z</lastmod></url>",
        ]
      `);
    });

    it('lastmod: date', async () => {
      await expect(getUrlEntries(items, 'date')).resolves
        .toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/null</loc></url>",
          "<url><loc>https://example.com/undefined</loc></url>",
          "<url><loc>https://example.com/empty</loc></url>",
          "<url><loc>https://example.com/datetime</loc><lastmod>2024-03-15</lastmod></url>",
          "<url><loc>https://example.com/date</loc><lastmod>2024-03-15</lastmod></url>",
          "<url><loc>https://example.com/offset</loc><lastmod>2024-03-14</lastmod></url>",
          "<url><loc>https://example.com/epoch</loc><lastmod>1970-01-01</lastmod></url>",
        ]
      `);
    });

    it('lastmod: datetime', async () => {
      await expect(getUrlEntries(items, 'datetime')).resolves
        .toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/null</loc></url>",
          "<url><loc>https://example.com/undefined</loc></url>",
          "<url><loc>https://example.com/empty</loc></url>",
          "<url><loc>https://example.com/datetime</loc><lastmod>2024-03-15T10:20:30.456Z</lastmod></url>",
          "<url><loc>https://example.com/date</loc><lastmod>2024-03-15T00:00:00.000Z</lastmod></url>",
          "<url><loc>https://example.com/offset</loc><lastmod>2024-03-14T23:30:00.000Z</lastmod></url>",
          "<url><loc>https://example.com/epoch</loc><lastmod>1970-01-01T00:00:00.000Z</lastmod></url>",
        ]
      `);
    });
  });

  it('changefreq', async () => {
    const items: SitemapItem[] = [
      {url: 'https://example.com/null', changefreq: null},
      {url: 'https://example.com/undefined'},
      ...ChangeFreqList.map((changefreq) => ({
        url: `https://example.com/${changefreq}`,
        changefreq,
      })),
    ];
    await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
      [
        "<url><loc>https://example.com/null</loc></url>",
        "<url><loc>https://example.com/undefined</loc></url>",
        "<url><loc>https://example.com/hourly</loc><changefreq>hourly</changefreq></url>",
        "<url><loc>https://example.com/daily</loc><changefreq>daily</changefreq></url>",
        "<url><loc>https://example.com/weekly</loc><changefreq>weekly</changefreq></url>",
        "<url><loc>https://example.com/monthly</loc><changefreq>monthly</changefreq></url>",
        "<url><loc>https://example.com/yearly</loc><changefreq>yearly</changefreq></url>",
        "<url><loc>https://example.com/always</loc><changefreq>always</changefreq></url>",
        "<url><loc>https://example.com/never</loc><changefreq>never</changefreq></url>",
      ]
    `);
  });

  it('priority', async () => {
    const items: SitemapItem[] = [
      {url: 'https://example.com/null', priority: null},
      {url: 'https://example.com/undefined'},
      ...[0, 0.05, 0.1, 0.123, 0.25, 0.5, 0.55, 0.99, 1].map((priority) => ({
        url: `https://example.com/${priority}`,
        priority,
      })),
    ];
    await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
      [
        "<url><loc>https://example.com/null</loc></url>",
        "<url><loc>https://example.com/undefined</loc></url>",
        "<url><loc>https://example.com/0</loc><priority>0.0</priority></url>",
        "<url><loc>https://example.com/0.05</loc><priority>0.1</priority></url>",
        "<url><loc>https://example.com/0.1</loc><priority>0.1</priority></url>",
        "<url><loc>https://example.com/0.123</loc><priority>0.1</priority></url>",
        "<url><loc>https://example.com/0.25</loc><priority>0.3</priority></url>",
        "<url><loc>https://example.com/0.5</loc><priority>0.5</priority></url>",
        "<url><loc>https://example.com/0.55</loc><priority>0.6</priority></url>",
        "<url><loc>https://example.com/0.99</loc><priority>1.0</priority></url>",
        "<url><loc>https://example.com/1</loc><priority>1.0</priority></url>",
      ]
    `);
  });

  it('emits tags in a fixed order', async () => {
    const items: SitemapItem[] = [
      {
        priority: 0.8,
        changefreq: 'daily',
        lastmod: '2024-03-15T10:20:30.456Z',
        url: 'https://example.com/all',
      },
    ];
    await expect(getUrlEntries(items, 'datetime')).resolves
      .toMatchInlineSnapshot(`
      [
        "<url><loc>https://example.com/all</loc><lastmod>2024-03-15T10:20:30.456Z</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>",
      ]
    `);
  });

  describe('url', () => {
    const urlItems = (urls: string[]): SitemapItem[] =>
      urls.map((url) => ({url}));

    it('escapes XML special characters', async () => {
      const items = urlItems([
        'https://example.com/a&b?c=1&d=2',
        'https://example.com/a<b>c?d=<e>#<f>',
        'https://example.com/"a"?b="c"#"d"',
        "https://example.com/it's?a='b'#'c'",
      ]);
      await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/a&amp;b?c=1&amp;d=2</loc></url>",
          "<url><loc>https://example.com/a%3Cb%3Ec?d=%3Ce%3E#%3Cf%3E</loc></url>",
          "<url><loc>https://example.com/%22a%22?b=%22c%22#%22d%22</loc></url>",
          "<url><loc>https://example.com/it's?a=%27b%27#'c'</loc></url>",
        ]
      `);
    });

    it('percent-encodes spaces and non-ASCII characters', async () => {
      const items = urlItems([
        'https://example.com/folder with space/doc 1?q=a b#c d',
        'https://example.com/zh-CN/新控制器空间',
        'https://example.com/fr/café/æøå',
        'https://example.com/emoji/🦖',
      ]);
      await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/folder%20with%20space/doc%201?q=a%20b#c%20d</loc></url>",
          "<url><loc>https://example.com/zh-CN/%E6%96%B0%E6%8E%A7%E5%88%B6%E5%99%A8%E7%A9%BA%E9%97%B4</loc></url>",
          "<url><loc>https://example.com/fr/caf%C3%A9/%C3%A6%C3%B8%C3%A5</loc></url>",
          "<url><loc>https://example.com/emoji/%F0%9F%A6%96</loc></url>",
        ]
      `);
    });

    it('preserves already percent-encoded segments', async () => {
      const items = urlItems([
        'https://example.com/folder%20with%20space/doc%201',
        'https://example.com/fr/caf%C3%A9',
        'https://example.com/lower/caf%c3%a9',
        'https://example.com/mixed/café/caf%C3%A9',
        'https://example.com/percent/100%/100%25',
        'https://example.com/query?q=a%20b&r=%26',
      ]);
      await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/folder%20with%20space/doc%201</loc></url>",
          "<url><loc>https://example.com/fr/caf%C3%A9</loc></url>",
          "<url><loc>https://example.com/lower/caf%c3%a9</loc></url>",
          "<url><loc>https://example.com/mixed/caf%C3%A9/caf%C3%A9</loc></url>",
          "<url><loc>https://example.com/percent/100%/100%25</loc></url>",
          "<url><loc>https://example.com/query?q=a%20b&amp;r=%26</loc></url>",
        ]
      `);
    });

    it('preserves query and hash', async () => {
      const items = urlItems([
        'https://example.com/docs?query',
        'https://example.com/docs?a=1&a=2&b',
        'https://example.com/docs#hash',
        'https://example.com/docs/?a=1#hash',
        'https://example.com/docs?#',
      ]);
      await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/docs?query</loc></url>",
          "<url><loc>https://example.com/docs?a=1&amp;a=2&amp;b</loc></url>",
          "<url><loc>https://example.com/docs#hash</loc></url>",
          "<url><loc>https://example.com/docs/?a=1#hash</loc></url>",
          "<url><loc>https://example.com/docs?#</loc></url>",
        ]
      `);
    });

    it('normalizes trailing slashes', async () => {
      const items = urlItems([
        'https://example.com',
        'https://example.com/',
        'https://example.com/docs',
        'https://example.com/docs/',
        'https://example.com/docs//',
        'https://example.com/docs/index.html',
      ]);
      await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/</loc></url>",
          "<url><loc>https://example.com/</loc></url>",
          "<url><loc>https://example.com/docs</loc></url>",
          "<url><loc>https://example.com/docs/</loc></url>",
          "<url><loc>https://example.com/docs//</loc></url>",
          "<url><loc>https://example.com/docs/index.html</loc></url>",
        ]
      `);
    });

    it('normalizes URLs', async () => {
      const items = urlItems([
        'HTTPS://EXAMPLE.COM/Docs/Intro',
        'https://example.com:443/docs',
        'http://example.com:80/docs',
        'https://example.com:8080/docs',
        'https://exämple.com/docs',
        'https://example.com/docs/../blog/./post',
        '  https://example.com/trimmed  ',
        'https://example.com\\backslash\\docs',
      ]);
      await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
        [
          "<url><loc>https://example.com/Docs/Intro</loc></url>",
          "<url><loc>https://example.com/docs</loc></url>",
          "<url><loc>http://example.com/docs</loc></url>",
          "<url><loc>https://example.com:8080/docs</loc></url>",
          "<url><loc>https://xn--exmple-cua.com/docs</loc></url>",
          "<url><loc>https://example.com/blog/post</loc></url>",
          "<url><loc>https://example.com/trimmed</loc></url>",
          "<url><loc>https://example.com/backslash/docs</loc></url>",
        ]
      `);
    });

    it('very long URL', async () => {
      const longPath = Array.from(
        {length: 500},
        (_, i) => `segment-${String(i).padStart(4, '0')}`,
      ).join('/');
      const url = `https://example.com/${longPath}/?a=1&b=2#hash`;
      // Longer than the 2,048 chars limit of the sitemap spec: not truncated
      expect(url.length).toBeGreaterThan(2048);
      await expect(getUrlEntries([{url}])).resolves.toEqual([
        `<url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`,
      ]);
    });
  });

  it('one item', async () => {
    await expect(
      getUrlEntries(
        [
          {
            url: 'https://example.com/docs/',
            lastmod: '2024-03-15',
            changefreq: 'weekly',
            priority: 0.5,
          },
        ],
        'date',
      ),
    ).resolves.toMatchInlineSnapshot(`
      [
        "<url><loc>https://example.com/docs/</loc><lastmod>2024-03-15</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>",
      ]
    `);
  });

  it('many items', async () => {
    const items: SitemapItem[] = Array.from({length: 10_000}, (_, i) => ({
      url: `https://example.com/docs/doc-${i}`,
      lastmod: new Date(Date.UTC(2024, 0, 1) + i * 3_600_000).toISOString(),
      changefreq: 'weekly',
      priority: 0.5,
    }));
    // Duplicates are not removed
    items.push(items[0]!);

    const entries = await getUrlEntries(items, 'datetime');

    expect(entries).toHaveLength(10_001);
    expect(entries.slice(0, 2)).toMatchInlineSnapshot(`
      [
        "<url><loc>https://example.com/docs/doc-0</loc><lastmod>2024-01-01T00:00:00.000Z</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>",
        "<url><loc>https://example.com/docs/doc-1</loc><lastmod>2024-01-01T01:00:00.000Z</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>",
      ]
    `);
    expect(entries.at(-2)).toMatchInlineSnapshot(
      `"<url><loc>https://example.com/docs/doc-9999</loc><lastmod>2025-02-20T15:00:00.000Z</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>"`,
    );
    expect(entries.at(-1)).toBe(entries[0]);
    expect(entries).toEqual(
      items.map(
        (item) =>
          `<url><loc>${item.url}</loc><lastmod>${item.lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`,
      ),
    );
  });

  // Not part of our SitemapItem type, nor documented
  // However, users can return these extra fields from createSitemapItems()
  // and the "sitemap" lib serializes them
  it('serializes undocumented sitemap lib fields', async () => {
    const items = [
      {
        url: 'https://example.com/docs',
        links: [
          {lang: 'en', url: 'https://example.com/docs'},
          {lang: 'fr', url: 'https://example.com/fr/docs'},
        ],
        img: [{url: 'https://example.com/img/logo.png'}],
      } as SitemapItem,
    ];
    await expect(getUrlEntries(items)).resolves.toMatchInlineSnapshot(`
      [
        "<url><loc>https://example.com/docs</loc><xhtml:link rel="alternate" hreflang="en" href="https://example.com/docs"/><xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/docs"/><image:image><image:loc>https://example.com/img/logo.png</image:loc></image:image></url>",
      ]
    `);
  });
});
