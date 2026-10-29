/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {isRegexpStringMatch} from '../regexpUtils';

describe('isRegexpStringMatch', () => {
  it('works', () => {
    expect(isRegexpStringMatch(undefined, 'foo')).toBe(false);
    expect(isRegexpStringMatch('bar', undefined)).toBe(false);
    expect(isRegexpStringMatch('foo', 'bar')).toBe(false);
    expect(isRegexpStringMatch('foo', 'foo')).toBe(true);
    // cSpell:ignore fooooooooooo
    expect(isRegexpStringMatch('fooooooooooo', 'foo')).toBe(false);
    expect(isRegexpStringMatch('foo', 'fooooooooooo')).toBe(true);
    expect(isRegexpStringMatch('f.*o', 'fooooooooooo')).toBe(true);
    expect(isRegexpStringMatch('FOO', 'foo')).toBe(true);
  });
});
