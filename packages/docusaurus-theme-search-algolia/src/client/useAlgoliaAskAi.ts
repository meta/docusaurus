/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useCallback, useMemo, useState} from 'react';
import {mergeFacetFilters} from '@docsearch/react/utils';
import translations from '@theme/SearchTranslations';
import {useAlgoliaContextualFacetFiltersIfEnabled} from './useAlgoliaContextualFacetFilters';
import type {DocSearchProps} from './types';
import type {FacetFilters} from 'algoliasearch/lite';
import type {AskAiConfig} from '@docusaurus/theme-search-algolia';
import type {DocSearchModalProps} from '@docsearch/react';

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

export function buildAskAiSearchParameters(
  askAi: AskAiConfig | undefined,
  contextualSearchFilters: FacetFilters | undefined,
): AskAiConfig | undefined {
  if (!askAi) {
    return undefined;
  }

  const indices = new Set([
    ...(askAi.indices ?? []),
    ...Object.keys(askAi.searchParameters ?? {}),
  ]);

  if (!indices.size) {
    return askAi;
  }

  const searchParameters = Object.fromEntries(
    [...indices].map((indexName) => {
      const params = askAi.searchParameters?.[indexName];
      return [
        indexName,
        {
          ...params,
          facetFilters: mergeFacetFilters(
            contextualSearchFilters,
            params?.facetFilters,
          ),
        },
      ];
    }),
  );

  return {...askAi, searchParameters};
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
