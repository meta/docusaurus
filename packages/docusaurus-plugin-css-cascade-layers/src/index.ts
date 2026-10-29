/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {PostCssPluginWrapInLayer} from './postCssPlugin';
import {generateLayersDeclaration} from './layers';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {PluginOptions, Options} from './options';

const PluginName = 'docusaurus-plugin-css-cascade-layers';

const LayersDeclarationModule = 'layers.css';

function getLayersDeclarationPath(
  context: LoadContext,
  options: PluginOptions,
) {
  const {generatedFilesDir} = context;
  const pluginId = options.id;
  if (pluginId !== 'default') {
    // Since it's only possible to declare a single layer order
    // using this plugin twice doesn't really make sense
    throw new Error(
      'The CSS Cascade Layers plugin does not support multiple instances.',
    );
  }
  return path.join(
    generatedFilesDir,
    PluginName,
    pluginId,
    LayersDeclarationModule,
  );
}

export default function pluginCssCascadeLayers(
  context: LoadContext,
  options: PluginOptions,
): Plugin | null {
  const layersDeclarationPath = getLayersDeclarationPath(context, options);

  return {
    name: PluginName,

    getClientModules() {
      return [layersDeclarationPath];
    },

    async contentLoaded({actions}) {
      await actions.createData(
        LayersDeclarationModule,
        generateLayersDeclaration(Object.keys(options.layers)),
      );
    },

    configurePostCss(postCssOptions) {
      postCssOptions.plugins.push(PostCssPluginWrapInLayer(options));
      return postCssOptions;
    },
  };
}

export {validateOptions} from './options';

export type {PluginOptions, Options};
