/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  facetFiltersToFilterString,
  mergeFacetFilters,
  mergeFilters,
} from '../client/utils';

describe('mergeFacetFilters', () => {
  it('merges [string,string]', () => {
    expect(mergeFacetFilters('f1', 'f2')).toEqual(['f1', 'f2']);
  });

  it('merges [string,array]', () => {
    // TODO this looks wrong to me, should be ['f1', ['f2', 'f3']] ?
    expect(mergeFacetFilters('f1', ['f2', 'f3'])).toEqual(['f1', 'f2', 'f3']);
  });

  it('merges [string,undefined]', () => {
    expect(mergeFacetFilters('f1', undefined)).toEqual('f1');
  });

  it('merges [undefined,string]', () => {
    expect(mergeFacetFilters(undefined, 'f1')).toEqual('f1');
  });

  it('merges [array,undefined]', () => {
    expect(mergeFacetFilters(['f1', 'f2'], undefined)).toEqual(['f1', 'f2']);
  });

  it('merges [undefined,array]', () => {
    expect(mergeFacetFilters(undefined, ['f1', 'f2'])).toEqual(['f1', 'f2']);
  });

  it('merges [array,array]', () => {
    expect(mergeFacetFilters(['f1'], ['f2'])).toEqual(['f1', 'f2']);

    // TODO this looks wrong to me, should be [['f1', 'f2'], ['f3', 'f4']] ?
    expect(mergeFacetFilters(['f1', 'f2'], ['f3', 'f4'])).toEqual([
      'f1',
      'f2',
      'f3',
      'f4',
    ]);
  });

  it('preserves nested OR groups', () => {
    expect(mergeFacetFilters([['f1', 'f2']], ['f3', ['f4', 'f5']])).toEqual([
      ['f1', 'f2'],
      'f3',
      ['f4', 'f5'],
    ]);
  });
});

describe('facetFiltersToFilterString', () => {
  it('converts a single filter to filters syntax', () => {
    expect(facetFiltersToFilterString('language:en')).toBe('language:"en"');
  });

  it('joins filters with AND', () => {
    expect(facetFiltersToFilterString(['language:en', 'version:current'])).toBe(
      'language:"en" AND version:"current"',
    );
  });

  it('groups nested filters with OR', () => {
    expect(
      facetFiltersToFilterString([
        ['language:en', 'language:fr'],
        'version:current',
      ]),
    ).toBe('(language:"en" OR language:"fr") AND version:"current"');
  });
});

describe('mergeFilters', () => {
  it('returns the added filter when no existing filter is configured', () => {
    expect(mergeFilters(undefined, 'version:current')).toBe('version:current');
  });

  it('groups and joins existing and added filters with AND', () => {
    expect(mergeFilters('language:en OR language:fr', 'version:current')).toBe(
      '(language:en OR language:fr) AND (version:current)',
    );
  });
});
