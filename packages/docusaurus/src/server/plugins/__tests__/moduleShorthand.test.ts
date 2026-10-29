/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getNamePatterns, resolveModuleName} from '../moduleShorthand';

describe('getNamePatterns', () => {
  it('resolves plain names', () => {
    expect(getNamePatterns('awesome', 'plugin')).toEqual([
      'awesome',
      '@docusaurus/plugin-awesome',
      'docusaurus-plugin-awesome',
    ]);

    expect(getNamePatterns('awesome', 'theme')).toEqual([
      'awesome',
      '@docusaurus/theme-awesome',
      'docusaurus-theme-awesome',
    ]);
  });

  it('expands bare scopes', () => {
    expect(getNamePatterns('@joshcena', 'plugin')).toEqual([
      '@joshcena/docusaurus-plugin',
    ]);

    expect(getNamePatterns('@joshcena', 'theme')).toEqual([
      '@joshcena/docusaurus-theme',
    ]);
  });

  it('expands scoped names', () => {
    expect(getNamePatterns('@joshcena/awesome', 'plugin')).toEqual([
      '@joshcena/awesome',
      '@joshcena/docusaurus-plugin-awesome',
    ]);

    expect(getNamePatterns('@joshcena/awesome', 'theme')).toEqual([
      '@joshcena/awesome',
      '@joshcena/docusaurus-theme-awesome',
    ]);
  });

  it('expands deep scoped paths', () => {
    expect(getNamePatterns('@joshcena/awesome/web', 'plugin')).toEqual([
      '@joshcena/awesome/web',
      '@joshcena/docusaurus-plugin-awesome/web',
    ]);

    expect(getNamePatterns('@joshcena/awesome/web', 'theme')).toEqual([
      '@joshcena/awesome/web',
      '@joshcena/docusaurus-theme-awesome/web',
    ]);
  });
});

describe('resolveModuleName', () => {
  it('resolves longhand', () => {
    expect(
      resolveModuleName('@docusaurus/plugin-content-docs', require, 'plugin'),
    ).toBeDefined();
  });

  it('resolves shorthand', () => {
    expect(resolveModuleName('content-docs', require, 'plugin')).toBeDefined();
  });

  it('throws good error message for longhand', () => {
    expect(() =>
      resolveModuleName('@docusaurus/plugin-content-doc', require, 'plugin'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Docusaurus was unable to resolve the "@docusaurus/plugin-content-doc" plugin. Make sure one of the following packages are installed:
      - @docusaurus/plugin-content-doc
      - @docusaurus/docusaurus-plugin-plugin-content-doc]
    `);
  });

  it('throws good error message for shorthand', () => {
    expect(() => resolveModuleName('content-doc', require, 'plugin'))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: Docusaurus was unable to resolve the "content-doc" plugin. Make sure one of the following packages are installed:
        - content-doc
        - @docusaurus/plugin-content-doc
        - docusaurus-plugin-content-doc]
      `);
  });
});
