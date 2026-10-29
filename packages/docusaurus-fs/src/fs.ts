/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import nodeFs from 'node:fs/promises';
import {queueFileOperation} from './queue';

type NodeFs = typeof nodeFs;
type AsyncFunction = (...args: unknown[]) => Promise<unknown>;

// We call Node APIs through the default-imported module object at call time
// (instead of destructured named imports) so that tests can intercept them
// with vi.spyOn(fs, 'writeFile') on node:fs/promises

function direct<Name extends keyof NodeFs>(name: Name): NodeFs[Name] {
  const operation = (...args: unknown[]) =>
    (nodeFs[name] as AsyncFunction)(...args);
  return operation as unknown as NodeFs[Name];
}

function queued<Name extends keyof NodeFs>(name: Name): NodeFs[Name] {
  const operation = (...args: unknown[]) =>
    queueFileOperation(() => (nodeFs[name] as AsyncFunction)(...args));
  return operation as unknown as NodeFs[Name];
}

/**
 * The subset of `node:fs/promises` that Docusaurus uses: always use it instead
 * of `node:fs`, so that all our file system operations go through this package.
 *
 * Operations keeping a file open across async steps (`readFile()`,
 * `writeFile()`) go through a shared queue, bounding how many files are open
 * at the same time. The others are only a single system call each, so they
 * don't need it.
 *
 * Add more `node:fs/promises` APIs when needed. Use `queued()` for those
 * keeping a file open.
 */
export const fs = {
  readFile: queued('readFile'),
  writeFile: queued('writeFile'),

  access: direct('access'),
  cp: direct('cp'),
  lstat: direct('lstat'),
  mkdir: direct('mkdir'),
  mkdtemp: direct('mkdtemp'),
  readdir: direct('readdir'),
  realpath: direct('realpath'),
  rename: direct('rename'),
  rm: direct('rm'),
  stat: direct('stat'),

  constants: nodeFs.constants,
};
