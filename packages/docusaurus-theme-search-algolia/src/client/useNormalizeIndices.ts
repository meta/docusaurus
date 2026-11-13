/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useMemo} from 'react';
import {mergeFacetFilters} from '@docsearch/react/utils';
import {useAlgoliaContextualFacetFilters} from './useAlgoliaContextualFacetFilters';
import type {DocSearchProps} from './types';
import type {FacetFilters} from 'algoliasearch/lite';

type Index = DocSearchProps['indices'][number];

export function normalizeIndex(
  contextualFacetFilters: FacetFilters,
  contextualSearch?: string,
) {
  return (index: Index): Index => {
    const normalizedIndex =
      typeof index === 'string' ? {name: index, searchParameters: {}} : index;
    const configFacetFilters: FacetFilters =
      normalizedIndex.searchParameters?.facetFilters ?? [];

    const facetFilters: FacetFilters = contextualSearch
      ? // Merge contextual search filters with config filters
        (mergeFacetFilters(contextualFacetFilters, configFacetFilters) ?? [])
      : // ... or use config facetFilters
        configFacetFilters;

    return {
      name: normalizedIndex.name,
      searchParameters: {
        ...normalizedIndex.searchParameters,
        facetFilters,
      },
    };
  };
}

// Normalizes `indices` with configured and merged search parameters
export function useNormalizeIndices({
  contextualSearch,
  ...props
}: DocSearchProps): Index[] {
  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters();

  return useMemo(
    () =>
      props.indices.map(
        normalizeIndex(contextualSearchFacetFilters, contextualSearch),
      ),
    [props.indices, contextualSearchFacetFilters, contextualSearch],
  );
}
