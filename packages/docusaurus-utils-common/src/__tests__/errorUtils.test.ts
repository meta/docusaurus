/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getErrorCausalChain} from '../errorUtils';

describe('getErrorCausalChain', () => {
  it('works for simple error', () => {
    const error = new Error('msg');
    expect(getErrorCausalChain(error)).toEqual([error]);
  });

  it('works for nested errors', () => {
    const error = new Error('msg', {
      cause: new Error('msg', {cause: new Error('msg')}),
    });
    expect(getErrorCausalChain(error)).toEqual([
      error,
      error.cause,
      (error.cause as Error).cause,
    ]);
  });
});
