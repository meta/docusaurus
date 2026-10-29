/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {validateRedirect} from '../redirectValidation';

describe('validateRedirect', () => {
  it('validate good redirects without throwing', () => {
    expect(() => {
      validateRedirect({
        from: '/fromSomePath',
        to: '/toSomePath',
      });
      validateRedirect({
        from: '/from/Some/Path',
        to: '/toSomePath',
      });
      validateRedirect({
        from: '/fromSomePath',
        to: '/toSomePath',
      });
      validateRedirect({
        from: '/fromSomePath',
        to: '/to/Some/Path',
      });
      validateRedirect({
        from: '/fromSomePath',
        to: '/toSomePath?a=1',
      });
      validateRedirect({
        from: '/fromSomePath',
        to: '/toSomePath#anchor',
      });
      validateRedirect({
        from: '/fromSomePath',
        to: '/toSomePath?a=1&b=2#anchor',
      });
    }).not.toThrow();
  });

  it('throw for bad redirects', () => {
    expect(() =>
      validateRedirect({
        from: 'https://fb.com/fromSomePath',
        to: '/toSomePath',
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      validateRedirect({
        from: '/fromSomePath?a=1',
        to: '/toSomePath',
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      validateRedirect({
        from: '/fromSomePath#anchor',
        to: '/toSomePath',
      }),
    ).toThrowErrorMatchingSnapshot();
  });
});
