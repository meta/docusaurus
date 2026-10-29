/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useFilteredAndTreeifiedTOC} from '../tocUtils';
import type {TOCItem} from '@docusaurus/mdx-loader';

const mockTOC: TOCItem[] = [
  {
    id: 'bravo',
    level: 2,
    value: 'Bravo',
  },
  {
    id: 'charlie',
    level: 3,
    value: 'Charlie',
  },
  {
    id: 'delta',
    level: 4,
    value: 'Delta',
  },
  {
    id: 'echo',
    level: 5,
    value: 'Echo',
  },
  {
    id: 'foxtrot',
    level: 6,
    value: 'Foxtrot',
  },
];

describe('useFilteredAndTreeifiedTOC', () => {
  it('filters a toc with all heading levels', () => {
    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc: mockTOC,
          minHeadingLevel: 2,
          maxHeadingLevel: 2,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc: mockTOC,
          minHeadingLevel: 3,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc: mockTOC,
          minHeadingLevel: 2,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [
          {
            id: 'charlie',
            level: 3,
            value: 'Charlie',
            children: [],
          },
        ],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc: mockTOC,
          minHeadingLevel: 2,
          maxHeadingLevel: 4,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [
          {
            id: 'charlie',
            level: 3,
            value: 'Charlie',
            children: [
              {
                id: 'delta',
                level: 4,
                value: 'Delta',
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  // It's not 100% clear exactly how the TOC should behave under weird heading
  // levels provided by the user. Adding a test so that behavior stays the same
  // over time
  it('filters invalid heading levels (but possible) TOC', () => {
    const toc: TOCItem[] = [
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
      },
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
      },
      {
        id: 'delta',
        level: 4,
        value: 'Delta',
      },
    ];

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 2,
          maxHeadingLevel: 2,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 3,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 4,
          maxHeadingLevel: 4,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'delta',
        level: 4,
        value: 'Delta',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 2,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 3,
          maxHeadingLevel: 4,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
      {
        id: 'delta',
        level: 4,
        value: 'Delta',
        children: [],
      },
    ]);
  });
});
