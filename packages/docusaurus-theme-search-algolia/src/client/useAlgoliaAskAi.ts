/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useCallback, useMemo, useState} from 'react';
import translations from '@theme/SearchTranslations';
import {useAlgoliaContextualFacetFiltersIfEnabled} from './useAlgoliaContextualFacetFilters';
import {facetFiltersToFilterString, mergeFilters} from './utils';
import type {FacetFilters} from 'algoliasearch/lite';
import type {AskAiConfig} from '@docusaurus/theme-search-algolia';
import type {DocSearchAskAi, DocSearchModalProps} from '@docsearch/react';

type DocSearchProps = Omit<
  DocSearchModalProps,
  'onClose' | 'initialScrollY'
> & {
  askAi?: DocSearchAskAi;
};

type UseAskAiResult = {
  canHandleAskAi: boolean;
  isAskAiActive: boolean;
  currentPlaceholder: string | undefined;
  onAskAiToggle: (active: boolean) => void;
  askAi?: AskAiConfig;
  extraAskAiProps: Partial<DocSearchModalProps> & {
    askAi?: AskAiConfig;
    canHandleAskAi?: boolean;
    isAskAiActive?: boolean;
    onAskAiToggle?: (active: boolean) => void;
  };
};

function buildAskAiSearchParameters(
  askAi: AskAiConfig | undefined,
  contextualSearchFilters: FacetFilters | undefined,
): AskAiConfig | undefined {
  if (!askAi) {
    return undefined;
  }

  const indices = [
    ...new Set([
      ...(askAi.indices ?? []),
      ...Object.keys(askAi.searchParameters ?? {}),
    ]),
  ];

  if (!indices.length) {
    return askAi;
  }

  // Agent Studio accepts `filters`, not `facetFilters`.
  const contextualFilters = contextualSearchFilters
    ? facetFiltersToFilterString(contextualSearchFilters)
    : undefined;
  const searchParameters = {...askAi.searchParameters};

  for (const indexName of indices) {
    const {facetFilters, ...current} = searchParameters[indexName] ?? {};
    let currentFilters = current.filters;

    if (facetFilters?.length) {
      currentFilters = mergeFilters(
        current.filters,
        facetFiltersToFilterString(facetFilters),
      );
    }

    searchParameters[indexName] = {
      ...current,
      filters: mergeFilters(currentFilters, contextualFilters),
    };
  }

  return {
    ...askAi,
    searchParameters,
  };
}

export function useAlgoliaAskAi(props: DocSearchProps): UseAskAiResult {
  const [isAskAiActive, setIsAskAiActive] = useState(false);
  const contextualSearchFilters = useAlgoliaContextualFacetFiltersIfEnabled();

  const askAi = useMemo(() => {
    return buildAskAiSearchParameters(props.askAi, contextualSearchFilters);
  }, [props.askAi, contextualSearchFilters]);

  const canHandleAskAi = Boolean(askAi);

  const currentPlaceholder = isAskAiActive
    ? translations.modal?.searchBox?.placeholderTextAskAi
    : translations.modal?.searchBox?.placeholderText || props?.placeholder;

  const onAskAiToggle = useCallback((askAiToggle: boolean) => {
    setIsAskAiActive(askAiToggle);
  }, []);

  const extraAskAiProps: UseAskAiResult['extraAskAiProps'] = {
    askAi,
    canHandleAskAi,
    isAskAiActive,
    onAskAiToggle,
  };

  return {
    canHandleAskAi,
    isAskAiActive,
    currentPlaceholder,
    onAskAiToggle,
    askAi,
    extraAskAiProps,
  };
}
