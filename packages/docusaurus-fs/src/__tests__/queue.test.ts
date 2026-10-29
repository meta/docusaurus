/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getFileOperationConcurrency, queueFileOperation} from '../queue';

describe('queueFileOperation', () => {
  it('bounds the number of concurrent operations', async () => {
    let running = 0;
    let maxRunning = 0;
    const results = await Promise.all(
      Array.from({length: 500}, (_, i) =>
        queueFileOperation(async () => {
          running += 1;
          maxRunning = Math.max(maxRunning, running);
          await new Promise((resolve) => {
            setTimeout(resolve, 1);
          });
          running -= 1;
          return i;
        }),
      ),
    );
    expect(results).toEqual(Array.from({length: 500}, (_, i) => i));
    expect(maxRunning).toBe(100);
  });

  it('propagates errors', async () => {
    await expect(
      queueFileOperation(() => Promise.reject(new Error('Some error'))),
    ).rejects.toThrow('Some error');
  });
});

describe('getFileOperationConcurrency', () => {
  it('defaults to 100', () => {
    expect(getFileOperationConcurrency(undefined)).toBe(100);
    expect(getFileOperationConcurrency('')).toBe(100);
  });

  it('reads a positive integer', () => {
    expect(getFileOperationConcurrency('10')).toBe(10);
  });

  it('ignores invalid values', () => {
    expect(getFileOperationConcurrency('0')).toBe(100);
    expect(getFileOperationConcurrency('-5')).toBe(100);
    expect(getFileOperationConcurrency('abc')).toBe(100);
  });
});
