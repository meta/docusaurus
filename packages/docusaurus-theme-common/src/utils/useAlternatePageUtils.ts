/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import type {I18nLocaleConfig} from '@docusaurus/types';

/**
 * Permits to obtain the url of the current page in another locale, useful to
 * generate hreflang meta headers etc...
 *
 * @see https://developers.google.com/search/docs/advanced/crawling/localized-versions
 */
export function useAlternatePageUtils(): {
  /**
   * Everything (pathname, base URL, etc.) is read from the context. Just tell
   * it which locale to link to and it will give you the alternate link for the
   * current page.
   */
  createUrl: ({
    /** The locale name to link to. */
    locale,
    /**
     * For hreflang SEO headers, we need it to be fully qualified (full
     * protocol/domain/path...); but for locale dropdowns, using a pathname is
     * good enough.
     */
    fullyQualified,
  }: {
    locale: string;
    fullyQualified: boolean;
  }) => string;
} {
  const {
    siteConfig: {baseUrl, trailingSlash},
    i18n: {localeConfigs},
  } = useDocusaurusContext();

  // TODO using useLocation().pathname is not a super idea
  // See https://github.com/facebook/docusaurus/issues/9170
  const {pathname} = useLocation();

  const canonicalPathname = applyTrailingSlash(pathname, {
    trailingSlash,
    baseUrl,
  });

  // Canonical pathname, without the baseUrl of the current locale
  const pathnameSuffix = canonicalPathname.replace(baseUrl, '');

  function getLocaleConfig(locale: string): I18nLocaleConfig {
    const localeConfig = localeConfigs[locale];
    if (!localeConfig) {
      throw new Error(
        `Unexpected Docusaurus bug, no locale config found for locale=${locale}`,
      );
    }
    return localeConfig;
  }

  function createUrl({
    locale,
    fullyQualified,
  }: {
    locale: string;
    fullyQualified: boolean;
  }) {
    const localeConfig = getLocaleConfig(locale);
    const newUrl = `${fullyQualified ? localeConfig.url : ''}`;
    const newBaseUrl = localeConfig.baseUrl;
    return `${newUrl}${newBaseUrl}${pathnameSuffix}`;
  }

  return {createUrl};
}
