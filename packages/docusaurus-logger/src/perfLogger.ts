/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {AsyncLocalStorage} from 'node:async_hooks';
import {type PerformanceMark} from 'node:perf_hooks';
import logger from './logger';

// For now this is a private env variable we use internally
// But we'll want to expose this feature officially some day
const PerfDebuggingEnabled: boolean =
  process.env.DOCUSAURUS_PERF_LOGGER === 'true';

const Thresholds = {
  min: 5,
  yellow: 100,
  red: 1000,
};

const PerfPrefix = logger.yellow(`[PERF]`);

// This is what enables to "see the parent stack" for each log
// Parent1 > Parent2 > Parent3 > child trace
const ParentPrefix = new AsyncLocalStorage<string>();
function applyParentPrefix(label: string) {
  const parentPrefix = ParentPrefix.getStore();
  return parentPrefix ? `${parentPrefix} > ${label}` : label;
}

type PerfLoggerAPI = {
  start: (label: string) => void;
  end: (label: string) => void;
  log: (message: string) => void;
  async: <Result>(
    label: string,
    asyncFn: () => Result | Promise<Result>,
  ) => Promise<Result>;
};

type Memory = {
  before: NodeJS.MemoryUsage;
  after: NodeJS.MemoryUsage;
};

function getMemory(): NodeJS.MemoryUsage {
  // Before reading memory stats, we explicitly call the GC
  // Note: this only works when Node.js option "--expose-gc" is provided
  globalThis.gc?.();

  return process.memoryUsage();
}

function createPerfLogger(): PerfLoggerAPI {
  if (!PerfDebuggingEnabled) {
    const noop = () => {};
    return {
      start: noop,
      end: noop,
      log: noop,
      async: async (_label, asyncFn) => asyncFn(),
    };
  }

  const formatDuration = (duration: number): string => {
    if (duration > Thresholds.red) {
      return logger.red(`${(duration / 1000).toFixed(2)} seconds!`);
    } else if (duration > Thresholds.yellow) {
      return logger.yellow(`${duration.toFixed(2)} ms`);
    } else {
      return logger.green(`${duration.toFixed(2)} ms`);
    }
  };

  const formatBytesToMb = (bytes: number) =>
    logger.cyan(`${(bytes / 1024 / 1024).toFixed(0)}mb`);

  const formatMemoryDelta = (memory: Memory): string => {
    return logger.dim(
      `(Heap ${formatBytesToMb(memory.before.heapUsed)} -> ${formatBytesToMb(
        memory.after.heapUsed,
      )} / Total ${formatBytesToMb(memory.after.heapTotal)})`,
    );
  };

  const formatMemoryCurrent = (): string => {
    const memory = getMemory();
    return logger.dim(
      `(Heap ${formatBytesToMb(memory.heapUsed)} / Total ${formatBytesToMb(
        memory.heapTotal,
      )})`,
    );
  };

  const formatStatus = (error: Error | undefined): string => {
    return error ? logger.red('[KO]') : ''; // logger.green('[OK]');
  };

  const printPerfLog = ({
    label,
    duration,
    memory,
    error,
  }: {
    label: string;
    duration: number;
    memory: Memory;
    error: Error | undefined;
  }) => {
    if (duration < Thresholds.min) {
      return;
    }
    console.log(
      `${PerfPrefix}${formatStatus(error)} ${label} - ${formatDuration(
        duration,
      )} - ${formatMemoryDelta(memory)}`,
    );
  };

  const start: PerfLoggerAPI['start'] = (label) =>
    performance.mark(label, {
      detail: {
        memoryUsage: getMemory(),
      },
    });

  const readMark = (label: string) => {
    const startMark = performance.getEntriesByName(
      label,
      'mark',
    )?.[0] as PerformanceMark;
    if (!startMark) {
      throw new Error(`No performance start mark for label=${label}`);
    }
    performance.clearMarks(label);
    return startMark;
  };

  const end: PerfLoggerAPI['end'] = (label) => {
    const startMark = readMark(label);
    const duration = performance.now() - startMark.startTime;
    const {
      detail: {memoryUsage},
    } = startMark;
    printPerfLog({
      label: applyParentPrefix(label),
      duration,
      memory: {
        before: memoryUsage,
        after: getMemory(),
      },
      error: undefined,
    });
  };

  const log: PerfLoggerAPI['log'] = (label: string) =>
    console.log(
      `${PerfPrefix} ${applyParentPrefix(label)} - ${formatMemoryCurrent()}`,
    );

  const async: PerfLoggerAPI['async'] = async (label, asyncFn) => {
    const finalLabel = applyParentPrefix(label);
    const before = performance.now();
    const memoryBefore = getMemory();

    const asyncEnd = ({error}: {error: Error | undefined}) => {
      const memoryAfter = getMemory();
      const duration = performance.now() - before;
      printPerfLog({
        error,
        label: finalLabel,
        duration,
        memory: {
          before: memoryBefore,
          after: memoryAfter,
        },
      });
    };

    try {
      const result = await ParentPrefix.run(finalLabel, () => asyncFn());
      asyncEnd({error: undefined});
      return result;
    } catch (e) {
      asyncEnd({error: e as Error});
      throw e;
    }
  };

  return {
    start,
    end,
    log,
    async,
  };
}

export const PerfLogger: PerfLoggerAPI = createPerfLogger();
