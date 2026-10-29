/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function SiteMetadataDefaults(): ReactNode {
  const {
    siteConfig: {favicon, title, noIndex},
    i18n: {currentLocale, localeConfigs},
  } = useDocusaurusContext();
  const faviconUrl = useBaseUrl(favicon);
  const {htmlLang, direction: htmlDir} = localeConfigs[currentLocale]!;

  return (
    <Head>
      {/*
        charSet + generator are handled in the html templates
        See https://github.com/facebook/docusaurus/pull/7952
        <meta charSet="UTF-8" />
        <meta name="generator" content={`Docusaurus v${docusaurusVersion}`} />
      */}
      <html lang={htmlLang} dir={htmlDir} />
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {favicon && <link rel="icon" href={faviconUrl} />}
    </Head>
  );
}
