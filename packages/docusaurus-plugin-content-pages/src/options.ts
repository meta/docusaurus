/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Joi,
  RemarkPluginsSchema,
  RehypePluginsSchema,
  RecmaPluginsSchema,
  AdmonitionsSchema,
  RouteBasePathSchema,
  URISchema,
} from '@docusaurus/utils-validation';
import {DEFAULT_PLUGIN_ID} from '@docusaurus/utils';
import {GlobExcludeDefault} from '@docusaurus/glob';
import type {OptionValidationContext} from '@docusaurus/types';
import type {PluginOptions, Options} from '@docusaurus/plugin-content-pages';

export const DEFAULT_OPTIONS: PluginOptions = {
  id: DEFAULT_PLUGIN_ID,
  path: 'src/pages', // Path to data on filesystem, relative to site dir.
  routeBasePath: '/', // URL Route.
  include: ['**/*.{js,jsx,ts,tsx,md,mdx}'], // Extensions to include.
  exclude: GlobExcludeDefault,
  mdxPageComponent: '@theme/MDXPage',
  remarkPlugins: [],
  rehypePlugins: [],
  recmaPlugins: [],
  beforeDefaultRehypePlugins: [],
  beforeDefaultRemarkPlugins: [],
  admonitions: true,
  showLastUpdateTime: false,
  showLastUpdateAuthor: false,
  editLocalizedFiles: false,
};

const PluginOptionSchema = Joi.object<PluginOptions>({
  path: Joi.string().default(DEFAULT_OPTIONS.path),
  routeBasePath: RouteBasePathSchema.default(DEFAULT_OPTIONS.routeBasePath),
  include: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.include),
  exclude: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.exclude),
  mdxPageComponent: Joi.string().default(DEFAULT_OPTIONS.mdxPageComponent),
  remarkPlugins: RemarkPluginsSchema.default(DEFAULT_OPTIONS.remarkPlugins),
  rehypePlugins: RehypePluginsSchema.default(DEFAULT_OPTIONS.rehypePlugins),
  recmaPlugins: RecmaPluginsSchema.default(DEFAULT_OPTIONS.recmaPlugins),
  beforeDefaultRehypePlugins: RehypePluginsSchema.default(
    DEFAULT_OPTIONS.beforeDefaultRehypePlugins,
  ),
  beforeDefaultRemarkPlugins: RemarkPluginsSchema.default(
    DEFAULT_OPTIONS.beforeDefaultRemarkPlugins,
  ),
  admonitions: AdmonitionsSchema.default(DEFAULT_OPTIONS.admonitions),
  showLastUpdateTime: Joi.bool().default(DEFAULT_OPTIONS.showLastUpdateTime),
  showLastUpdateAuthor: Joi.bool().default(
    DEFAULT_OPTIONS.showLastUpdateAuthor,
  ),
  editUrl: Joi.alternatives().try(URISchema, Joi.function()),
  editLocalizedFiles: Joi.boolean().default(DEFAULT_OPTIONS.editLocalizedFiles),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  const validatedOptions = validate(PluginOptionSchema, options);
  return validatedOptions;
}
