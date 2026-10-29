/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getDocsVersionSearchTag} from './docsSearch';

describe('getDocsVersionSearchTag', () => {
  it('works', () => {
    expect(getDocsVersionSearchTag('foo', 'bar')).toBe('docs-foo-bar');
  });
});
