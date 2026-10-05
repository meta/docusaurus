/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Joi} from '@docusaurus/utils-validation';
import type {DocSearchIndex} from '@docsearch/react';
import type {ThemeConfigValidationContext} from '@docusaurus/types';
import type {
  ThemeConfig,
  ThemeConfigAlgolia,
} from '@docusaurus/theme-search-algolia';

export const DEFAULT_CONFIG = {
  // Enabled by default, as it makes sense in most cases
  // see also https://github.com/meta/docusaurus/issues/5880
  contextualSearch: true,
  searchPagePath: 'search',
} satisfies Partial<ThemeConfigAlgolia>;

const FacetFiltersSchema = Joi.array().items(
  Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
);

const SearchParametersSchema = Joi.object({
  facetFilters: FacetFiltersSchema.optional(),
}).unknown(true);

const Schema = Joi.object<ThemeConfig>({
  algolia: Joi.object<
    ThemeConfigAlgolia & {
      indexName?: string;
      searchParameters?: DocSearchIndex['searchParameters'];
    }
  >({
    // Docusaurus attributes
    contextualSearch: Joi.boolean().default(DEFAULT_CONFIG.contextualSearch),
    externalUrlRegex: Joi.string().optional(),
    // Algolia attributes
    appId: Joi.string().required().messages({
      'any.required':
        '"algolia.appId" is required. If you haven\'t migrated to the new DocSearch infra, please refer to the blog post for instructions: https://docusaurus.io/blog/2021/11/21/algolia-docsearch-migration',
    }),
    apiKey: Joi.string().required(),
    // Single-index shorthand, normalized to `indices` below
    indexName: Joi.string(),
    searchParameters: SearchParametersSchema,
    indices: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.string(),
          Joi.object({
            name: Joi.string().required(),
            searchParameters: SearchParametersSchema,
          }),
        ),
      )
      .min(1),
    searchPagePath: Joi.alternatives()
      .try(Joi.boolean().invalid(true), Joi.string())
      .allow(null)
      .default(DEFAULT_CONFIG.searchPagePath),
    replaceSearchResultPathname: Joi.object({
      from: Joi.custom((from) => {
        if (typeof from === 'string') {
          return RegExp.escape(from);
        } else if (from instanceof RegExp) {
          return from.source;
        }
        throw new Error(
          `it should be a RegExp or a string, but received ${from}`,
        );
      }).required(),
      to: Joi.string().required(),
    }).optional(),
    // TODO Enable once DocSearch releases fix for facets with multiple
    // selected values. Currently the contextual search facets do no work.
    // https://github.com/algolia/docsearch/issues/3037
    // facets: Joi.array()
    //   .items(
    //     Joi.object({
    //       key: Joi.string().required(),
    //       label: Joi.string().optional(),
    //     }).unknown(false),
    //   )
    //   .optional(),
    resultBadgeKey: Joi.string().optional(),
    // Optional Ask AI configuration
    askAi: Joi.alternatives()
      .try(
        // Simple string format (agentId only)
        Joi.string(),
        // Full configuration object
        Joi.object({
          agentId: Joi.string().required(),
          // Optional Ask AI configuration
          indices: Joi.array().items(Joi.string()).optional(),
          apiKey: Joi.string().optional(),
          appId: Joi.string().optional(),
          searchParameters: Joi.object()
            .pattern(
              Joi.string(),
              Joi.object({
                facetFilters: FacetFiltersSchema.optional(),
                filters: Joi.string().optional(),
                attributesToRetrieve: Joi.array()
                  .items(Joi.string())
                  .optional(),
                restrictSearchableAttributes: Joi.array()
                  .items(Joi.string())
                  .optional(),
                distinct: Joi.alternatives()
                  .try(Joi.boolean(), Joi.number(), Joi.string())
                  .optional(),
              }).unknown(),
            )
            .optional(),
          suggestedQuestions: Joi.boolean().optional(),
          memory: Joi.object({
            enabled: Joi.bool().optional().default(false),
            userToken: Joi.string().optional(),
          }).optional(),
          promptSuggestions: Joi.object({
            indexName: Joi.string().min(1).required(),
            hitsPerPage: Joi.number().positive().optional().default(3),
          }).optional(),
        }),
      )
      .custom(
        (
          askAiInput: string | ThemeConfigAlgolia['askAi'] | undefined,
          helpers,
        ) => {
          if (!askAiInput) {
            return askAiInput;
          }
          const algolia: ThemeConfigAlgolia = helpers.state.ancestors[0];
          if (typeof askAiInput === 'string') {
            return {
              agentId: askAiInput,
              apiKey: algolia.apiKey,
              appId: algolia.appId,
            } satisfies ThemeConfigAlgolia['askAi'];
          }

          // Fill in missing fields with the top-level Algolia config
          // NOTE: `indices` should only be used in specific cases for
          // Agent Studio (dynamic indices), so instead of inheriting the root
          // `algolia.indices` we ignore them
          askAiInput.indices = askAiInput.indices ?? undefined;
          askAiInput.apiKey = askAiInput.apiKey ?? algolia.apiKey;
          askAiInput.appId = askAiInput.appId ?? algolia.appId;

          return askAiInput;
        },
      )
      .optional()
      .messages({
        'alternatives.types':
          'askAi must be either a string (agentId) or an object with apiKey, appId, and agentId',
      }),
  })
    .xor('indexName', 'indices')
    .oxor('searchParameters', 'indices')
    .custom(({indexName, searchParameters, ...rest}) =>
      indexName
        ? {...rest, indices: [{name: indexName, searchParameters}]}
        : rest,
    )
    .label('themeConfig.algolia')
    .required()
    .unknown(),
});

export function validateThemeConfig({
  validate,
  themeConfig: themeConfigInput,
}: ThemeConfigValidationContext<ThemeConfig>): ThemeConfig {
  const themeConfig = validate(Schema, themeConfigInput);
  return themeConfig;
}
