/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useCallback} from 'react';
import useDocusaurusContext from './useDocusaurusContext';
import {hasProtocol} from './isInternalUrl';
import type {BaseUrlOptions, BaseUrlUtils} from '@docusaurus/useBaseUrl';
import type {RouterType} from '@docusaurus/types';

export function addBaseUrl({
  siteUrl,
  baseUrl,
  url,
  options: {forcePrependBaseUrl = false, absolute = false} = {},
  router,
}: {
  siteUrl: string;
  baseUrl: string;
  url: string;
  router: RouterType;
  options?: BaseUrlOptions;
}): string {
  // It never makes sense to add base url to a local anchor url, or one with a
  // protocol
  if (!url || url.startsWith('#') || hasProtocol(url)) {
    return url;
  }

  // TODO hash router + /baseUrl/ is unlikely to work well in all situations
  // This will support most cases, but not all
  // See https://github.com/facebook/docusaurus/pull/9859
  if (router === 'hash') {
    return url.startsWith('/') ? `.${url}` : `./${url}`;
  }

  if (forcePrependBaseUrl) {
    return baseUrl + url.replace(/^\//, '');
  }

  // /baseUrl -> /baseUrl/
  // https://github.com/facebook/docusaurus/issues/6315
  if (url === baseUrl.replace(/\/$/, '')) {
    return baseUrl;
  }

  // We should avoid adding the baseurl twice if it's already there
  const shouldAddBaseUrl = !url.startsWith(baseUrl);

  const basePath = shouldAddBaseUrl ? baseUrl + url.replace(/^\//, '') : url;

  return absolute ? siteUrl + basePath : basePath;
}

export function useBaseUrlUtils(): BaseUrlUtils {
  const {siteConfig} = useDocusaurusContext();
  const {baseUrl, url: siteUrl} = siteConfig;
  const router = siteConfig.future.experimental_router;

  const withBaseUrl = useCallback(
    (url: string, options?: BaseUrlOptions) =>
      addBaseUrl({siteUrl, baseUrl, url, options, router}),
    [siteUrl, baseUrl, router],
  );

  return {
    withBaseUrl,
  };
}

export default function useBaseUrl(
  url: string,
  options: BaseUrlOptions = {},
): string {
  const {withBaseUrl} = useBaseUrlUtils();
  return withBaseUrl(url, options);
}
