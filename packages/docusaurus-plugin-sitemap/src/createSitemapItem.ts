/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import {normalizeUrl} from '@docusaurus/utils';
import type {LastModOption, SitemapItem} from './types';
import type {DocusaurusConfig, RouteConfig, VcsConfig} from '@docusaurus/types';
import type {PluginOptions} from './options';

// Warn only once: the VCS read error is usually the same for all files
const warnVcsReadErrorOnce = _.once(
  (sourceFilePath: string, error: unknown) => {
    logger.warn`Sitemap: unable to read the last update date of file path=${sourceFilePath} (and possibly other files), their code=${'<lastmod>'} tag will be omitted. Use the sitemap option code=${'lastmod: null'} to disable code=${'<lastmod>'} tags.
Cause: ${(error as Error).message}`;
  },
);

// The sitemap <lastmod> tag is optional SEO metadata, enabled by default
// We don't want to fail the build when the VCS can't be read
// This happens notably for sites outside a Git repository
async function readVcsLastUpdatedAt(
  sourceFilePath: string,
  vcs: Pick<VcsConfig, 'getFileLastUpdateInfo'>,
): Promise<number | null> {
  try {
    const lastUpdateInfo = await vcs.getFileLastUpdateInfo(sourceFilePath);
    return lastUpdateInfo?.timestamp ?? null;
  } catch (error) {
    warnVcsReadErrorOnce(sourceFilePath, error);
    return null;
  }
}

async function getRouteLastUpdatedAt(
  route: RouteConfig,
  vcs: Pick<VcsConfig, 'getFileLastUpdateInfo'>,
): Promise<number | null | undefined> {
  // Important to bail-out early here
  // This can lead to duplicated VCS calls and performance problems
  // See https://github.com/facebook/docusaurus/pull/11211
  if (route.metadata?.lastUpdatedAt === null) {
    return null;
  }
  if (route.metadata?.lastUpdatedAt != null) {
    return route.metadata?.lastUpdatedAt;
  }
  if (route.metadata?.sourceFilePath) {
    return readVcsLastUpdatedAt(route.metadata.sourceFilePath, vcs);
  }

  return undefined;
}

type LastModFormatter = (timestamp: number) => string;

const LastmodFormatters: Record<LastModOption, LastModFormatter> = {
  date: (timestamp) => new Date(timestamp).toISOString().split('T')[0]!,
  datetime: (timestamp) => new Date(timestamp).toISOString(),
};

function formatLastmod(timestamp: number, lastmodOption: LastModOption) {
  const format = LastmodFormatters[lastmodOption];
  return format(timestamp);
}

async function getRouteLastmod({
  route,
  lastmod,
  vcs,
}: {
  route: RouteConfig;
  lastmod: LastModOption | null;
  vcs: Pick<VcsConfig, 'getFileLastUpdateInfo'>;
}): Promise<string | null> {
  if (lastmod === null) {
    return null;
  }
  const lastUpdatedAt = (await getRouteLastUpdatedAt(route, vcs)) ?? null;
  return lastUpdatedAt != null ? formatLastmod(lastUpdatedAt, lastmod) : null;
}

export async function createSitemapItem({
  route,
  siteConfig,
  options,
}: {
  route: RouteConfig;
  siteConfig: DocusaurusConfig;
  options: PluginOptions;
}): Promise<SitemapItem> {
  const {lastmod} = options;
  return {
    url: normalizeUrl([
      siteConfig.url,
      applyTrailingSlash(route.path, {
        trailingSlash: siteConfig.trailingSlash,
        baseUrl: siteConfig.baseUrl,
      }),
    ]),
    lastmod: await getRouteLastmod({
      route,
      lastmod,
      vcs: siteConfig.vcs,
    }),
  };
}
