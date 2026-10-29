/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {DEFAULT_SEARCH_TAG} from '@docusaurus/theme-common/internal';
import {useDocsContextualSearchTags} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAlgoliaThemeConfig} from './useAlgoliaThemeConfig';
import type {FacetFilters} from 'algoliasearch/lite';

function useSearchTags() {
  // only docs have custom search tags per version
  const docsTags = useDocsContextualSearchTags();
  return [DEFAULT_SEARCH_TAG, ...docsTags];
}

// Translate search-engine agnostic search tags to Algolia search filters
export function useAlgoliaContextualFacetFilters(): FacetFilters {
  const locale = useDocusaurusContext().i18n.currentLocale;
  const tags = useSearchTags();

  // Seems safe to convert locale->language, see AlgoliaSearchMetadata comment
  const languageFilter = `language:${locale}`;

  const tagsFilter = tags.map((tag) => `docusaurus_tag:${tag}`);

  return [languageFilter, tagsFilter];
}

export function useAlgoliaContextualFacetFiltersIfEnabled():
  | FacetFilters
  | undefined {
  const {
    algolia: {contextualSearch},
  } = useAlgoliaThemeConfig();
  const facetFilters = useAlgoliaContextualFacetFilters();
  if (contextualSearch) {
    return facetFilters;
  } else {
    return undefined;
  }
}
