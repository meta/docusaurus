/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {uniq, duplicates} from '../jsUtils';

describe('duplicates', () => {
  it('gets duplicate values', () => {
    expect(duplicates(['a', 'b', 'c', 'd'])).toEqual([]);
    expect(duplicates(['a', 'b', 'b', 'b'])).toEqual(['b', 'b']);
    expect(duplicates(['c', 'b', 'b', 'c'])).toEqual(['b', 'c']);
    expect(duplicates([{a: 1}, {a: 1}, {a: 1}])).toEqual([]);
  });
  it('accepts custom comparator', () => {
    expect(duplicates([{a: 1}, {a: 1}, {a: 1}], (a, b) => a.a === b.a)).toEqual(
      [{a: 1}, {a: 1}],
    );
    expect(duplicates(['a', 'b', 'c', 'd'], (a, b) => a !== b)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });
});

describe('uniq', () => {
  it('remove duplicate primitives', () => {
    expect(uniq(['A', 'B', 'C', 'B', 'A', 'D'])).toEqual(['A', 'B', 'C', 'D']);
    expect(uniq([3, 3, 5, 1, 6, 3, 5])).toEqual([3, 5, 1, 6]);
    expect(uniq([null, undefined, 3, null, 4, 3])).toEqual([
      null,
      undefined,
      3,
      4,
    ]);
  });

  it('remove duplicate objects/arrays by identity', () => {
    const obj1 = {};
    const obj2 = {};
    const obj3 = {};
    const array1: unknown[] = [];
    const array2: unknown[] = [];
    const array3: unknown[] = [];
    expect(
      uniq([obj1, obj1, obj2, array1, obj2, array3, array2, array1, obj3]),
    ).toEqual([obj1, obj2, array1, array3, array2, obj3]);
  });
});
