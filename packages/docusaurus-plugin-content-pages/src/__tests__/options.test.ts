/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {normalizePluginOptions} from '@docusaurus/utils-validation';
import {validateOptions, DEFAULT_OPTIONS} from '../options';
import type {Options} from '@docusaurus/plugin-content-pages';

function testValidate(options: Options) {
  return validateOptions({validate: normalizePluginOptions, options});
}

const defaultOptions = {
  ...DEFAULT_OPTIONS,
  id: 'default',
};

describe('normalizePagesPluginOptions', () => {
  it('returns default options for undefined user options', () => {
    expect(testValidate({})).toEqual(defaultOptions);
  });

  it('fills in default options for partially defined user options', () => {
    expect(testValidate({path: 'src/foo'})).toEqual({
      ...defaultOptions,
      path: 'src/foo',
    });
  });

  it('accepts correctly defined user options', () => {
    const userOptions = {
      path: 'src/my-pages',
      routeBasePath: '/my-pages',
      include: ['**/*.{js,jsx,ts,tsx}'],
      exclude: ['**/$*/'],
    };
    expect(testValidate(userOptions)).toEqual({
      ...defaultOptions,
      ...userOptions,
    });
  });

  it('rejects bad path inputs', () => {
    expect(() => {
      testValidate({
        // @ts-expect-error: bad attribute
        path: 42,
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "path" must be a string]`,
    );
  });

  it('empty routeBasePath replace default path("/")', () => {
    expect(
      testValidate({
        routeBasePath: '',
      }),
    ).toEqual({
      ...defaultOptions,
      routeBasePath: '/',
    });
  });
});
