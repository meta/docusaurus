/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import os from 'node:os';
import _ from 'lodash';
import logger, {PerfLogger} from '@docusaurus/logger';
import {createSSGParams} from './ssgParams';
import {renderHashRouterTemplate} from './ssgTemplate';
import {
  SSGWorkerThreadCount,
  SSGWorkerThreadRecyclerMaxMemory,
  SSGWorkerThreadTaskSize,
} from './ssgEnv';
import {generateHashRouterEntrypoint} from './ssgUtils';
import {createGlobalSSGResult} from './ssgGlobalResult';
import type {SSGGlobalResult} from './ssgGlobalResult';
import type {SSGParams} from './ssgParams';
import type {Props, RouterType} from '@docusaurus/types';
import type {SiteCollectedData} from '../common';
import type {ExecuteSSGWorkerThreadTask} from './ssgWorkerThread';

type SSGExecutor = {
  run: () => Promise<SSGGlobalResult>;
  destroy: () => Promise<void>;
};

// Sensible default that gives decent performances
// It's hard to have a perfect formula that works for all hosts
// Each thread has some creation overhead
// Having 1 thread per cpu doesn't necessarily improve perf on small sites
// We want to ensure that we don't create a worker thread for less than x paths
function inferNumberOfThreads({
  pageCount,
  cpuCount,
  minPagesPerCpu,
}: {
  pageCount: number;
  cpuCount: number;
  minPagesPerCpu: number;
}) {
  // Calculate "ideal" amount of threads based on the number of pages to render
  const threadsByWorkload = Math.ceil(pageCount / minPagesPerCpu);
  // Use the smallest of threadsByWorkload or cpuCount, ensuring min=1 thread
  return Math.max(1, Math.min(threadsByWorkload, cpuCount));
}

function getNumberOfThreads(pathnames: string[]) {
  if (typeof SSGWorkerThreadCount !== 'undefined') {
    return SSGWorkerThreadCount;
  }

  // See also https://github.com/tinylibs/tinypool/pull/108
  const cpuCount = os.availableParallelism();

  return inferNumberOfThreads({
    pageCount: pathnames.length,
    cpuCount,
    // These are "magic value" that we should refine based on user feedback
    // Local tests show that it's not worth spawning new workers for few pages
    minPagesPerCpu: 100,
  });
}

// Workaround for Node styleText() limitation
// See https://github.com/nodejs/node/issues/65766
function getWorkerColorEnv(): Record<string, string> {
  // Preserve an explicit user choice
  if (process.env.FORCE_COLOR !== undefined) {
    return {};
  }

  const depth = process.stdout.isTTY
    ? (process.stdout.getColorDepth?.() ?? 0)
    : 0;
  if (depth > 2) {
    return {FORCE_COLOR: depth >= 24 ? '3' : depth >= 8 ? '2' : '1'};
  }

  return {};
}

// SSG always runs in worker threads, even for small sites
// This isolates the server bundle execution from the main Docusaurus process
async function createSSGExecutor({
  params,
  pathnames,
}: {
  params: SSGParams;
  pathnames: string[];
}): Promise<SSGExecutor> {
  const numberOfThreads = getNumberOfThreads(pathnames);

  const pool = await PerfLogger.async(
    `Create SSG thread pool - ${logger.cyan(numberOfThreads)} threads`,
    async () => {
      const Tinypool = await import('tinypool').then((m) => m.default);

      const workerURL = pathToFileURL(
        path.resolve(__dirname, 'ssgWorkerThread.js'),
      );

      return new Tinypool({
        filename: workerURL.pathname,
        minThreads: numberOfThreads,
        maxThreads: numberOfThreads,
        concurrentTasksPerWorker: 1,
        runtime: 'worker_threads',
        isolateWorkers: false,
        workerData: {params},
        env: {
          // Cast is safe
          // See https://github.com/tinylibs/tinypool/issues/136
          ...(process.env as Record<string, string>),
          ...getWorkerColorEnv(),
        },

        // WORKER MEMORY MANAGEMENT
        // Allows containing SSG memory leaks with a thread recycling workaround
        // See https://github.com/facebook/docusaurus/pull/11166
        // See https://github.com/facebook/docusaurus/issues/11161
        maxMemoryLimitBeforeRecycle: SSGWorkerThreadRecyclerMaxMemory,
        resourceLimits: {
          // For some reason I can't figure out how to limit memory on a worker
          // See https://x.com/sebastienlorber/status/1920781195618513143
        },
      });
    },
  );

  const pathnamesChunks = _.chunk(pathnames, SSGWorkerThreadTaskSize);

  // Tiny wrapper for type-safety
  const submitTask: ExecuteSSGWorkerThreadTask = async (task) => {
    const result = await pool.run(task);
    // Note, we don't use PerfLogger.async() because all tasks are submitted
    // immediately at once and queued, while results are received progressively
    PerfLogger.log(`Result for task ${logger.name(task.id)}`);
    return result;
  };

  return {
    run: async () => {
      const results = await PerfLogger.async(`Thread pool`, async () => {
        return Promise.all(
          pathnamesChunks.map((taskPathnames, taskIndex) => {
            return submitTask({
              id: taskIndex + 1,
              pathnames: taskPathnames,
            });
          }),
        );
      });
      const allResults = results.flat();
      return createGlobalSSGResult(allResults);
    },

    destroy: async () => {
      await pool.destroy();
    },
  };
}

export async function executeSSG({
  props,
  serverBundlePath,
  clientManifestPath,
  router,
}: {
  props: Props;
  serverBundlePath: string;
  clientManifestPath: string;
  router: RouterType;
}): Promise<{collectedData: SiteCollectedData}> {
  const params = await createSSGParams({
    serverBundlePath,
    clientManifestPath,
    props,
  });

  // TODO doesn't look like the appropriate place for hash router entry
  if (router === 'hash') {
    PerfLogger.start('Generate Hash Router entry point');
    const content = await renderHashRouterTemplate({params});
    await generateHashRouterEntrypoint({content, params});
    PerfLogger.end('Generate Hash Router entry point');
    return {collectedData: {}};
  }

  const executor = await createSSGExecutor({
    params,
    pathnames: props.routesPaths,
  });
  const result = await executor.run();
  await executor.destroy();
  return result;
}
