/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import _ from 'lodash';
import {mapAsyncSequential, findAsyncSequential} from '../jsUtils';

describe('mapAsyncSequential', () => {
  function sleep(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  it('maps sequentially', async () => {
    const itemToTimeout: {[key: string]: number} = {
      '1': 200,
      '2': 600,
      '3': 400,
    };
    const items = Object.keys(itemToTimeout);

    const itemMapStartsAt: {[key: string]: number} = {};
    const itemMapEndsAt: {[key: string]: number} = {};

    const timeBefore = Date.now();
    await expect(
      mapAsyncSequential(items, async (item) => {
        const itemTimeout = itemToTimeout[item]!;
        itemMapStartsAt[item] = Date.now();
        await sleep(itemTimeout);
        itemMapEndsAt[item] = Date.now();
        return `${item} mapped`;
      }),
    ).resolves.toEqual(['1 mapped', '2 mapped', '3 mapped']);
    const timeAfter = Date.now();

    const timeTotal = timeAfter - timeBefore;

    const totalTimeouts = _.sum(Object.values(itemToTimeout));
    expect(timeTotal).toBeGreaterThanOrEqual(totalTimeouts - 100);

    expect(itemMapStartsAt[1]).toBeGreaterThanOrEqual(0);
    expect(itemMapStartsAt[2]).toBeGreaterThanOrEqual(itemMapEndsAt[1]! - 100);
    expect(itemMapStartsAt['3']).toBeGreaterThanOrEqual(
      itemMapEndsAt[2]! - 100,
    );
  });
});

describe('findAsyncSequential', () => {
  function sleep(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  it('finds sequentially', async () => {
    const items = ['1', '2', '3'];

    const findFn = vi.fn(async (item: string) => {
      await sleep(400);
      return item === '2';
    });

    const timeBefore = Date.now();
    await expect(findAsyncSequential(items, findFn)).resolves.toBe('2');
    const timeAfter = Date.now();

    expect(findFn).toHaveBeenCalledTimes(2);
    expect(findFn).toHaveBeenNthCalledWith(1, '1');
    expect(findFn).toHaveBeenNthCalledWith(2, '2');

    const timeTotal = timeAfter - timeBefore;
    expect(timeTotal).toBeGreaterThanOrEqual(600);
    expect(timeTotal).toBeLessThan(1000);
  });
});
