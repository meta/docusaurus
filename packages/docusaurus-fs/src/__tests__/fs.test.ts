/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import nodeFs from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fs} from '../fs';

async function createTmpDir() {
  return nodeFs.mkdtempDisposable(
    path.join(await nodeFs.realpath(tmpdir()), 'docusaurus-fs-'),
  );
}

describe('fs', () => {
  it('forwards arguments and results to node:fs/promises', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'file.txt');
    using writeFile = vi.spyOn(nodeFs, 'writeFile');
    await fs.writeFile(filePath, 'content', {flag: 'wx'});
    expect(writeFile).toHaveBeenCalledExactlyOnceWith(filePath, 'content', {
      flag: 'wx',
    });
    await expect(fs.readFile(filePath, 'utf8')).resolves.toBe('content');
    await expect(fs.stat(filePath)).resolves.toMatchObject({size: 7});
  });

  it('bounds how many files are read concurrently', async () => {
    let running = 0;
    let maxRunning = 0;
    using _readFile = vi
      .spyOn(nodeFs, 'readFile')
      .mockImplementation(async () => {
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((resolve) => {
          setTimeout(resolve, 1);
        });
        running -= 1;
        return 'content';
      });
    await Promise.all(
      Array.from({length: 300}, (_, i) => fs.readFile(`file-${i}.txt`)),
    );
    expect(maxRunning).toBe(100);
  });

  it("doesn't queue operations that don't keep files open", async () => {
    await using dir = await createTmpDir();
    // Fill the queue with reads that never complete until we release them
    let release!: () => void;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    using _readFile = vi
      .spyOn(nodeFs, 'readFile')
      .mockImplementation(async () => {
        await released;
        return 'content';
      });
    const reads = Array.from({length: 200}, (_, i) =>
      fs.readFile(`file-${i}.txt`),
    );

    await expect(fs.stat(dir.path)).resolves.toBeDefined();
    await expect(fs.readdir(dir.path)).resolves.toEqual([]);

    release();
    await Promise.all(reads);
  });
});
