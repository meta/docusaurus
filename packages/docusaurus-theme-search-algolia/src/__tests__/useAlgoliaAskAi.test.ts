/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {
  buildAskAiSearchParameters,
  useAlgoliaAskAi,
} from '../client/useAlgoliaAskAi';
import {useAlgoliaContextualFacetFiltersIfEnabled} from '../client/useAlgoliaContextualFacetFilters';
import type {DocSearchProps} from '../client/types';
import type {FacetFilters} from 'algoliasearch/lite';
import type {AskAiConfig} from '@docusaurus/theme-search-algolia';

vi.mock('@theme/SearchTranslations', () => ({
  default: {
    modal: {
      searchBox: {
        placeholderText: 'Search docs',
        placeholderTextAskAi: 'Ask AI',
      },
    },
  },
}));

vi.mock('../client/useAlgoliaContextualFacetFilters', () => ({
  useAlgoliaContextualFacetFiltersIfEnabled: vi.fn(),
}));

const contextualFacetFilters: FacetFilters = [
  'language:en',
  ['docusaurus_tag:default', 'docusaurus_tag:docs-default-current'],
];

describe('buildAskAiSearchParameters', () => {
  it('returns undefined without askAi config', () => {
    expect(
      buildAskAiSearchParameters(undefined, contextualFacetFilters),
    ).toBeUndefined();
  });

  it('keeps the config facetFilters without contextual facetFilters', () => {
    expect(
      buildAskAiSearchParameters(
        {
          agentId: 'agent',
          indices: ['index-1'],
          searchParameters: {'index-2': {facetFilters: ['type:content']}},
        },
        undefined,
      ),
    ).toEqual({
      agentId: 'agent',
      indices: ['index-1'],
      searchParameters: {
        'index-1': {},
        'index-2': {facetFilters: ['type:content']},
      },
    });
  });

  it('returns the askAi config as-is without indices', () => {
    const askAi: AskAiConfig = {agentId: 'agent'};
    expect(buildAskAiSearchParameters(askAi, contextualFacetFilters)).toBe(
      askAi,
    );
  });

  it('adds the contextual facetFilters to each index', () => {
    expect(
      buildAskAiSearchParameters(
        {agentId: 'agent', indices: ['index-1', 'index-2']},
        contextualFacetFilters,
      ),
    ).toEqual({
      agentId: 'agent',
      indices: ['index-1', 'index-2'],
      searchParameters: {
        'index-1': {facetFilters: contextualFacetFilters},
        'index-2': {facetFilters: contextualFacetFilters},
      },
    });
  });

  it('adds the indices only declared in searchParameters', () => {
    expect(
      buildAskAiSearchParameters(
        {
          agentId: 'agent',
          indices: ['index-1'],
          searchParameters: {'index-2': {distinct: false}},
        },
        contextualFacetFilters,
      ),
    ).toEqual({
      agentId: 'agent',
      indices: ['index-1'],
      searchParameters: {
        'index-1': {facetFilters: contextualFacetFilters},
        'index-2': {distinct: false, facetFilters: contextualFacetFilters},
      },
    });
  });

  it('merges the contextual and config facetFilters', () => {
    expect(
      buildAskAiSearchParameters(
        {
          agentId: 'agent',
          searchParameters: {'index-1': {facetFilters: ['type:content']}},
        },
        contextualFacetFilters,
      ),
    ).toEqual({
      agentId: 'agent',
      searchParameters: {
        'index-1': {
          facetFilters: [...contextualFacetFilters, 'type:content'],
        },
      },
    });
  });

  it('keeps the config filters', () => {
    expect(
      buildAskAiSearchParameters(
        {
          agentId: 'agent',
          searchParameters: {'index-1': {filters: 'version:1'}},
        },
        contextualFacetFilters,
      ),
    ).toEqual({
      agentId: 'agent',
      searchParameters: {
        'index-1': {filters: 'version:1', facetFilters: contextualFacetFilters},
      },
    });
  });

  it('does not mutate the askAi config', () => {
    const askAi: AskAiConfig = {
      agentId: 'agent',
      searchParameters: {'index-1': {facetFilters: ['type:content']}},
    };
    buildAskAiSearchParameters(askAi, contextualFacetFilters);
    expect(askAi).toEqual({
      agentId: 'agent',
      searchParameters: {'index-1': {facetFilters: ['type:content']}},
    });
  });
});

describe('useAlgoliaAskAi', () => {
  afterEach(() => {
    vi.mocked(useAlgoliaContextualFacetFiltersIfEnabled).mockReset();
  });

  function renderUseAlgoliaAskAi(props: Partial<DocSearchProps>) {
    return renderHook(() =>
      useAlgoliaAskAi({
        appId: 'APP_ID',
        apiKey: 'API_KEY',
        searchPagePath: false,
        indices: [],
        ...props,
      }),
    );
  }

  it('cannot handle Ask AI without askAi config', () => {
    const {result} = renderUseAlgoliaAskAi({});
    expect(result.current.canHandleAskAi).toBe(false);
    expect(result.current.askAi).toBeUndefined();
    expect(result.current.extraAskAiProps.canHandleAskAi).toBe(false);
  });

  it('handles Ask AI without contextual facetFilters', () => {
    const {result} = renderUseAlgoliaAskAi({
      askAi: {agentId: 'agent', indices: ['index-1']},
    });
    expect(result.current.canHandleAskAi).toBe(true);
    expect(result.current.askAi).toEqual({
      agentId: 'agent',
      indices: ['index-1'],
      searchParameters: {'index-1': {}},
    });
  });

  it('handles Ask AI with the contextual facetFilters', () => {
    vi.mocked(useAlgoliaContextualFacetFiltersIfEnabled).mockReturnValue(
      contextualFacetFilters,
    );
    const {result} = renderUseAlgoliaAskAi({
      askAi: {agentId: 'agent', indices: ['index-1']},
    });

    const expectedAskAi = {
      agentId: 'agent',
      indices: ['index-1'],
      searchParameters: {'index-1': {facetFilters: contextualFacetFilters}},
    };
    expect(result.current.canHandleAskAi).toBe(true);
    expect(result.current.askAi).toEqual(expectedAskAi);
    expect(result.current.extraAskAiProps).toEqual({
      askAi: expectedAskAi,
      canHandleAskAi: true,
      isAskAiActive: false,
      onAskAiToggle: result.current.onAskAiToggle,
    });
  });

  it('toggles Ask AI and its placeholder', () => {
    const {result} = renderUseAlgoliaAskAi({
      askAi: {agentId: 'agent'},
    });
    expect(result.current.isAskAiActive).toBe(false);
    expect(result.current.currentPlaceholder).toBe('Search docs');

    act(() => result.current.onAskAiToggle(true));
    expect(result.current.isAskAiActive).toBe(true);
    expect(result.current.extraAskAiProps.isAskAiActive).toBe(true);
    expect(result.current.currentPlaceholder).toBe('Ask AI');

    act(() => result.current.onAskAiToggle(false));
    expect(result.current.isAskAiActive).toBe(false);
    expect(result.current.currentPlaceholder).toBe('Search docs');
  });
});
