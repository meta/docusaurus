/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {isTranslatableSourceFile} from '../translationUtils';

describe('isTranslatableSourceFile', () => {
  it('works', () => {
    expect(isTranslatableSourceFile('./xyz.ts')).toBe(true);
    expect(isTranslatableSourceFile('./xyz.tsx')).toBe(true);
    expect(isTranslatableSourceFile('./xyz.js')).toBe(true);
    expect(isTranslatableSourceFile('./xyz.jsx')).toBe(true);

    expect(isTranslatableSourceFile('./xyz.md')).toBe(false);
    expect(isTranslatableSourceFile('./xyz.mdx')).toBe(false);
    expect(isTranslatableSourceFile('./xyz.d.ts')).toBe(false);
  });
});
