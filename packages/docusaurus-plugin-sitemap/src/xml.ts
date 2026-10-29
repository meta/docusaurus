/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {SitemapStream, streamToPromise} from 'sitemap';
import type {LastModOption, SitemapItem} from './types';

export async function sitemapItemsToXmlString(
  items: SitemapItem[],
  options: {lastmod: LastModOption | null},
): Promise<string> {
  if (items.length === 0) {
    // Fail fast with a clearer error than the lib's EmptySitemap error
    throw new Error("Can't generate a sitemap with no items");
  }

  // We could generate the XML ourselves, but we keep using the lib on purpose
  // Users can return undocumented fields from createSitemapItems()
  // (links, img, video, news...) that the lib serializes
  // See https://github.com/ekalinin/sitemap.js
  const sitemapStream = new SitemapStream({
    // WTF is this lib reformatting the string YYYY-MM-DD to datetime...
    lastmodDateOnly: options?.lastmod === 'date',
  });

  items.forEach((item) => sitemapStream.write(item));
  sitemapStream.end();

  const buffer = await streamToPromise(sitemapStream);
  return buffer.toString();
}
