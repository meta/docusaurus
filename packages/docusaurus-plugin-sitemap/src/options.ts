/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {Joi} from '@docusaurus/utils-validation';
import {LastModOptionList} from './types';
import type {OptionValidationContext} from '@docusaurus/types';
import type {
  LastModOption,
  SitemapItem,
  CreateSitemapItemsFn,
  CreateSitemapItemsParams,
} from './types';

export type PluginOptions = {
  /**
   * The path to the created sitemap file, relative to the output directory.
   * Useful if you have two plugin instances outputting two files.
   */
  filename: string;

  /**
   * A list of glob patterns; matching route paths will be filtered from the
   * sitemap. Note that you may need to include the base URL in here.
   */
  ignorePatterns: string[];

  /**
   * Defines the format of the "lastmod" sitemap item entry, between:
   * - null: do not compute/add a "lastmod" sitemap entry
   * - "date": add a "lastmod" sitemap entry without time (YYYY-MM-DD)
   * - "datetime": add a "lastmod" sitemap entry with time (ISO 8601 datetime)
   * @see https://www.sitemaps.org/protocol.html#xmlTagDefinitions
   * @see https://www.w3.org/TR/NOTE-datetime
   */
  lastmod: LastModOption | null;

  /** Allow control over the construction of SitemapItems */
  createSitemapItems?: CreateSitemapItemsOption;
};

type CreateSitemapItemsOption = (
  params: CreateSitemapItemsParams & {
    defaultCreateSitemapItems: CreateSitemapItemsFn;
  },
) => Promise<SitemapItem[]>;

export type Options = Partial<PluginOptions>;

export const DEFAULT_OPTIONS: PluginOptions = {
  filename: 'sitemap.xml',
  ignorePatterns: [],
  lastmod: 'date',
};

// TODO Docusaurus v5: remove these migration errors
// Removed in Docusaurus v4: Google ignores <changefreq> and <priority>,
// and the same value for all routes does not make sense anyway
// Users can still emit them per-route with createSitemapItems()
// See also https://github.com/facebook/docusaurus/issues/2604
function removedOptionSchema(option: 'changefreq' | 'priority') {
  return Joi.any()
    .forbidden()
    .messages({
      'any.unknown': `The sitemap plugin ${logger.code(
        option,
      )} option has been removed in Docusaurus v4. Please remove it from your config.
If you still want to emit this sitemap tag, use the ${logger.code(
        'createSitemapItems',
      )} option instead: ${logger.url(
        'https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap#changefreq-priority',
      )}`,
    });
}

const PluginOptionSchema = Joi.object<PluginOptions>({
  // @ts-expect-error: forbidden
  changefreq: removedOptionSchema('changefreq'),
  priority: removedOptionSchema('priority'),

  lastmod: Joi.string()
    .valid(null, ...LastModOptionList)
    .default(DEFAULT_OPTIONS.lastmod),

  createSitemapItems: Joi.function(),

  ignorePatterns: Joi.array()
    .items(Joi.string())
    .default(DEFAULT_OPTIONS.ignorePatterns),
  filename: Joi.string().default(DEFAULT_OPTIONS.filename),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  const validatedOptions = validate(PluginOptionSchema, options);
  return validatedOptions;
}
