/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Joi} from '@docusaurus/utils-validation';
import {docSearchV3} from './docSearchVersion';
import type {ThemeConfigValidationContext} from '@docusaurus/types';
import type {
  ThemeConfig,
  ThemeConfigAlgolia,
} from '@docusaurus/theme-search-algolia';

export const DEFAULT_CONFIG = {
  // Enabled by default, as it makes sense in most cases
  // see also https://github.com/facebook/docusaurus/issues/5880
  contextualSearch: true,
  searchParameters: {},
  searchPagePath: 'search',
} satisfies Partial<ThemeConfigAlgolia>;

const FacetFiltersSchema = Joi.array().items(
  Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
);

const Schema = Joi.object<ThemeConfig>({
  algolia: Joi.object<ThemeConfigAlgolia>({
    // Docusaurus attributes
    contextualSearch: Joi.boolean().default(DEFAULT_CONFIG.contextualSearch),
    externalUrlRegex: Joi.string().optional(),
    // Algolia attributes
    appId: Joi.string().required().messages({
      'any.required':
        '"algolia.appId" is required. If you haven\'t migrated to the new DocSearch infra, please refer to the blog post for instructions: https://docusaurus.io/blog/2021/11/21/algolia-docsearch-migration',
    }),
    apiKey: Joi.string().required(),
    indexName: Joi.string().required(),
    searchParameters: Joi.object({
      facetFilters: FacetFiltersSchema.optional(),
    })
      .default(DEFAULT_CONFIG.searchParameters)
      .unknown(),
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
    // Ask AI configuration (DocSearch v4 only)
    askAi: Joi.alternatives()
      .try(
        // Simple string format (assistantId only)
        Joi.string(),
        // Full configuration object
        Joi.object({
          assistantId: Joi.string().required(),
          // Optional Ask AI configuration
          indexName: Joi.string().optional(),
          apiKey: Joi.string().optional(),
          appId: Joi.string().optional(),
          searchParameters: Joi.object({
            facetFilters: FacetFiltersSchema.optional(),
          }).optional(),
          suggestedQuestions: Joi.boolean().optional(),
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
          const algoliaFacetFilters = algolia.searchParameters?.facetFilters;
          if (typeof askAiInput === 'string') {
            return {
              assistantId: askAiInput,
              indexName: algolia.indexName,
              apiKey: algolia.apiKey,
              appId: algolia.appId,
              ...(algoliaFacetFilters
                ? {
                    searchParameters: {
                      facetFilters: algoliaFacetFilters,
                    },
                  }
                : {}),
            } satisfies ThemeConfigAlgolia['askAi'];
          }

          // Fill in missing fields with the top-level Algolia config
          askAiInput.indexName = askAiInput.indexName ?? algolia.indexName;
          askAiInput.apiKey = askAiInput.apiKey ?? algolia.apiKey;
          askAiInput.appId = askAiInput.appId ?? algolia.appId;
          if (
            askAiInput.searchParameters?.facetFilters === undefined &&
            algoliaFacetFilters
          ) {
            askAiInput.searchParameters = askAiInput.searchParameters ?? {};
            askAiInput.searchParameters.facetFilters = algoliaFacetFilters;
          }

          return askAiInput;
        },
      )
      .optional()
      .messages({
        'alternatives.types':
          'askAi must be either a string (assistantId) or an object with indexName, apiKey, appId, and assistantId',
      }),
  })
    .label('themeConfig.algolia')
    .required()
    .unknown(),
});

// TODO Docusaurus v4: remove this check when we drop DocSearch v3
function ensureAskAISupported(themeConfig: ThemeConfig) {
  // enforce DocsSearch v4 requirement when AskAI is configured
  if (themeConfig.algolia.askAi && docSearchV3) {
    throw new Error(
      'The askAi feature is only supported in DocSearch v4. ' +
        'Please upgrade to DocSearch v4 by installing "@docsearch/react": "^4.0.0" ' +
        'or remove the askAi configuration from your theme config.',
    );
  }
}

export function validateThemeConfig({
  validate,
  themeConfig: themeConfigInput,
}: ThemeConfigValidationContext<ThemeConfig>): ThemeConfig {
  const themeConfig = validate(Schema, themeConfigInput);
  ensureAskAISupported(themeConfig);
  return themeConfig;
}
