/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {simpleHash, docuHash} from '../hashUtils';

describe('hashUtils', () => {
  it('simpleHash', () => {
    const asserts: {[key: string]: string} = {
      '': 'd41',
      '/foo-bar': '096',
      '/foo/bar': '1df',
      '/endi/lie': '9fa',
      '/endi-lie': 'fd3',
      '/yangshun/tay': '48d',
      '/yangshun-tay': 'f3b',
      '/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar':
        'd46',
      '/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/test1-test2':
        '787',
    };
    Object.keys(asserts).forEach((str) => {
      expect(simpleHash(str, 3)).toBe(asserts[str]);
    });
  });
});

describe('docuHash', () => {
  it('docuHash works', () => {
    const asserts: {[key: string]: string} = {
      '': '-d41',
      '/': 'index',
      '/foo-bar': 'foo-bar-096',
      '/foo/bar': 'foo-bar-1df',
      '/endi/lie': 'endi-lie-9fa',
      '/endi-lie': 'endi-lie-fd3',
      '/yangshun/tay': 'yangshun-tay-48d',
      '/yangshun-tay': 'yangshun-tay-f3b',
      '/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar':
        'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo--d46',
      '/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/foo/bar/test1-test2':
        'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-test-1-test--787',
    };
    Object.keys(asserts).forEach((file) => {
      expect(docuHash(file)).toBe(asserts[file]);
    });
  });

  it('docuHash works with hashLength option', () => {
    const asserts: {[key: string]: string} = {
      '': '-d41d8',
      '/': 'index',
      '/foo-bar': 'foo-bar-09652',
      '/foo/bar': 'foo-bar-1df48',
    };
    Object.keys(asserts).forEach((file) => {
      expect(docuHash(file, {hashLength: 5})).toBe(asserts[file]);
    });
  });

  it('docuHash works with hashExtra option', () => {
    expect(docuHash('')).toBe('-d41');
    expect(docuHash('', {hashExtra: ''})).toBe('-d41');
    expect(docuHash('', {hashExtra: 'some-extra'})).toBe('-928');

    expect(docuHash('/')).toBe('index');
    expect(docuHash('/', {hashExtra: ''})).toBe('index-6a9');
    expect(docuHash('/', {hashExtra: 'some-extra'})).toBe('index-68e');

    expect(docuHash('/foo/bar')).toBe('foo-bar-1df');
    expect(docuHash('/foo/bar', {hashExtra: ''})).toBe('foo-bar-1df');
    expect(docuHash('/foo/bar', {hashExtra: 'some-extra'})).toBe('foo-bar-7d4');
  });
});
