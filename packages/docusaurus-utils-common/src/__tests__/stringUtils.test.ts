/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {addPrefix, addSuffix, removePrefix, removeSuffix} from '../stringUtils';

describe('removePrefix', () => {
  it("is no-op when prefix doesn't exist", () => {
    expect(removePrefix('abcdef', 'ijk')).toBe('abcdef');
    expect(removePrefix('abcdef', 'def')).toBe('abcdef');
    expect(removePrefix('abcdef', '')).toBe('abcdef');
  });
  it('removes prefix', () => {
    expect(removePrefix('prefix', 'pre')).toBe('fix');
  });
});

describe('removeSuffix', () => {
  it("is no-op when suffix doesn't exist", () => {
    expect(removeSuffix('abcdef', 'ijk')).toBe('abcdef');
    expect(removeSuffix('abcdef', 'abc')).toBe('abcdef');
    expect(removeSuffix('abcdef', '')).toBe('abcdef');
  });
  it('removes suffix', () => {
    expect(removeSuffix('abcdef', 'ef')).toBe('abcd');
  });
  it('removes empty suffix', () => {
    expect(removeSuffix('abcdef', '')).toBe('abcdef');
  });
});

describe('addPrefix', () => {
  it('is no-op when prefix already exists', () => {
    expect(addPrefix('abcdef', 'abc')).toBe('abcdef');
    expect(addPrefix('abc', '')).toBe('abc');
    expect(addPrefix('', '')).toBe('');
  });
  it('adds prefix', () => {
    expect(addPrefix('def', 'abc')).toBe('abcdef');
  });
});

describe('addSuffix', () => {
  it('is no-op when suffix already exists', () => {
    expect(addSuffix('abcdef', 'def')).toBe('abcdef');
    expect(addSuffix('abc', '')).toBe('abc');
    expect(addSuffix('', '')).toBe('');
  });
  it('adds suffix', () => {
    expect(addSuffix('abc', 'def')).toBe('abcdef');
  });
});
