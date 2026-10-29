/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useMemo} from 'react';
import type {TOCItem} from '@docusaurus/mdx-loader';

export type TOCTreeNode = {
  readonly value: string;
  readonly id: string;
  readonly level: number;
  readonly children: readonly TOCTreeNode[];
};

function treeifyTOC(flatTOC: readonly TOCItem[]): TOCTreeNode[] {
  const headings = flatTOC.map((heading) => ({
    ...heading,
    parentIndex: -1,
    children: [] as TOCTreeNode[],
  }));

  // Keep track of which previous index would be the current heading's direct
  // parent. Each entry <i> is the last index of the `headings` array at heading
  // level <i>. We will modify these indices as we iterate through all headings.
  // e.g. if an ### H3 was last seen at index 2, then prevIndexForLevel[3] === 2
  // indices 0 and 1 will remain unused.
  const prevIndexForLevel = Array<number>(7).fill(-1);

  headings.forEach((curr, currIndex) => {
    // Take the last seen index for each ancestor level. the highest index will
    // be the direct ancestor of the current heading.
    const ancestorLevelIndexes = prevIndexForLevel.slice(2, curr.level);
    curr.parentIndex = Math.max(...ancestorLevelIndexes);
    // Mark that curr.level was last seen at the current index.
    prevIndexForLevel[curr.level] = currIndex;
  });

  const rootNodes: TOCTreeNode[] = [];

  // For a given parentIndex, add each Node into that parent's `children` array
  headings.forEach((heading) => {
    const {parentIndex, ...rest} = heading;
    if (parentIndex >= 0) {
      headings[parentIndex]!.children.push(rest);
    } else {
      rootNodes.push(rest);
    }
  });
  return rootNodes;
}

function filterTOC({
  toc,
  minHeadingLevel,
  maxHeadingLevel,
}: {
  toc: readonly TOCTreeNode[];
  minHeadingLevel: number;
  maxHeadingLevel: number;
}): TOCTreeNode[] {
  function isValid(item: TOCTreeNode) {
    return item.level >= minHeadingLevel && item.level <= maxHeadingLevel;
  }

  return toc.flatMap((item) => {
    const filteredChildren = filterTOC({
      toc: item.children,
      minHeadingLevel,
      maxHeadingLevel,
    });
    if (isValid(item)) {
      return [
        {
          ...item,
          children: filteredChildren,
        },
      ];
    }
    return filteredChildren;
  });
}

/**
 * Takes a flat TOC list (from the MDX loader) and treeifies it into what the
 * TOC components expect, applying the `minHeadingLevel` and `maxHeadingLevel`.
 * Memoized for performance.
 *
 * **Important**: this is not the same as `treeifyTOC(toc.filter(...))`,
 * because we have to filter the TOC after it has been treeified. This is mostly
 * to ensure that weird TOC structures preserve their semantics. For example, an
 * h3-h2-h4 sequence should not be treeified as an "h3 > h4" hierarchy with
 * min=3, max=4, but should rather be "[h3, h4]" (since the h2 heading has split
 * the two headings and they are not parent-children)
 */
export function useFilteredAndTreeifiedTOC({
  toc,
  minHeadingLevel,
  maxHeadingLevel,
}: {
  toc: readonly TOCItem[];
  minHeadingLevel: number;
  maxHeadingLevel: number;
}): readonly TOCTreeNode[] {
  return useMemo(
    () => filterTOC({toc: treeifyTOC(toc), minHeadingLevel, maxHeadingLevel}),
    [toc, minHeadingLevel, maxHeadingLevel],
  );
}
