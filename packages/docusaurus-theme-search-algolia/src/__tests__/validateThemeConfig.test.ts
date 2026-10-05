/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {DEFAULT_CONFIG, validateThemeConfig} from '../validateThemeConfig';
import type {Joi} from '@docusaurus/utils-validation';
import type {
  ThemeConfig,
  UserThemeConfig,
} from '@docusaurus/theme-search-algolia';

type AlgoliaInput = UserThemeConfig['algolia'];

function testValidateThemeConfig(algolia: AlgoliaInput) {
  function validate(
    schema: Joi.ObjectSchema<ThemeConfig>,
    cfg: ThemeConfig,
  ): ThemeConfig {
    const {value, error} = schema.validate(cfg, {
      convert: false,
    });
    if (error) {
      throw error;
    }
    return value;
  }

  return validateThemeConfig({
    themeConfig: (algolia ? {algolia} : {}) as ThemeConfig,
    validate,
  });
}

describe('validateThemeConfig', () => {
  it('minimal config', () => {
    const algolia: AlgoliaInput = {
      indices: ['index'],
      apiKey: 'apiKey',
      appId: 'BH4D9OD16A',
    };
    expect(testValidateThemeConfig(algolia)).toEqual({
      algolia: {
        ...DEFAULT_CONFIG,
        ...algolia,
      },
    });
  });

  it('unknown attributes', () => {
    const algolia: AlgoliaInput = {
      indices: ['index'],
      apiKey: 'apiKey',
      // @ts-expect-error: expected type error!
      unknownKey: 'unknownKey',
      appId: 'BH4D9OD16A',
    };
    expect(testValidateThemeConfig(algolia)).toEqual({
      algolia: {
        ...DEFAULT_CONFIG,
        ...algolia,
      },
    });
  });

  it('undefined config', () => {
    const algolia = undefined;
    expect(() =>
      testValidateThemeConfig(algolia),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "themeConfig.algolia" is required]`,
    );
  });

  it('empty config', () => {
    expect(() =>
      testValidateThemeConfig(
        // @ts-expect-error: expected type error!
        {},
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "algolia.appId" is required. If you haven't migrated to the new DocSearch infra, please refer to the blog post for instructions: https://docusaurus.io/blog/2021/11/21/algolia-docsearch-migration]`,
    );
  });

  it('missing indexName and indices config', () => {
    // @ts-expect-error: expected type error!
    const algolia: AlgoliaInput = {
      apiKey: 'apiKey',
      appId: 'BH4D9OD16A',
    };
    expect(() => testValidateThemeConfig(algolia)).toThrow(
      '"themeConfig.algolia" must contain at least one of [indexName, indices]',
    );
  });

  describe('indexName config', () => {
    it('normalizes indexName to indices', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        apiKey: 'apiKey',
        indexName: 'index',
      };
      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          appId: 'BH4D9OD16A',
          apiKey: 'apiKey',
          indices: [{name: 'index'}],
        },
      });
    });

    it('moves top-level searchParameters into the index', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        apiKey: 'apiKey',
        indexName: 'index',
        searchParameters: {facetFilters: ['language:en'], hitsPerPage: 5},
      };
      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          appId: 'BH4D9OD16A',
          apiKey: 'apiKey',
          indices: [
            {
              name: 'index',
              searchParameters: {
                facetFilters: ['language:en'],
                hitsPerPage: 5,
              },
            },
          ],
        },
      });
    });

    it('rejects indexName together with indices', () => {
      const algolia = {
        appId: 'BH4D9OD16A',
        apiKey: 'apiKey',
        indexName: 'index',
        indices: ['index'],
      } as unknown as AlgoliaInput;
      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"themeConfig.algolia" contains a conflict between exclusive peers [indexName, indices]',
      );
    });

    it('rejects top-level searchParameters together with indices', () => {
      const algolia = {
        appId: 'BH4D9OD16A',
        apiKey: 'apiKey',
        indices: ['index'],
        searchParameters: {facetFilters: ['language:en']},
      } as unknown as AlgoliaInput;
      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"themeConfig.algolia" contains a conflict between optional exclusive peers [searchParameters, indices]',
      );
    });
  });

  it('missing apiKey config', () => {
    // @ts-expect-error: expected type error!
    const algolia: AlgoliaInput = {
      indices: ['indexName'],
      appId: 'BH4D9OD16A',
    };
    expect(() =>
      testValidateThemeConfig(algolia),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "algolia.apiKey" is required]`,
    );
  });

  it('missing appId config', () => {
    // @ts-expect-error: expected type error!
    const algolia: AlgoliaInput = {
      indices: ['indexName'],
      apiKey: 'apiKey',
    };
    expect(() =>
      testValidateThemeConfig(algolia),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "algolia.appId" is required. If you haven't migrated to the new DocSearch infra, please refer to the blog post for instructions: https://docusaurus.io/blog/2021/11/21/algolia-docsearch-migration]`,
    );
  });

  describe('indices config', () => {
    it('accepts string and object indices', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        apiKey: 'apiKey',
        indices: [
          'primary-index',
          {
            name: 'secondary-index',
            searchParameters: {
              facetFilters: [
                'language:en',
                ['version:current', 'version:next'],
              ],
              hitsPerPage: 5,
            },
          },
        ],
      };

      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
        },
      });
    });

    it('rejects an empty indices array', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        apiKey: 'apiKey',
        indices: [],
      };

      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"algolia.indices" must contain at least 1 items',
      );
    });

    it('rejects an index object without a name', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        apiKey: 'apiKey',
        indices: [
          // @ts-expect-error: expected type error: missing name
          {searchParameters: {facetFilters: ['language:en']}},
        ],
      };

      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"algolia.indices[0].name" is required',
      );
    });
  });

  it('contextualSearch config', () => {
    const algolia: AlgoliaInput = {
      appId: 'BH4D9OD16A',
      indices: ['index'],
      apiKey: 'apiKey',
      contextualSearch: true,
    };
    expect(testValidateThemeConfig(algolia)).toEqual({
      algolia: {
        ...DEFAULT_CONFIG,
        ...algolia,
      },
    });
  });

  it('externalUrlRegex config', () => {
    const algolia: AlgoliaInput = {
      appId: 'BH4D9OD16A',
      indices: ['index'],
      apiKey: 'apiKey',
      externalUrlRegex: 'http://external-domain.com',
    };
    expect(testValidateThemeConfig(algolia)).toEqual({
      algolia: {
        ...DEFAULT_CONFIG,
        ...algolia,
      },
    });
  });

  describe('searchPagePath config', () => {
    it.each([false, null, 'custom-search'] as const)(
      'accepts %j',
      (searchPagePath) => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          searchPagePath,
        };

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
          },
        });
      },
    );

    it('rejects true', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        // @ts-expect-error: expected type error
        searchPagePath: true,
      };

      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"algolia.searchPagePath" contains an invalid value',
      );
    });
  });

  describe('replaceSearchResultPathname', () => {
    it('escapes from string', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        replaceSearchResultPathname: {
          from: '/docs/some-\\special-.[regexp]{chars*}',
          to: '/abc',
        },
      };
      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
          replaceSearchResultPathname: {
            from: '\\/docs\\/some\\x2d\\\\special\\x2d\\.\\[regexp\\]\\{chars\\*\\}',
            to: '/abc',
          },
        },
      });
    });

    it('converts from regexp to string', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        replaceSearchResultPathname: {
          // @ts-expect-error: test regexp input
          from: /^\/docs\/(?:1\.0|next)/,
          to: '/abc',
        },
      };

      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
          replaceSearchResultPathname: {
            from: '^\\/docs\\/(?:1\\.0|next)',
            to: '/abc',
          },
        },
      });
    });

    it('rejects an invalid from value', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        replaceSearchResultPathname: {
          // @ts-expect-error: expected type error
          from: 42,
          to: '/abc',
        },
      };

      expect(() => testValidateThemeConfig(algolia)).toThrow(
        /it should be a RegExp or a string, but received 42/,
      );
    });

    it('rejects a missing to value', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        replaceSearchResultPathname: {from: '/docs'},
      };

      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"algolia.replaceSearchResultPathname.to" is required',
      );
    });
  });

  it('searchParameters.facetFilters search config', () => {
    const algolia: AlgoliaInput = {
      appId: 'BH4D9OD16A',
      indices: [
        {name: 'index', searchParameters: {facetFilters: ['version:1.0']}},
      ],
      apiKey: 'apiKey',
    };
    expect(testValidateThemeConfig(algolia)).toEqual({
      algolia: {
        ...DEFAULT_CONFIG,
        ...algolia,
      },
    });
  });

  // TODO Enable once DocSearch releases fix for facets with multiple
  // selected values. Currently the contextual search facets do no work.
  // https://github.com/algolia/docsearch/issues/3037
  describe.todo('facets config', () => {
    it('accepts facets and a result badge key', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        // @ts-expect-error: expected type error
        facets: [{key: 'language', label: 'Language'}, {key: 'version'}],
        resultBadgeKey: 'language',
      };

      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
        },
      });
    });

    it('rejects a facet without a key', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        // @ts-expect-error: expected type error
        facets: [{label: 'Language'}],
      };

      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"algolia.facets[0].key" is required',
      );
    });

    it('rejects unknown facet properties', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        // @ts-expect-error: expected type error
        facets: [
          {
            key: 'language',
            unknown: true,
          },
        ],
      };

      expect(() => testValidateThemeConfig(algolia)).toThrow(
        '"algolia.facets[0].unknown" is not allowed',
      );
    });
  });

  describe('askAi config validation', () => {
    it('accepts string format (agentId)', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        askAi: 'my-assistant-id',
      };
      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
          askAi: {
            agentId: 'my-assistant-id',
            apiKey: algolia.apiKey,
            appId: algolia.appId,
          },
        },
      });
    });

    it('accepts minimal object format', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        askAi: {
          agentId: 'my-assistant-id',
        },
      };
      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
          askAi: {
            agentId: 'my-assistant-id',
            apiKey: algolia.apiKey,
            appId: algolia.appId,
          },
        },
      });
    });

    it('accepts full object format', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        askAi: {
          apiKey: 'ai-apiKey',
          appId: 'ai-appId',
          agentId: 'my-assistant-id',
        },
      };
      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
        },
      });
    });

    it('rejects invalid type', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        // @ts-expect-error: expected type error
        askAi: 123, // Invalid: should be string or object
      };
      expect(() =>
        testValidateThemeConfig(algolia),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: askAi must be either a string (agentId) or an object with apiKey, appId, and agentId]`,
      );
    });

    it('rejects empty askAi', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
        // @ts-expect-error: expected type error: missing mandatory fields
        askAi: {},
      };
      expect(() =>
        testValidateThemeConfig(algolia),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "algolia.askAi.agentId" is required]`,
      );
    });

    it('accepts undefined askAi', () => {
      const algolia: AlgoliaInput = {
        appId: 'BH4D9OD16A',
        indices: ['index'],
        apiKey: 'apiKey',
      };
      expect(testValidateThemeConfig(algolia)).toEqual({
        algolia: {
          ...DEFAULT_CONFIG,
          ...algolia,
        },
      });
    });

    describe('Ask AI search parameters', () => {
      it('accepts Ask AI facet filters', () => {
        const algolia = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            indices: ['ai-index'],
            apiKey: 'ai-apiKey',
            appId: 'ai-appId',
            agentId: 'my-assistant-id',
            searchParameters: {
              'ai-index': {
                facetFilters: ['version:1.0'],
              },
            },
          },
        } satisfies AlgoliaInput;

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
          },
        });
      });

      it('accepts distinct Ask AI / algolia facet filters', () => {
        const algolia = {
          appId: 'BH4D9OD16A',
          indices: [
            {
              name: 'index',
              searchParameters: {
                facetFilters: ['version:algolia'],
              },
            },
          ],
          apiKey: 'apiKey',
          askAi: {
            indices: ['ai-index'],
            apiKey: 'ai-apiKey',
            appId: 'ai-appId',
            agentId: 'my-assistant-id',
            searchParameters: {
              'ai-index': {
                facetFilters: ['version:askAi'],
              },
            },
          },
        } satisfies AlgoliaInput;

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
          },
        });
      });

      it('does not inherit Algolia facet filters', () => {
        const algolia = {
          appId: 'BH4D9OD16A',
          indices: [
            {
              name: 'index',
              searchParameters: {
                facetFilters: ['version:1.0'],
              },
            },
          ],
          apiKey: 'apiKey',
          askAi: {
            indices: ['ai-index'],
            apiKey: 'ai-apiKey',
            appId: 'ai-appId',
            agentId: 'my-assistant-id',
            searchParameters: {},
          },
        } satisfies AlgoliaInput;

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
          },
        });
      });

      it('does not inherit Algolia facet filters with string format', () => {
        const algolia = {
          appId: 'BH4D9OD16A',
          indices: [
            {
              name: 'index',
              searchParameters: {
                facetFilters: ['version:1.0'],
              },
            },
          ],
          apiKey: 'apiKey',
          askAi: 'my-assistant-id',
        } satisfies AlgoliaInput;

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
            askAi: {
              apiKey: algolia.apiKey,
              appId: algolia.appId,
              agentId: 'my-assistant-id',
            },
          },
        });
      });

      it.each([true, 2, 'url'] as const)(
        'accepts all search parameters with distinct %j',
        (distinct) => {
          const algolia = {
            appId: 'BH4D9OD16A',
            indices: ['index'],
            apiKey: 'apiKey',
            askAi: {
              agentId: 'my-agent-id',
              searchParameters: {
                'ai-index': {
                  facetFilters: ['language:en', 'version:current'],
                  filters: 'type:docs',
                  attributesToRetrieve: ['content', 'url'],
                  restrictSearchableAttributes: ['content'],
                  distinct,
                },
              },
            },
          } satisfies AlgoliaInput;

          expect(testValidateThemeConfig(algolia)).toEqual({
            algolia: {
              ...DEFAULT_CONFIG,
              ...algolia,
              askAi: {
                ...algolia.askAi,
                apiKey: algolia.apiKey,
                appId: algolia.appId,
              },
            },
          });
        },
      );

      it('rejects invalid facet filters', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-agent-id',
            searchParameters: {
              'ai-index': {
                // @ts-expect-error: expected type error
                facetFilters: [42],
              },
            },
          },
        };

        expect(() => testValidateThemeConfig(algolia)).toThrowError(
          'askAi must be either a string (agentId) or an object with apiKey, appId, and agentId',
        );
      });
    });

    describe('Ask AI memory', () => {
      it('defaults enabled to false', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-agent-id',
            memory: {userToken: 'user-token'},
          },
        };

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
            askAi: {
              agentId: 'my-agent-id',
              apiKey: algolia.apiKey,
              appId: algolia.appId,
              memory: {
                enabled: false,
                userToken: 'user-token',
              },
            },
          },
        });
      });

      it('rejects an invalid enabled value', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-agent-id',
            memory: {
              // @ts-expect-error: expected type error
              enabled: 'yes',
            },
          },
        };

        expect(() => testValidateThemeConfig(algolia)).toThrowError(
          '"algolia.askAi.memory.enabled" must be a boolean',
        );
      });
    });

    describe('Ask AI prompt suggestions', () => {
      it('defaults hitsPerPage to 3', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-agent-id',
            promptSuggestions: {indexName: 'prompt-suggestions'},
          },
        };

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
            askAi: {
              agentId: 'my-agent-id',
              apiKey: algolia.apiKey,
              appId: algolia.appId,
              promptSuggestions: {
                indexName: 'prompt-suggestions',
                hitsPerPage: 3,
              },
            },
          },
        });
      });

      it('preserves an explicit hitsPerPage', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-agent-id',
            promptSuggestions: {
              indexName: 'prompt-suggestions',
              hitsPerPage: 5,
            },
          },
        };

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
            askAi: {
              agentId: 'my-agent-id',
              apiKey: algolia.apiKey,
              appId: algolia.appId,
              promptSuggestions: {
                indexName: 'prompt-suggestions',
                hitsPerPage: 5,
              },
            },
          },
        });
      });

      it('rejects an empty indexName', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-agent-id',
            promptSuggestions: {indexName: ''},
          },
        };

        expect(() => testValidateThemeConfig(algolia)).toThrowError(
          '"algolia.askAi.promptSuggestions.indexName" is not allowed to be empty',
        );
      });

      it('rejects a non-positive hitsPerPage', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-agent-id',
            promptSuggestions: {
              indexName: 'prompt-suggestions',
              hitsPerPage: 0,
            },
          },
        };

        expect(() => testValidateThemeConfig(algolia)).toThrowError(
          '"algolia.askAi.promptSuggestions.hitsPerPage" must be a positive number',
        );
      });
    });

    describe('Ask AI suggestedQuestions', () => {
      it('accepts suggestedQuestions as true', () => {
        const algolia = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-assistant-id',
            suggestedQuestions: true,
          },
        } satisfies AlgoliaInput;

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
            askAi: {
              apiKey: algolia.apiKey,
              appId: algolia.appId,
              agentId: 'my-assistant-id',
              suggestedQuestions: true,
            },
          },
        });
      });

      it('accepts suggestedQuestions as false', () => {
        const algolia = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-assistant-id',
            suggestedQuestions: false,
          },
        } satisfies AlgoliaInput;

        expect(testValidateThemeConfig(algolia)).toEqual({
          algolia: {
            ...DEFAULT_CONFIG,
            ...algolia,
            askAi: {
              apiKey: algolia.apiKey,
              appId: algolia.appId,
              agentId: 'my-assistant-id',
              suggestedQuestions: false,
            },
          },
        });
      });

      it('rejects invalid suggestedQuestions type', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-assistant-id',
            // @ts-expect-error: expected type error
            suggestedQuestions: 'invalid-string',
          },
        };
        expect(() =>
          testValidateThemeConfig(algolia),
        ).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "algolia.askAi.suggestedQuestions" must be a boolean]`,
        );
      });

      it('rejects suggestedQuestions as number', () => {
        const algolia: AlgoliaInput = {
          appId: 'BH4D9OD16A',
          indices: ['index'],
          apiKey: 'apiKey',
          askAi: {
            agentId: 'my-assistant-id',
            // @ts-expect-error: expected type error
            suggestedQuestions: 123,
          },
        };
        expect(() =>
          testValidateThemeConfig(algolia),
        ).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "algolia.askAi.suggestedQuestions" must be a boolean]`,
        );
      });
    });
  });
});
