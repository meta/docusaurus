/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {workerData} from 'node:worker_threads';
import logger, {PerfLogger} from '@docusaurus/logger';
import {loadSSGRenderer, type SSGResult} from './ssgRenderer.js';
import type {SSGParams} from './ssgParams.js';

const workerId = process?.__tinypool_state__?.workerId;
if (!workerId) {
  throw new Error('SSG Worker Thread not executing in Tinypool context?');
}

const params: SSGParams = workerData?.[1]?.params;
if (!params) {
  throw new Error(`SSG Worker Thread workerData params missing`);
}

const WorkerLogPrefix = `SSG Worker ${logger.name(workerId)}`;

// The server bundle runs in the worker thread global context
// Web Storage should not be available during SSG, like it was before Node 25
// Reading it emits a warning on Node 25+ unless --localstorage-file is used
// Deleting it only affects this worker thread, not the main thread
Reflect.deleteProperty(globalThis, 'localStorage');
Reflect.deleteProperty(globalThis, 'sessionStorage');

// We only load once the SSG rendered (expensive), NOT once per worker task
// TODO check potential memory leak?
const appRendererPromise = PerfLogger.async(
  `${WorkerLogPrefix} - Initialization`,
  () =>
    loadSSGRenderer({
      params,
    }),
);

export type SSGWorkerThreadTask = {
  id: number;
  pathnames: string[];
};

export default async function executeSSGWorkerThreadTask(
  task: SSGWorkerThreadTask,
): Promise<SSGResult[]> {
  const appRenderer = await appRendererPromise;

  const ssgResults = await PerfLogger.async(
    `${WorkerLogPrefix} - Task ${logger.name(
      task.id,
    )} - Rendering ${logger.cyan(task.pathnames.length)} pathnames`,
    () => appRenderer.renderPathnames(task.pathnames),
  );

  return ssgResults;
}

export type ExecuteSSGWorkerThreadTask = typeof executeSSGWorkerThreadTask;
