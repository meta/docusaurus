/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getAssetUrls} from '../DevHtmlPlugin';

describe('getAssetUrls', () => {
  const files = ['runtime~main.js', 'main.js', 'styles.css', 'main.js.map'];

  it('prefixes assets with the baseUrl', () => {
    expect(getAssetUrls({files, publicPath: '/base/'})).toEqual({
      scripts: ['/base/runtime~main.js', '/base/main.js'],
      stylesheets: ['/base/styles.css'],
    });
  });

  it('adds missing trailing slash to publicPath', () => {
    expect(
      getAssetUrls({
        files: ['main.js'],
        publicPath: 'https://example.com/base',
      }),
    ).toEqual({scripts: ['https://example.com/base/main.js'], stylesheets: []});
  });

  it('uses relative urls for publicPath "auto"', () => {
    expect(getAssetUrls({files, publicPath: 'auto'})).toEqual({
      scripts: ['runtime~main.js', 'main.js'],
      stylesheets: ['styles.css'],
    });
  });

  it('dedupes and encodes files', () => {
    expect(
      getAssetUrls({
        files: ['a b/main.mjs?v=1', 'a b/main.mjs?v=1', 'x.css?v=2'],
        publicPath: '/',
      }),
    ).toEqual({scripts: ['/a%20b/main.mjs?v=1'], stylesheets: ['/x.css?v=2']});
  });
});
