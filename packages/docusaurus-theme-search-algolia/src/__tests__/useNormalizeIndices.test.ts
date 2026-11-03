/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {
  normalizeIndex,
  useNormalizeIndices,
} from '../client/useNormalizeIndices';
import type {DocSearchProps} from '../client/types';
import type {FacetFilters} from 'algoliasearch/lite';

const contextualFacetFilters: FacetFilters = [
  'language:en',
  ['docusaurus_tag:default', 'docusaurus_tag:docs-default-current'],
];

vi.mock('../client/useAlgoliaContextualFacetFilters', () => ({
  useAlgoliaContextualFacetFilters: () => contextualFacetFilters,
}));

describe('useNormalizeIndices', () => {
  function renderUseNormalizeIndices(props: Partial<DocSearchProps>) {
    return renderHook(() =>
      useNormalizeIndices({
        appId: 'APP_ID',
        apiKey: 'API_KEY',
        searchPagePath: false,
        indices: [],
        ...props,
      }),
    ).result.current;
  }

  it('normalizes the indices with the contextual facetFilters', () => {
    expect(
      renderUseNormalizeIndices({
        contextualSearch: 'true',
        indices: [
          'index-1',
          {name: 'index-2', searchParameters: {facetFilters: ['type:content']}},
        ],
      }),
    ).toEqual([
      {
        name: 'index-1',
        searchParameters: {facetFilters: contextualFacetFilters},
      },
      {
        name: 'index-2',
        searchParameters: {
          facetFilters: [...contextualFacetFilters, 'type:content'],
        },
      },
    ]);
  });

  it('normalizes the indices without the contextual facetFilters', () => {
    expect(
      renderUseNormalizeIndices({
        indices: [
          'index-1',
          {name: 'index-2', searchParameters: {facetFilters: ['type:content']}},
        ],
      }),
    ).toEqual([
      {name: 'index-1', searchParameters: {facetFilters: []}},
      {name: 'index-2', searchParameters: {facetFilters: ['type:content']}},
    ]);
  });
});

describe('normalizeIndex', () => {
  describe('without contextual search', () => {
    const normalize = normalizeIndex(contextualFacetFilters);

    it('normalizes an index name string', () => {
      expect(normalize('my-index')).toEqual({
        name: 'my-index',
        searchParameters: {facetFilters: []},
      });
    });

    it('normalizes an index object without search parameters', () => {
      expect(normalize({name: 'my-index'})).toEqual({
        name: 'my-index',
        searchParameters: {facetFilters: []},
      });
    });

    it('keeps the config facetFilters', () => {
      expect(
        normalize({
          name: 'my-index',
          searchParameters: {facetFilters: ['type:content']},
        }),
      ).toEqual({
        name: 'my-index',
        searchParameters: {facetFilters: ['type:content']},
      });
    });

    it('keeps the other config search parameters', () => {
      expect(
        normalize({
          name: 'my-index',
          searchParameters: {hitsPerPage: 5, filters: 'type:content'},
        }),
      ).toEqual({
        name: 'my-index',
        searchParameters: {
          hitsPerPage: 5,
          filters: 'type:content',
          facetFilters: [],
        },
      });
    });
  });

  describe('with contextual search', () => {
    const normalize = normalizeIndex(contextualFacetFilters, 'true');

    it('uses the contextual facetFilters for an index name string', () => {
      expect(normalize('my-index')).toEqual({
        name: 'my-index',
        searchParameters: {facetFilters: contextualFacetFilters},
      });
    });

    it('merges the contextual and config facetFilters', () => {
      expect(
        normalize({
          name: 'my-index',
          searchParameters: {facetFilters: ['type:content']},
        }),
      ).toEqual({
        name: 'my-index',
        searchParameters: {
          facetFilters: [...contextualFacetFilters, 'type:content'],
        },
      });
    });

    it('merges the contextual and config string facetFilters', () => {
      expect(
        normalize({
          name: 'my-index',
          searchParameters: {facetFilters: 'type:content'},
        }),
      ).toEqual({
        name: 'my-index',
        searchParameters: {
          facetFilters: [...contextualFacetFilters, 'type:content'],
        },
      });
    });

    it('keeps the other config search parameters', () => {
      expect(
        normalize({
          name: 'my-index',
          searchParameters: {hitsPerPage: 5},
        }),
      ).toEqual({
        name: 'my-index',
        searchParameters: {
          hitsPerPage: 5,
          facetFilters: contextualFacetFilters,
        },
      });
    });
  });

  it('ignores contextual facetFilters when contextual search is an empty string', () => {
    const normalize = normalizeIndex(contextualFacetFilters, '');
    expect(normalize('my-index')).toEqual({
      name: 'my-index',
      searchParameters: {facetFilters: []},
    });
  });

  it('normalizes multiple indices', () => {
    const indices = ['index-1', {name: 'index-2'}];
    expect(indices.map(normalizeIndex(contextualFacetFilters, 'true'))).toEqual(
      [
        {
          name: 'index-1',
          searchParameters: {facetFilters: contextualFacetFilters},
        },
        {
          name: 'index-2',
          searchParameters: {facetFilters: contextualFacetFilters},
        },
      ],
    );
  });
});
