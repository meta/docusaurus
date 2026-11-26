/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import postcss from 'postcss';
import {PostCssPluginWrapInLayer} from '../postCssPlugin';
import type {Plugin} from 'postcss';

// Like postcss-preset-env, inserts a fallback before var() declarations
const fallbackPlugin: Plugin = {
  postcssPlugin: 'fallback',
  Declaration(decl) {
    const hasFallback = decl.prev()?.type === 'decl';
    if (decl.value === 'var(--width)' && !hasFallback) {
      decl.cloneBefore({value: '1px'});
    }
  },
};

// Like rtlcss, flips the declarations
const flipPlugin: Plugin = {
  postcssPlugin: 'flip',
  Declaration(decl) {
    if (decl.prop === 'left') {
      decl.prop = 'right';
    }
  },
};

describe('PostCssPluginWrapInLayer', () => {
  it('lets the next plugins process the nodes they insert', async () => {
    const result = await postcss([
      PostCssPluginWrapInLayer({layers: {myLayer: () => true}}),
      fallbackPlugin,
      flipPlugin,
    ]).process('a{left:var(--width)}', {from: '/site/file.css'});

    expect(result.css).toMatchInlineSnapshot(
      `"@layer myLayer{a{right:1px;right:var(--width)}}"`,
    );
  });
});
