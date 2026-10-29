/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useCallback, useMemo, useState} from 'react';
import {version as docsearchVersion} from '@docsearch/react/version';
import translations from '@theme/SearchTranslations';
import {useAlgoliaContextualFacetFiltersIfEnabled} from './useAlgoliaContextualFacetFilters';
import {mergeFacetFilters} from './utils';
import type {AskAiConfig} from '@docusaurus/theme-search-algolia';
import type {
  DocSearchModalProps,
  DocSearchTranslations,
} from '@docsearch/react';
import type {FacetFilters} from 'algoliasearch/lite';

// The minimal props the hook needs from DocSearch v4 props
// TODO Docusaurus v4: cleanup after we drop support for DocSearch v3
interface DocSearchV4PropsLite {
  indexName: string;
  apiKey: string;
  appId: string;
  placeholder?: string;
  translations?: DocSearchTranslations;
  searchParameters?: DocSearchModalProps['searchParameters'];
  askAi?: AskAiConfig;
}

const isV4 = docsearchVersion.startsWith('4.');

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

// We need to apply contextualSearch facetFilters to AskAI filters
// This can't be done at config normalization time because contextual filters
// can only be determined at runtime
function applyAskAiContextualSearch(
  askAi: AskAiConfig | undefined,
  contextualSearchFilters: FacetFilters | undefined,
): AskAiConfig | undefined {
  if (!askAi) {
    return undefined;
  }
  if (!contextualSearchFilters) {
    return askAi;
  }
  const askAiFacetFilters = askAi.searchParameters?.facetFilters;
  return {
    ...askAi,
    searchParameters: {
      ...askAi.searchParameters,
      facetFilters: mergeFacetFilters(
        askAiFacetFilters,
        contextualSearchFilters,
      ),
    },
  };
}

export function useAlgoliaAskAi(props: DocSearchV4PropsLite): UseAskAiResult {
  const [isAskAiActive, setIsAskAiActive] = useState(false);
  const contextualSearchFilters = useAlgoliaContextualFacetFiltersIfEnabled();

  const askAi = useMemo(() => {
    return applyAskAiContextualSearch(props.askAi, contextualSearchFilters);
  }, [props.askAi, contextualSearchFilters]);

  const canHandleAskAi = Boolean(askAi);

  const currentPlaceholder =
    isAskAiActive && isV4
      ? translations.modal?.searchBox?.placeholderTextAskAi
      : translations.modal?.searchBox?.placeholderText || props?.placeholder;

  const onAskAiToggle = useCallback((askAiToggle: boolean) => {
    setIsAskAiActive(askAiToggle);
  }, []);

  const extraAskAiProps: UseAskAiResult['extraAskAiProps'] = {
    askAi: askAi as any,
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
