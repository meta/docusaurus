/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import type {PropSidebarBreadcrumbsItem} from '@docusaurus/plugin-content-docs';
import type {WithContext, BreadcrumbList} from 'schema-dts';
import type {DocusaurusConfig} from '@docusaurus/types';

type Params = Pick<DocusaurusConfig, 'url' | 'baseUrl' | 'trailingSlash'>;

function getAbsoluteUrl(permalink: string, params: Params): string {
  const absoluteUrl = `${params.url}${permalink}`;
  return applyTrailingSlash(absoluteUrl, {
    trailingSlash: params.trailingSlash,
    baseUrl: params.baseUrl,
  });
}

function getBreadcrumbsStructuredData({
  breadcrumbs,
  params,
}: {
  breadcrumbs: PropSidebarBreadcrumbsItem[];
  params: Params;
}): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
      // We filter breadcrumb items without links, they are not allowed
      // See also https://github.com/facebook/docusaurus/issues/9319#issuecomment-2643560845
      .filter((breadcrumb) => breadcrumb.href)
      .map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.label,
        item: getAbsoluteUrl(breadcrumb.href!, params),
      })),
  };
}

export function useBreadcrumbsStructuredData({
  breadcrumbs,
}: {
  breadcrumbs: PropSidebarBreadcrumbsItem[];
}): WithContext<BreadcrumbList> {
  const {siteConfig} = useDocusaurusContext();
  return getBreadcrumbsStructuredData({breadcrumbs, params: siteConfig});
}
