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
      `"@layer myLayer;@layer myLayer{a{right:1px;right:var(--width)}}"`,
    );
  });

  const layers = {
    'layer.a': (filePath: string) => filePath.endsWith('a.css'),
    'layer.b': (filePath: string) => filePath.endsWith('b.css'),
  };

  async function processCss(css: string, filePath: string): Promise<string> {
    const result = await postcss([PostCssPluginWrapInLayer({layers})]).process(
      css,
      {from: filePath},
    );
    return result.css;
  }

  it('wraps the file in its layer, after the layers declaration', async () => {
    await expect(
      processCss('.a { color: red; }', '/site/b.css'),
    ).resolves.toMatchInlineSnapshot(
      `"@layer layer.a, layer.b;@layer layer.b {.a { color: red; } }"`,
    );
  });

  it('does not change a file without layer', async () => {
    await expect(
      processCss('.a { color: red; }', '/site/c.css'),
    ).resolves.toMatchInlineSnapshot(`".a { color: red; }"`);
  });
});
