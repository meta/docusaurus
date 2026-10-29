/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  generateLayersDeclaration,
  findLayer,
  isValidLayerName,
} from '../layers';
import type {PluginOptions} from '../options';

describe('isValidLayerName', () => {
  it('accepts valid names', () => {
    expect(isValidLayerName('layer1')).toBe(true);
    expect(isValidLayerName('layer1.layer2')).toBe(true);
    expect(isValidLayerName('layer-1.layer_2.layer3')).toBe(true);
  });

  it('rejects layer with coma', () => {
    expect(isValidLayerName('lay,er1')).toBe(false);
  });
  it('rejects layer with space', () => {
    expect(isValidLayerName('lay er1')).toBe(false);
  });
});

describe('generateLayersDeclaration', () => {
  it('for list of layers', () => {
    expect(generateLayersDeclaration(['layer1', 'layer2'])).toBe(
      '@layer layer1, layer2;',
    );
  });

  it('for empty list of layers', () => {
    // Not useful to generate it, but still valid CSS anyway
    expect(generateLayersDeclaration([])).toBe('@layer ;');
  });
});

describe('findLayer', () => {
  const inputFilePath = 'filePath';

  function testFor(layers: PluginOptions['layers']) {
    return findLayer(inputFilePath, Object.entries(layers));
  }

  it('for empty layers', () => {
    expect(testFor({})).toBeUndefined();
  });

  it('for single matching layer', () => {
    expect(testFor({layer: (filePath) => filePath === inputFilePath})).toBe(
      'layer',
    );
  });

  it('for single non-matching layer', () => {
    expect(
      testFor({layer: (filePath) => filePath !== inputFilePath}),
    ).toBeUndefined();
  });

  it('for multiple matching layers', () => {
    expect(
      testFor({
        layer1: (filePath) => filePath === inputFilePath,
        layer2: (filePath) => filePath === inputFilePath,
        layer3: (filePath) => filePath === inputFilePath,
      }),
    ).toBe('layer1');
  });

  it('for multiple non-matching layers', () => {
    expect(
      testFor({
        layer1: (filePath) => filePath !== inputFilePath,
        layer2: (filePath) => filePath !== inputFilePath,
        layer3: (filePath) => filePath !== inputFilePath,
      }),
    ).toBeUndefined();
  });

  it('for multiple mixed matching layers', () => {
    expect(
      testFor({
        layer1: (filePath) => filePath !== inputFilePath,
        layer2: (filePath) => filePath === inputFilePath,
        layer3: (filePath) => filePath !== inputFilePath,
        layer4: (filePath) => filePath === inputFilePath,
      }),
    ).toBe('layer2');
  });
});
