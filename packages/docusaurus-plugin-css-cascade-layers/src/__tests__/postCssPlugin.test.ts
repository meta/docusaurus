/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import postcss from 'postcss';
import {PostCssPluginWrapInLayer} from '../postCssPlugin';

const layers = {
  'layer.a': (filePath: string) => filePath.endsWith('a.css'),
  'layer.b': (filePath: string) => filePath.endsWith('b.css'),
};

async function process(css: string, filePath: string): Promise<string> {
  const result = await postcss([PostCssPluginWrapInLayer({layers})]).process(
    css,
    {from: filePath},
  );
  return result.css;
}

describe('PostCssPluginWrapInLayer', () => {
  it('wraps the file in its layer, after the layers declaration', async () => {
    await expect(
      process('.a { color: red; }', '/site/b.css'),
    ).resolves.toMatchInlineSnapshot(
      `"@layer layer.a, layer.b;@layer layer.b {.a { color: red; } }"`,
    );
  });

  it('does not change a file without layer', async () => {
    await expect(
      process('.a { color: red; }', '/site/c.css'),
    ).resolves.toMatchInlineSnapshot(`".a { color: red; }"`);
  });
});
