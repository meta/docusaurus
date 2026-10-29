/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type LayerEntry = [string, (filePath: string) => boolean];

export function isValidLayerName(layer: string): boolean {
  // TODO improve validation rule to match spec, not high priority
  return !layer.includes(',') && !layer.includes(' ');
}

export function generateLayersDeclaration(layers: string[]): string {
  return `@layer ${layers.join(', ')};`;
}

export function findLayer(
  filePath: string,
  layers: LayerEntry[],
): string | undefined {
  // Using find() => layers order matter
  // The first layer that matches is used in priority even if others match too
  const layerEntry = layers.find((layer) => layer[1](filePath));
  return layerEntry?.[0]; // return layer name
}
