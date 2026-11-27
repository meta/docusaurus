/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {findLayer} from './layers';
import type {Helpers, Root, PluginCreator} from 'postcss';
import type {PluginOptions} from './options';

// The layer order is the order of first appearance in the CSS bundle
// Declaring it in each file makes it independent of the bundler CSS order
// See https://github.com/meta/docusaurus/pull/13032
function prependLayersDeclaration(
  root: Root,
  layerNames: string[],
  {AtRule}: Helpers,
): void {
  root.prepend(new AtRule({name: 'layer', params: layerNames.join(', ')}));
}

function wrapCssRootInLayer(
  root: Root,
  layer: string,
  {AtRule}: Helpers,
): void {
  const layerAtRule = new AtRule({name: 'layer', params: layer});
  layerAtRule.append(root.nodes);
  root.append(layerAtRule);
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
    Once(root, helpers) {
      const filePath = root.source?.input.file;
      if (!filePath) {
        return;
      }
      const layer = findLayer(filePath, layers);
      if (layer) {
        wrapCssRootInLayer(root, layer, helpers);
        prependLayersDeclaration(root, layerNames, helpers);
      }
    },
  };
};

PostCssPluginWrapInLayer.postcss = true;
