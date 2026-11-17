/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getGlobPatterns} from '../globPatterns';
import type {PluginOptions} from '@docusaurus/plugin-pwa';

function testGlobPatterns(globPatterns?: string[]) {
  return getGlobPatterns({
    globPatterns,
  } as PluginOptions['injectManifestConfig']);
}

describe('getGlobPatterns', () => {
  it('returns the static assets patterns', () => {
    expect(testGlobPatterns()).toEqual([
      '**/*.{js,json,css,html}',
      '**/*.{png,jpg,jpeg,gif,svg,ico}',
      '**/*.{woff,woff2,eot,ttf,otf}',
    ]);
  });

  it('adds the user patterns', () => {
    expect(testGlobPatterns(['**/*.pdf'])).toEqual([
      '**/*.{js,json,css,html}',
      '**/*.{png,jpg,jpeg,gif,svg,ico}',
      '**/*.{woff,woff2,eot,ttf,otf}',
      '**/*.pdf',
    ]);
  });
});
