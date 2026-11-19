/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {findLayer} from './layers';
import type {Root, PluginCreator} from 'postcss';
import type {PluginOptions} from './options';

// The layer order is the order of first appearance in the CSS bundle
// Declaring it in each file makes it independent of the bundler CSS order
// See https://github.com/meta/docusaurus/pull/13032
function prependLayersDeclaration(root: Root, layerNames: string[]): void {
  root.prepend({type: 'atrule', name: 'layer', params: layerNames.join(', ')});
}

function wrapCssRootInLayer(root: Root, layer: string): void {
  const rootBefore = root.clone();
  root.removeAll();
  root.append({
    type: 'atrule',
    name: 'layer',
    params: layer,
    nodes: rootBefore.nodes,
  });
}

export const PostCssPluginWrapInLayer: PluginCreator<{
  layers: PluginOptions['layers'];
}> = (options) => {
  if (!options) {
    throw new Error('PostCssPluginWrapInLayer options are mandatory');
  }
  const layers = Object.entries(options.layers);
  const layerNames = Object.keys(options.layers);
  return {
    postcssPlugin: 'postcss-wrap-in-layer',
    Once(root) {
      const filePath = root.source?.input.file;
      if (!filePath) {
        return;
      }
      const layer = findLayer(filePath, layers);
      if (layer) {
        wrapCssRootInLayer(root, layer);
        prependLayersDeclaration(root, layerNames);
      }
    },
  };
};

PostCssPluginWrapInLayer.postcss = true;
