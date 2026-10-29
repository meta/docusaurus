/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {Joi} from '@docusaurus/utils-validation';
import {posixPath} from '@docusaurus/utils';
import {isValidLayerName} from './layers';
import type {OptionValidationContext} from '@docusaurus/types';

export type PluginOptions = {
  id: string; // plugin id
  layers: Record<string, (filePath: string) => boolean>;
};

export type Options = {
  layers?: PluginOptions['layers'];
};

// Not ideal to compute layers using "filePath.includes()"
// But this is mostly temporary until we add first-class layers everywhere
function layerFor(...params: string[]) {
  return (filePath: string) => {
    const posixFilePath = posixPath(filePath);
    return params.some((p) => posixFilePath.includes(p));
  };
}

// Object order matters, it defines the layer order
const DEFAULT_LAYERS: PluginOptions['layers'] = {
  'docusaurus.infima': layerFor('node_modules/infima/dist'),
  'docusaurus.theme-common': layerFor(
    'packages/docusaurus-theme-common/lib',
    'node_modules/@docusaurus/theme-common/lib',
  ),
  'docusaurus.theme-classic': layerFor(
    'packages/docusaurus-theme-classic/lib',
    'node_modules/@docusaurus/theme-classic/lib',
  ),
  'docusaurus.core': layerFor(
    'packages/docusaurus/lib',
    'node_modules/@docusaurus/core/lib',
  ),
  'docusaurus.plugin-debug': layerFor(
    'packages/docusaurus-plugin-debug/lib',
    'node_modules/@docusaurus/plugin-debug/lib',
  ),
  'docusaurus.theme-mermaid': layerFor(
    'packages/docusaurus-theme-mermaid/lib',
    'node_modules/@docusaurus/theme-mermaid/lib',
  ),
  'docusaurus.theme-live-codeblock': layerFor(
    'packages/docusaurus-theme-live-codeblock/lib',
    'node_modules/@docusaurus/theme-live-codeblock/lib',
  ),
  'docusaurus.theme-search-algolia.docsearch': layerFor(
    'node_modules/@docsearch/css/dist',
  ),
  'docusaurus.theme-search-algolia': layerFor(
    'packages/docusaurus-theme-search-algolia/lib',
    'node_modules/@docusaurus/theme-search-algolia/lib',
  ),
  // docusaurus.website layer ? (declare it, even if empty?)
};

export const DEFAULT_OPTIONS: Partial<PluginOptions> = {
  id: 'default',
  layers: DEFAULT_LAYERS,
};

const pluginOptionsSchema = Joi.object<PluginOptions>({
  layers: Joi.object()
    .pattern(
      Joi.custom((val, helpers) => {
        if (!isValidLayerName(val)) {
          return helpers.error('any.invalid');
        }
        return val;
      }),
      Joi.function().arity(1).required(),
    )
    .default(DEFAULT_OPTIONS.layers),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  return validate(pluginOptionsSchema, options);
}
