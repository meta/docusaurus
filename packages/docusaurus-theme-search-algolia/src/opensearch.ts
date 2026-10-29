/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import {Eta} from 'eta';
import {normalizeUrl} from '@docusaurus/utils';
import {fs} from '@docusaurus/fs';
import openSearchTemplate from './templates/opensearch';

import type {HtmlTags, LoadContext} from '@docusaurus/types';
import type {ThemeConfig} from '@docusaurus/theme-search-algolia';

const eta = new Eta();

const getCompiledOpenSearchTemplate = _.memoize(() =>
  eta.compile(openSearchTemplate.trim()),
);

function renderOpenSearchTemplate(data: {
  title: string;
  siteUrl: string;
  searchUrl: string;
  faviconUrl: string | null;
}) {
  const compiled = getCompiledOpenSearchTemplate();
  return eta.render(compiled, data);
}

const OPEN_SEARCH_FILENAME = 'opensearch.xml';

export function shouldCreateOpenSearchFile({
  context,
}: {
  context: LoadContext;
}): boolean {
  const {
    siteConfig: {
      themeConfig,
      future: {experimental_router: router},
    },
  } = context;
  const {
    algolia: {searchPagePath},
  } = themeConfig as ThemeConfig;

  return !!searchPagePath && router !== 'hash';
}

function createOpenSearchFileContent({
  context,
  searchPagePath,
}: {
  context: LoadContext;
  searchPagePath: string;
}): string {
  const {
    baseUrl,
    siteConfig: {title, url, favicon},
  } = context;

  const siteUrl = normalizeUrl([url, baseUrl]);

  return renderOpenSearchTemplate({
    title,
    siteUrl,
    searchUrl: normalizeUrl([siteUrl, searchPagePath]),
    faviconUrl: favicon ? normalizeUrl([siteUrl, favicon]) : null,
  });
}

export async function createOpenSearchFile({
  context,
}: {
  context: LoadContext;
}): Promise<void> {
  const {
    outDir,
    siteConfig: {themeConfig},
  } = context;
  const {
    algolia: {searchPagePath},
  } = themeConfig as ThemeConfig;
  if (!searchPagePath) {
    throw new Error('no searchPagePath provided in themeConfig.algolia');
  }
  const fileContent = createOpenSearchFileContent({context, searchPagePath});
  try {
    await fs.writeFile(path.join(outDir, OPEN_SEARCH_FILENAME), fileContent);
  } catch (err) {
    throw new Error('Generating OpenSearch file failed.', {cause: err});
  }
}

export function createOpenSearchHeadTags({
  context,
}: {
  context: LoadContext;
}): HtmlTags {
  const {
    baseUrl,
    siteConfig: {title},
  } = context;
  return {
    tagName: 'link',
    attributes: {
      rel: 'search',
      type: 'application/opensearchdescription+xml',
      title,
      href: normalizeUrl([baseUrl, OPEN_SEARCH_FILENAME]),
    },
  };
}
