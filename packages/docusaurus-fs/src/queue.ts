/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PQueue from 'p-queue';

// Large sites can read/write a file for each of their thousands of docs/blog
// posts concurrently. We bound how many files we keep open at once to avoid
// EMFILE errors ("too many open files"): node:fs doesn't queue and retry
// operations failing with EMFILE like graceful-fs (used by fs-extra) does.
const DefaultFileOperationConcurrency = 100;

// Secret way to set the concurrency (see DOCUSAURUS_GIT_COMMAND_CONCURRENCY)
export function getFileOperationConcurrency(
  envValue: string | undefined = process.env.DOCUSAURUS_FS_CONCURRENCY,
): number {
  const concurrency = envValue ? parseInt(envValue, 10) : NaN;
  return concurrency > 0 ? concurrency : DefaultFileOperationConcurrency;
}

const FileOperationQueue = new PQueue({
  concurrency: getFileOperationConcurrency(),
});

/**
 * Runs a file system operation through the shared queue.
 * Only queue "leaf" operations: an operation waiting for another queued one
 * could wait for a free slot forever.
 */
export function queueFileOperation<T>(operation: () => Promise<T>): Promise<T> {
  return FileOperationQueue.add(operation);
}
