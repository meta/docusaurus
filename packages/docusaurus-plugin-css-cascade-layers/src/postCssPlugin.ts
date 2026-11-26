/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {findLayer} from './layers';
import type {Helpers, Root, PluginCreator} from 'postcss';
import type {PluginOptions} from './options';

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
      }
    },
  };
};

PostCssPluginWrapInLayer.postcss = true;
