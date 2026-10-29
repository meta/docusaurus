/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {createSlugger} from '../slugger';

describe('createSlugger', () => {
  it('can create unique slugs', () => {
    const slugger = createSlugger();
    // cSpell:ignore somevalue
    expect(slugger.slug('Some$/vaLue$!^')).toBe('somevalue');
    expect(slugger.slug('Some$/vaLue$!^')).toBe('somevalue-1');
    expect(slugger.slug('Some$/vaLue$!^')).toBe('somevalue-2');
    expect(slugger.slug('Some$/vaLue$!^-1')).toBe('somevalue-1-1');
  });

  it('can create unique slugs respecting case', () => {
    const slugger = createSlugger();
    const opt = {maintainCase: true};
    expect(slugger.slug('Some$/vaLue$!^', opt)).toBe('SomevaLue');
    expect(slugger.slug('Some$/vaLue$!^', opt)).toBe('SomevaLue-1');
    expect(slugger.slug('Some$/vaLue$!^', opt)).toBe('SomevaLue-2');
    expect(slugger.slug('Some$/vaLue$!^-1', opt)).toBe('SomevaLue-1-1');
  });
});
