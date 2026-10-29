/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {SnapshotSerializer} from 'vitest';

function getErrorName(error: Error): string {
  return error.name !== 'Error'
    ? error.name
    : (typeof error.constructor === 'function' && error.constructor.name) ||
        'Object';
}

function serializeCausalChain(e: Error): string {
  let error = e;
  let message = '';
  while ('cause' in error) {
    error = error.cause as Error;
    if (error instanceof Error) {
      message += `\nCause: [${getErrorName(error)}: ${error.message}]`;
    } else {
      if (typeof error === 'string') {
        message += `\nCause: [Error: ${error}]`;
      }
      break;
    }
  }
  return message;
}

// Because Vitest doesn't Snapshot Error.cause automatically
// see https://github.com/vitest-dev/vitest/issues/10339
const snapshotSerializer: SnapshotSerializer = {
  test: (val: unknown): boolean => {
    return !!((val as Error)?.cause && (val as Error)?.cause instanceof Error);
  },

  serialize(error: Error) {
    return `[${getErrorName(error)}: ${error.message}]${serializeCausalChain(error)}`;
  },
};

export default snapshotSerializer;
