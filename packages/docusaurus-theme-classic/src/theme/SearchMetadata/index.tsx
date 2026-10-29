/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';

import Head from '@docusaurus/Head';
import type {Props} from '@theme/SearchMetadata';

// Note: we bias toward using Algolia metadata on purpose
// Not doing so leads to confusion in the community,
// as it requires to first crawl the site with the Algolia plugin enabled first
// - https://github.com/facebook/docusaurus/issues/6693
// - https://github.com/facebook/docusaurus/issues/4555
export default function SearchMetadata({
  locale,
  version,
  tag,
}: Props): ReactNode {
  // Seems safe to consider here the locale is the language, as the existing
  // docsearch:language filter is afaik a regular string-based filter
  const language = locale;

  return (
    <Head>
      {/*
      Docusaurus metadata, used by third-party search plugin
      See https://github.com/cmfcmf/docusaurus-search-local/issues/99
      */}
      {locale && <meta name="docusaurus_locale" content={locale} />}
      {version && <meta name="docusaurus_version" content={version} />}
      {tag && <meta name="docusaurus_tag" content={tag} />}

      {/* Algolia DocSearch metadata */}
      {language && <meta name="docsearch:language" content={language} />}
      {version && <meta name="docsearch:version" content={version} />}
      {tag && <meta name="docsearch:docusaurus_tag" content={tag} />}
    </Head>
  );
}
