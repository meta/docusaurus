/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getVcsPreset} from '@docusaurus/utils';
import {
  ConfigSchema,
  DEFAULT_CONFIG,
  DEFAULT_FUTURE_CONFIG,
  DEFAULT_STORAGE_CONFIG,
  validateConfig,
} from '../configValidation';
import type {
  FutureConfig,
  StorageConfig,
  MarkdownConfig,
  MarkdownHooks,
  Config,
  DocusaurusConfig,
  PluginConfig,
  I18nConfig,
  I18nLocaleConfig,
  VcsConfig,
  VcsPreset,
} from '@docusaurus/types';
import type {DeepPartial} from 'utility-types';

const baseConfig = {
  baseUrl: '/',
  title: 'my site',
  url: 'https://mysite.com',
} as Config;

const normalizeConfig = (config: DeepPartial<Config>): DocusaurusConfig =>
  validateConfig({...baseConfig, ...config}, 'docusaurus.config.js');

describe('normalizeConfig', () => {
  it('normalizes empty config', () => {
    const value = normalizeConfig({markdown: {}});
    expect(value).toEqual({
      ...DEFAULT_CONFIG,
      ...baseConfig,
    });
  });

  it('accepts correctly defined config options', () => {
    const userConfig: Config = {
      ...DEFAULT_CONFIG,
      ...baseConfig,
      storage: {
        type: 'sessionStorage',
        namespace: true,
      },
      vcs: {
        initialize: (_params) => {},
        getFileCreationInfo: async (_filePath) => null,
        getFileLastUpdateInfo: async (_filePath) => null,
      },
      future: {
        experimental_router: 'hash',
      },
      tagline: 'my awesome site',
      organizationName: 'facebook',
      projectName: 'docusaurus',
      githubHost: 'github.com',
      githubPort: '8000',
      customFields: {
        myCustomField: '42',
      },
      scripts: [
        {
          src: `/analytics.js`,
          async: true,
          defer: true,
          'data-domain': 'xyz', // See https://github.com/facebook/docusaurus/issues/3378
        },
      ],
      stylesheets: [
        {
          href: '/katex/katex.min.css',
          type: 'text/css',
          crossorigin: 'anonymous',
        },
      ],
      markdown: {
        format: 'md',
        mermaid: true,
        emoji: false,
        parseFrontMatter: async (params) =>
          params.defaultParseFrontMatter(params),
        preprocessor: ({fileContent}) => fileContent,
        mdx1Compat: {
          comments: true,
          admonitions: false,
          headingIds: true,
        },
        anchors: {
          maintainCase: true,
        },
        remarkRehypeOptions: {
          footnoteLabel: 'Pied de page',
        },
        hooks: {
          onBrokenMarkdownLinks: 'log',
          onBrokenMarkdownImages: 'log',
          onUnusedMarkdownDirectives: 'log',
        },
      },
    };
    const normalizedConfig = normalizeConfig(userConfig);
    expect(normalizedConfig).toEqual(userConfig);
  });

  it('accepts custom field in config', () => {
    const value = normalizeConfig({
      customFields: {
        author: 'anshul',
      },
    });
    expect(value).toEqual({
      ...DEFAULT_CONFIG,
      ...baseConfig,
      customFields: {
        author: 'anshul',
      },
    });
  });

  it('throws error for unknown field', () => {
    expect(() => {
      normalizeConfig({
        // @ts-expect-error: test
        invalid: true,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('throws error for required fields', () => {
    expect(() =>
      validateConfig(
        {
          invalidField: true,
          presets: {},
          stylesheets: {},
          themes: {},
          scripts: {},
        },
        'docusaurus.config.js',
      ),
    ).toThrowErrorMatchingSnapshot();
  });
});

describe('config warning and error', () => {
  function getWarning(config: unknown) {
    return ConfigSchema.validate(config).warning;
  }

  it('baseConfig has no warning', () => {
    const warning = getWarning(baseConfig);
    expect(warning).toBeUndefined();
  });
});

describe('ssgTemplate', () => {
  it('accepts ssgTemplate', () => {
    expect(normalizeConfig({ssgTemplate: '<html></html>'})).toEqual({
      ...DEFAULT_CONFIG,
      ...baseConfig,
      ssgTemplate: '<html></html>',
    });
  });

  it('accepts ssgTemplate using the template variables', () => {
    const ssgTemplate =
      '<html <%~ it.html.attributes %>><body><%~ it.body.appHtml %><% it.assets.scripts.forEach((script) => { %><script src="<%= script %>"></script><% }); %></body></html>';
    expect(normalizeConfig({ssgTemplate})).toEqual({
      ...DEFAULT_CONFIG,
      ...baseConfig,
      ssgTemplate,
    });
  });

  it('rejects ssgTemplate using legacy template variables', () => {
    expect(() =>
      normalizeConfig({
        ssgTemplate:
          '<html <%~ it.htmlAttributes %>><head><%~ it.headTags %><% if (it.noIndex) { %>noindex<% } %></head><body><%~ it.appHtml %><% it.scripts.forEach((script) => { %><script src="<%= it.baseUrl %><%= script %>"></script><% }); %></body></html>',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: The Docusaurus config \`siteConfig.ssgTemplate\` uses template variables that have been renamed or removed:
      - \`it.appHtml\` => \`it.body.appHtml\`
      - \`it.htmlAttributes\` => \`it.html.attributes\`
      - \`it.headTags\` => \`it.head.pluginTags\`
      - \`it.scripts\` => \`it.assets.scripts\` (URLs including the baseUrl)
      - \`it.noIndex\` => removed: the \`<meta name="robots">\` tag is part of \`it.head.pageTags\`
      Please update your template.
      ]
    `);
  });

  it('rejects legacy siteConfig.ssrTemplate', () => {
    expect(() =>
      normalizeConfig({
        // @ts-expect-error: renamed option
        ssrTemplate: '<html></html>',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: The Docusaurus config \`siteConfig.ssrTemplate\` has been renamed to \`siteConfig.ssgTemplate\`. Please rename it in your site config.
      ]
    `);
  });
});

describe('url', () => {
  it('throws for non-string URLs', () => {
    expect(() =>
      normalizeConfig({
        // @ts-expect-error: test
        url: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "url" must be a string
      ]
    `);
  });

  it('throws for invalid URL', () => {
    expect(() =>
      normalizeConfig({
        url: 'mysite.com',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "mysite.com" does not look like a valid URL. Make sure it has a protocol; for example, "https://example.com".
      ]
    `);
  });

  it('normalizes URL', () => {
    expect(
      normalizeConfig({
        url: 'https://mysite.com/',
      }).url,
    ).toBe('https://mysite.com');
  });

  it('throws for non-string base URLs', () => {
    expect(() =>
      normalizeConfig({
        // @ts-expect-error: test
        baseUrl: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "baseUrl" must be a string
      ]
    `);
  });

  it('normalizes various base URLs', () => {
    expect(
      normalizeConfig({
        baseUrl: '',
      }).baseUrl,
    ).toBe('/');
    expect(
      normalizeConfig({
        baseUrl: 'noSlash',
      }).baseUrl,
    ).toBe('/noSlash/');
    expect(
      normalizeConfig({
        baseUrl: '/noSlash',
      }).baseUrl,
    ).toBe('/noSlash/');
    expect(
      normalizeConfig({
        baseUrl: 'noSlash/foo',
      }).baseUrl,
    ).toBe('/noSlash/foo/');
  });

  it('site url fails validation when using subpath', () => {
    const {error} = ConfigSchema.validate({
      ...baseConfig,
      url: 'https://mysite.com/someSubpath',
    });
    expect(error).toBeDefined();
    expect(error?.message).toBe(
      'The url is not supposed to contain a sub-path like "/someSubpath". Please use the baseUrl field for sub-paths.',
    );
  });
});

describe('headTags', () => {
  it('accepts headTags with tagName and attributes', () => {
    expect(() => {
      normalizeConfig({
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'icon',
              href: 'img/docusaurus.png',
            },
          },
        ],
      });
    }).not.toThrow();
  });

  it("throws error if headTags doesn't have tagName", () => {
    expect(() => {
      normalizeConfig({
        headTags: [
          {
            attributes: {
              rel: 'icon',
              href: 'img/docusaurus.png',
            },
          },
        ],
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "headTags[0].tagName" is required
      ]
    `);
  });

  it("throws error if headTags doesn't have attributes", () => {
    expect(() => {
      normalizeConfig({
        headTags: [
          {
            tagName: 'link',
          },
        ],
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "headTags[0].attributes" is required
      ]
    `);
  });

  it('accepts headTags with a custom element without attributes', () => {
    expect(() =>
      normalizeConfig({
        headTags: [
          {
            tagName: 'my-custom-element',
            customElement: true,
          },
        ],
      }),
    ).not.toThrow();
  });

  it('throws error if headTags has invalid attribute values', () => {
    expect(() => {
      normalizeConfig({
        headTags: [
          {
            tagName: 'link',
            attributes: {
              // @ts-expect-error: invalid attribute value
              rel: 123,
              href: 'img/docusaurus.png',
            },
          },
        ],
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "headTags[0].attributes.rel" must be one of [string, boolean]
      ]
    `);
  });

  it('accepts headTags with boolean attributes', () => {
    expect(() => {
      normalizeConfig({
        headTags: [
          {
            tagName: 'script',
            attributes: {
              src: '/analytics.js',
              async: true,
            },
          },
        ],
      });
    }).not.toThrow();
  });
});

describe('css', () => {
  it("throws error if css doesn't have href", () => {
    expect(() => {
      normalizeConfig({
        stylesheets: ['https://somescript.com', {type: 'text/css'}],
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "stylesheets[1]" is invalid. A stylesheet must be a plain string (the href), or an object with at least a "href" property.
      ]
    `);
  });
});

describe('scripts', () => {
  it("throws error if scripts doesn't have src", () => {
    expect(() => {
      normalizeConfig({
        scripts: ['https://some.com', {}],
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "scripts[1]" is invalid. A script must be a plain string (the src), or an object with at least a "src" property.
      ]
    `);
  });
});

describe('onBrokenLinks', () => {
  it('throws for "error" reporting severity', () => {
    expect(() =>
      validateConfig(
        {
          title: 'Site',
          url: 'https://example.com',
          baseUrl: '/',
          onBrokenLinks: 'error',
        },
        'docusaurus.config.js',
      ),
    ).toThrowErrorMatchingSnapshot();
  });
});

describe('i18n', () => {
  function normalizeI18n(
    i18n: DeepPartial<I18nConfig> | undefined,
  ): I18nConfig {
    return normalizeConfig({i18n}).i18n;
  }

  it('accepts undefined object', () => {
    expect(normalizeI18n(undefined)).toEqual(DEFAULT_CONFIG.i18n);
  });

  it('rejects empty object', () => {
    expect(() => normalizeI18n({})).toThrowErrorMatchingInlineSnapshot(`
      [Error: "i18n.defaultLocale" is required
      "i18n.locales" is required
      ]
    `);
  });

  it('accepts minimal i18n config', () => {
    expect(normalizeI18n({defaultLocale: 'fr', locales: ['fr']})).toEqual({
      defaultLocale: 'fr',
      localeConfigs: {},
      locales: ['fr'],
      path: 'i18n',
    });
  });

  describe('locale config', () => {
    function normalizeLocaleConfig(
      localeConfig?: Partial<I18nLocaleConfig>,
    ): Partial<I18nLocaleConfig> | undefined {
      return normalizeConfig({
        i18n: {
          defaultLocale: 'fr',
          locales: ['fr'],
          localeConfigs: {
            fr: localeConfig,
          },
        },
      }).i18n.localeConfigs.fr;
    }

    it('accepts undefined locale config', () => {
      expect(normalizeLocaleConfig(undefined)).toBeUndefined();
    });

    it('accepts empty locale config', () => {
      expect(normalizeLocaleConfig({})).toEqual({});
    });

    describe('url', () => {
      it('accepts undefined', () => {
        expect(normalizeLocaleConfig({url: undefined})).toEqual({
          url: undefined,
        });
      });

      it('rejects empty', () => {
        expect(() => normalizeLocaleConfig({url: ''}))
          .toThrowErrorMatchingInlineSnapshot(`
            [Error: "i18n.localeConfigs.fr.url" is not allowed to be empty
            ]
          `);
      });

      it('accepts valid url', () => {
        expect(
          normalizeLocaleConfig({url: 'https://fr.docusaurus.io'}),
        ).toEqual({
          url: 'https://fr.docusaurus.io',
        });
      });

      it('accepts valid url and removes trailing slash', () => {
        expect(
          normalizeLocaleConfig({url: 'https://fr.docusaurus.io/'}),
        ).toEqual({
          url: 'https://fr.docusaurus.io',
        });
      });
    });

    describe('baseUrl', () => {
      it('accepts undefined baseUrl', () => {
        expect(normalizeLocaleConfig({baseUrl: undefined})).toEqual({
          baseUrl: undefined,
        });
      });

      it('accepts empty baseUrl', () => {
        expect(normalizeLocaleConfig({baseUrl: ''})).toEqual({
          baseUrl: '/',
        });
      });

      it('accepts regular baseUrl', () => {
        expect(normalizeLocaleConfig({baseUrl: '/myBase/Url/'})).toEqual({
          baseUrl: '/myBase/Url/',
        });
      });

      it('accepts baseUrl without leading/trailing slashes', () => {
        expect(normalizeLocaleConfig({baseUrl: 'myBase/Url'})).toEqual({
          baseUrl: '/myBase/Url/',
        });
      });

      it('accepts translate true', () => {
        expect(normalizeLocaleConfig({translate: true})).toEqual({
          translate: true,
        });
      });
    });
  });
});

describe('markdown', () => {
  function normalizeMarkdown(
    markdown: DeepPartial<MarkdownConfig> | undefined,
  ): MarkdownConfig {
    return normalizeConfig({markdown}).markdown;
  }

  it('accepts undefined object', () => {
    expect(normalizeMarkdown(undefined)).toEqual(DEFAULT_CONFIG.markdown);
  });

  it('accepts empty object', () => {
    expect(normalizeMarkdown({})).toEqual(DEFAULT_CONFIG.markdown);
  });

  it('disables all mdx1Compat options by default', () => {
    expect(normalizeMarkdown({}).mdx1Compat).toEqual({
      comments: false,
      admonitions: false,
      headingIds: false,
    });
  });

  it('accepts valid markdown object', () => {
    const markdown: Config['markdown'] = {
      format: 'md',
      mermaid: true,
      emoji: false,
      parseFrontMatter: async (params) =>
        params.defaultParseFrontMatter(params),
      preprocessor: ({fileContent}) => fileContent,
      mdx1Compat: {
        comments: false,
        admonitions: true,
        headingIds: false,
      },
      anchors: {
        maintainCase: true,
      },
      remarkRehypeOptions: {
        footnoteLabel: 'Notes de bas de page',
        // @ts-expect-error: we don't validate it on purpose
        anyKey: 'heck we accept it on purpose',
      },
      hooks: {
        onBrokenMarkdownLinks: 'log',
        onBrokenMarkdownImages: 'warn',
        onUnusedMarkdownDirectives: 'warn',
      },
    };
    expect(normalizeMarkdown(markdown)).toEqual(markdown);
  });

  it('accepts partial markdown object', () => {
    const markdown: DeepPartial<Config['markdown']> = {
      mdx1Compat: {
        admonitions: true,
        headingIds: false,
      },
    };
    expect(normalizeMarkdown(markdown)).toEqual({
      ...DEFAULT_CONFIG.markdown,
      ...markdown,
      mdx1Compat: {
        ...DEFAULT_CONFIG.markdown.mdx1Compat,
        ...markdown.mdx1Compat,
      },
    });
  });

  it('throw for preprocessor bad arity', () => {
    expect(() =>
      normalizeConfig({
        markdown: {preprocessor: () => 'content'},
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "markdown.preprocessor" must have an arity of 1
      ]
    `);
    expect(() =>
      normalizeMarkdown(
        // @ts-expect-error: types forbid this
        {preprocessor: (arg1, arg2) => String(arg1) + String(arg2)},
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "markdown.preprocessor" must have an arity of 1
      ]
    `);
  });

  it('accepts undefined markdown format', () => {
    expect(normalizeMarkdown({format: undefined}).format).toBe('mdx');
  });

  it('throw for bad markdown format', () => {
    expect(() =>
      normalizeMarkdown({
        // @ts-expect-error: bad value
        format: null,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "markdown.format" must be one of [mdx, md, detect]
      "markdown.format" must be a string
      ]
    `);
    expect(() =>
      normalizeMarkdown(
        // @ts-expect-error: bad value
        {format: 'xyz'},
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "markdown.format" must be one of [mdx, md, detect]
      ]
    `);
  });

  it('throw for null object', () => {
    expect(() => {
      normalizeMarkdown(
        // @ts-expect-error: bad value
        null,
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "markdown" must be of type object
      ]
    `);
  });

  describe('emoji', () => {
    it('accepts emoji boolean true', () => {
      expect(
        normalizeMarkdown({
          emoji: true,
        }).emoji,
      ).toBe(true);
    });

    it('accepts emoji boolean false', () => {
      expect(
        normalizeMarkdown({
          emoji: false,
        }).emoji,
      ).toBe(false);
    });

    it('defaults emoji to true when undefined', () => {
      expect(normalizeMarkdown({}).emoji).toBe(true);
    });

    it('throw for string emoji value', () => {
      expect(() =>
        normalizeMarkdown({
          // @ts-expect-error: bad value
          emoji: 'yes',
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "markdown.emoji" must be a boolean
        ]
      `);
    });

    it('throw for number emoji value', () => {
      expect(() =>
        normalizeConfig({
          markdown: {
            // @ts-expect-error: bad value
            emoji: 1,
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "markdown.emoji" must be a boolean
        ]
      `);
    });
  });

  describe('hooks', () => {
    function normalizeHooks(hooks: DeepPartial<MarkdownHooks>): MarkdownHooks {
      return normalizeMarkdown({
        hooks,
      }).hooks;
    }

    describe('onBrokenMarkdownLinks', () => {
      function normalizeValue(
        onBrokenMarkdownLinks?: MarkdownHooks['onBrokenMarkdownLinks'],
      ) {
        return normalizeHooks({
          onBrokenMarkdownLinks,
        }).onBrokenMarkdownLinks;
      }

      it('accepts undefined', () => {
        expect(normalizeValue(undefined)).toBe('warn');
      });

      it('accepts severity level', () => {
        expect(normalizeValue('log')).toBe('log');
      });

      it('rejects number', () => {
        expect(() =>
          normalizeValue(
            // @ts-expect-error: bad value
            42,
          ),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: "markdown.hooks.onBrokenMarkdownLinks" does not match any of the allowed types
          ]
        `);
      });

      it('accepts function', () => {
        expect(normalizeValue(() => {})).toBeInstanceOf(Function);
      });

      it('rejects null', () => {
        expect(() =>
          normalizeValue(
            // @ts-expect-error: bad value
            null,
          ),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: "markdown.hooks.onBrokenMarkdownLinks" does not match any of the allowed types
          ]
        `);
      });

      it('rejects legacy siteConfig.onBrokenMarkdownLinks', () => {
        expect(() =>
          normalizeConfig({
            // @ts-expect-error: removed option
            onBrokenMarkdownLinks: 'log',
          }),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: The Docusaurus config \`siteConfig.onBrokenMarkdownLinks\` has been removed. Please move this option to \`siteConfig.markdown.hooks.onBrokenMarkdownLinks\` instead.
          ]
        `);
      });
    });

    describe('onBrokenMarkdownImages', () => {
      function normalizeValue(
        onBrokenMarkdownImages?: MarkdownHooks['onBrokenMarkdownImages'],
      ) {
        return normalizeHooks({
          onBrokenMarkdownImages,
        }).onBrokenMarkdownImages;
      }

      it('accepts undefined', () => {
        expect(normalizeValue(undefined)).toBe('throw');
      });

      it('accepts severity level', () => {
        expect(normalizeValue('log')).toBe('log');
      });

      it('rejects number', () => {
        expect(() =>
          normalizeValue(
            // @ts-expect-error: bad value
            42,
          ),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: "markdown.hooks.onBrokenMarkdownImages" does not match any of the allowed types
          ]
        `);
      });

      it('accepts function', () => {
        expect(normalizeValue(() => {})).toBeInstanceOf(Function);
      });

      it('rejects null', () => {
        expect(() =>
          normalizeValue(
            // @ts-expect-error: bad value
            null,
          ),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: "markdown.hooks.onBrokenMarkdownImages" does not match any of the allowed types
          ]
        `);
      });
    });

    describe('onUnusedMarkdownDirectives', () => {
      function normalizeValue(
        onUnusedMarkdownDirectives?: MarkdownHooks['onUnusedMarkdownDirectives'],
      ) {
        return normalizeHooks({
          onUnusedMarkdownDirectives,
        }).onUnusedMarkdownDirectives;
      }

      it('accepts undefined', () => {
        expect(normalizeValue(undefined)).toBe('warn');
      });

      it('accepts severity level', () => {
        expect(normalizeValue('log')).toBe('log');
      });

      it('rejects number', () => {
        expect(() =>
          normalizeValue(
            // @ts-expect-error: bad value
            42,
          ),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: "markdown.hooks.onUnusedMarkdownDirectives" does not match any of the allowed types
          ]
        `);
      });

      it('accepts function', () => {
        expect(normalizeValue(() => {})).toBeInstanceOf(Function);
      });

      it('rejects null', () => {
        expect(() =>
          normalizeValue(
            // @ts-expect-error: bad value
            null,
          ),
        ).toThrowErrorMatchingInlineSnapshot(`
          [Error: "markdown.hooks.onUnusedMarkdownDirectives" does not match any of the allowed types
          ]
        `);
      });
    });
  });
});

describe('plugins', () => {
  // Only here to verify typing
  function ensurePlugins(plugins: PluginConfig[]): PluginConfig[] {
    return plugins;
  }

  it.each([
    ['should throw error if plugins is not array', {}],
    [
      "should throw error if plugins is not a string and it's not an array #1",
      [123],
    ],
    [
      'should throw error if plugins is not an array of [string, object][] #1',
      [['example/path', 'wrong parameter here']],
    ],
    [
      'should throw error if plugins is not an array of [string, object][] #2',
      [[{}, 'example/path']],
    ],
    [
      'should throw error if plugins is not an array of [string, object][] #3',
      [[{}, {}]],
    ],
  ])(`%s for the input of: %p`, (_message, plugins) => {
    expect(() => {
      normalizeConfig({
        // @ts-expect-error: test
        plugins,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it.each([
    ['should accept [string] for plugins', ensurePlugins(['plain/string'])],
    [
      'should accept string[] for plugins',
      ensurePlugins(['plain/string', 'another/plain/string/path']),
    ],
    [
      'should accept [string, object] for plugins',
      ensurePlugins([['plain/string', {it: 'should work'}]]),
    ],
    [
      'should accept [string, object][] for plugins',
      ensurePlugins([
        ['plain/string', {it: 'should work'}],
        ['this/should/work', {too: 'yes'}],
      ]),
    ],
    [
      'should accept ([string, object]|string)[] for plugins',
      ensurePlugins([
        'plain/string',
        ['plain', {it: 'should work'}],
        ['this/should/work', {too: 'yes'}],
      ]),
    ],
    [
      'should accept function returning null',
      ensurePlugins([
        function plugin() {
          return null;
        },
      ]),
    ],
    [
      'should accept function returning plugin',
      ensurePlugins([
        function plugin() {
          return {name: 'plugin'};
        },
      ]),
    ],
    [
      'should accept function returning plugin or null',
      ensurePlugins([
        function plugin() {
          return Math.random() > 0.5 ? null : {name: 'plugin'};
        },
      ]),
    ],
    [
      'should accept async function returning null',
      ensurePlugins([
        async function plugin() {
          return null;
        },
      ]),
    ],
    [
      'should accept async function returning plugin',
      ensurePlugins([
        async function plugin() {
          return {name: 'plugin'};
        },
      ]),
    ],
    [
      'should accept function returning plugin or null',
      ensurePlugins([
        async function plugin() {
          return Math.random() > 0.5 ? null : {name: 'plugin'};
        },
      ]),
    ],
    [
      'should accept [function, object] for plugin',
      [[() => {}, {it: 'should work'}]],
    ],
    [
      'should accept false/null for plugin',
      ensurePlugins([false as const, null, 'classic']),
    ],
  ])(`%s for the input of: %p`, (_message, plugins) => {
    expect(() => {
      normalizeConfig({
        plugins,
      } as Config);
    }).not.toThrow();
  });
});

describe('themes', () => {
  it.each([
    ['should throw error if themes is not array', {}],
    [
      "should throw error if themes is not a string and it's not an array #1",
      [123],
    ],
    [
      'should throw error if themes is not an array of [string, object][] #1',
      [['example/path', 'wrong parameter here']],
    ],
    [
      'should throw error if themes is not an array of [string, object][] #2',
      [[{}, 'example/path']],
    ],
    [
      'should throw error if themes is not an array of [string, object][] #3',
      [[{}, {}]],
    ],
  ])(`%s for the input of: %p`, (_message, themes) => {
    expect(() => {
      normalizeConfig({
        // @ts-expect-error: test
        themes,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it.each([
    ['should accept [string] for themes', ['plain/string']],
    [
      'should accept string[] for themes',
      ['plain/string', 'another/plain/string/path'],
    ],
    [
      'should accept [string, object] for themes',
      [['plain/string', {it: 'should work'}]],
    ],
    [
      'should accept [string, object][] for themes',
      [
        ['plain/string', {it: 'should work'}],
        ['this/should/work', {too: 'yes'}],
      ],
    ],
    [
      'should accept ([string, object]|string)[] for themes',
      [
        'plain/string',
        ['plain', {it: 'should work'}],
        ['this/should/work', {too: 'yes'}],
      ],
    ],
    ['should accept function for theme', [function theme() {}]],
    [
      'should accept [function, object] for theme',
      [[function theme() {}, {it: 'should work'}]],
    ],
    ['should accept false/null for themes', [false, null, 'classic']],
  ])(`%s for the input of: %p`, (_message, themes) => {
    expect(() => {
      normalizeConfig({
        themes,
      } as Config);
    }).not.toThrow();
  });

  it('throws error if themes is not array', () => {
    expect(() => {
      normalizeConfig({
        // @ts-expect-error: test
        themes: {},
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "themes" must be an array
      ]
    `);
  });
});

describe('presets', () => {
  it('throws error if presets is not array', () => {
    expect(() => {
      normalizeConfig({
        // @ts-expect-error: test
        presets: {},
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "presets" must be an array
      ]
    `);
  });

  it('throws error if presets looks invalid', () => {
    expect(() => {
      normalizeConfig({
        // @ts-expect-error: test
        presets: [() => {}],
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: "presets[0]" does not look like a valid preset config. A preset config entry should be one of:
      - A tuple of [presetName, options], like \`["classic", { blog: false }]\`, or
      - A simple string, like \`"classic"\`
      ]
    `);
  });

  it('accepts presets as false / null', () => {
    expect(() => {
      normalizeConfig({
        presets: [false, null, 'classic'],
      });
    }).not.toThrow();
  });
});

describe('storage', () => {
  function storageContaining(storage: Partial<StorageConfig>) {
    return expect.objectContaining({
      storage: expect.objectContaining(storage),
    });
  }

  it('accepts storage - undefined', () => {
    expect(
      normalizeConfig({
        storage: undefined,
      }),
    ).toEqual(storageContaining(DEFAULT_STORAGE_CONFIG));
  });

  it('accepts storage - empty', () => {
    expect(
      normalizeConfig({
        storage: {},
      }),
    ).toEqual(storageContaining(DEFAULT_STORAGE_CONFIG));
  });

  it('accepts storage - full', () => {
    const storage: StorageConfig = {
      type: 'sessionStorage',
      namespace: 'myNamespace',
    };
    expect(
      normalizeConfig({
        storage,
      }),
    ).toEqual(storageContaining(storage));
  });

  it('rejects storage - boolean', () => {
    // @ts-expect-error: invalid
    const storage: Partial<StorageConfig> = true;
    expect(() =>
      normalizeConfig({
        storage,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "storage" must be of type object
      ]
    `);
  });

  it('rejects storage - number', () => {
    // @ts-expect-error: invalid
    const storage: Partial<StorageConfig> = 42;
    expect(() =>
      normalizeConfig({
        storage,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "storage" must be of type object
      ]
    `);
  });

  it('rejects future.experimental_storage', () => {
    expect(() =>
      normalizeConfig({
        future: {
          // @ts-expect-error: testing removed config
          experimental_storage: {
            type: 'sessionStorage',
            namespace: true,
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: The Docusaurus config \`future.experimental_storage\` has been promoted to a stable top-level \`storage\` config attribute. Please move your storage config to the top level.
      ]
    `);
  });

  it('rejects future.experimental_faster', () => {
    expect(() =>
      normalizeConfig({
        future: {
          // @ts-expect-error: testing removed config
          experimental_faster: true,
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: The Docusaurus config \`future.experimental_faster\` has been removed. Docusaurus now uses Rspack by default. To keep using Webpack and Babel (deprecated), use \`siteConfig.webpack: true\`.
      ]
    `);
  });

  describe('type', () => {
    it('accepts type', () => {
      const storage: Partial<StorageConfig> = {
        type: 'sessionStorage',
      };
      expect(
        normalizeConfig({
          storage,
        }),
      ).toEqual(
        storageContaining({
          ...DEFAULT_STORAGE_CONFIG,
          ...storage,
        }),
      );
    });

    it('accepts type - undefined', () => {
      const storage: Partial<StorageConfig> = {
        type: undefined,
      };
      expect(
        normalizeConfig({
          storage,
        }),
      ).toEqual(storageContaining({type: 'localStorage'}));
    });

    it('rejects type - null', () => {
      // @ts-expect-error: invalid
      const storage: Partial<StorageConfig> = {type: 42};
      expect(() =>
        normalizeConfig({
          storage,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "storage.type" must be one of [localStorage, sessionStorage]
        "storage.type" must be a string
        ]
      `);
    });

    it('rejects type - number', () => {
      // @ts-expect-error: invalid
      const storage: Partial<StorageConfig> = {type: 42};
      expect(() =>
        normalizeConfig({
          storage,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "storage.type" must be one of [localStorage, sessionStorage]
        "storage.type" must be a string
        ]
      `);
    });

    it('rejects type - invalid enum value', () => {
      // @ts-expect-error: invalid
      const storage: Partial<StorageConfig> = {type: 'badType'};
      expect(() =>
        normalizeConfig({
          storage,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "storage.type" must be one of [localStorage, sessionStorage]
        ]
      `);
    });
  });

  describe('namespace', () => {
    it('accepts namespace - boolean', () => {
      const storage: Partial<StorageConfig> = {
        namespace: true,
      };
      expect(
        normalizeConfig({
          storage,
        }),
      ).toEqual(storageContaining(storage));
    });

    it('accepts namespace - string', () => {
      const storage: Partial<StorageConfig> = {
        namespace: 'myNamespace',
      };
      expect(
        normalizeConfig({
          storage,
        }),
      ).toEqual(storageContaining(storage));
    });

    it('defaults namespace to true', () => {
      expect(
        normalizeConfig({
          storage: {},
        }),
      ).toEqual(storageContaining({namespace: true}));
    });

    it('rejects namespace - null', () => {
      // @ts-expect-error: bad value
      const storage: Partial<StorageConfig> = {namespace: null};
      expect(() =>
        normalizeConfig({
          storage,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "storage.namespace" must be one of [string, boolean]
        ]
      `);
    });

    it('rejects namespace - number', () => {
      // @ts-expect-error: invalid
      const storage: Partial<StorageConfig> = {namespace: 42};
      expect(() =>
        normalizeConfig({
          storage,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "storage.namespace" must be one of [string, boolean]
        ]
      `);
    });
  });
});

describe('vcs', () => {
  function vcsContaining(vcs: Partial<VcsConfig>) {
    return expect.objectContaining({
      vcs: expect.objectContaining(vcs),
    });
  }

  describe('base', () => {
    it('accepts vcs - undefined', () => {
      expect(
        normalizeConfig({
          vcs: undefined,
        }),
      ).toEqual(expect.objectContaining({vcs: getVcsPreset('default')}));
    });

    it('accepts vcs - true', () => {
      expect(
        normalizeConfig({
          vcs: true,
        }),
      ).toEqual(expect.objectContaining({vcs: getVcsPreset('default')}));
    });

    it('accepts vcs - false', () => {
      expect(
        normalizeConfig({
          vcs: false,
        }),
      ).toEqual(expect.objectContaining({vcs: getVcsPreset('disabled')}));
    });
  });

  describe('presets', () => {
    it('accepts git-ad-hoc', () => {
      const presetName: VcsPreset = 'git-ad-hoc';
      expect(
        normalizeConfig({
          vcs: presetName,
        }),
      ).toEqual(vcsContaining(getVcsPreset(presetName)));
    });

    it('accepts git-eager', () => {
      const presetName: VcsPreset = 'git-eager';
      expect(
        normalizeConfig({
          vcs: presetName,
        }),
      ).toEqual(vcsContaining(getVcsPreset(presetName)));
    });

    it('accepts default-v3', () => {
      const presetName: VcsPreset = 'default-v3';
      expect(
        normalizeConfig({
          vcs: presetName,
        }),
      ).toEqual(vcsContaining(getVcsPreset(presetName)));
    });

    it('accepts default', () => {
      const presetName: VcsPreset = 'default';
      expect(
        normalizeConfig({
          vcs: presetName,
        }),
      ).toEqual(vcsContaining(getVcsPreset(presetName)));
    });

    it('accepts hardcoded', () => {
      const presetName: VcsPreset = 'hardcoded';
      expect(
        normalizeConfig({
          vcs: presetName,
        }),
      ).toEqual(vcsContaining(getVcsPreset(presetName)));
    });

    it('rejects unknown preset name', () => {
      // @ts-expect-error: invalid on purpose
      const presetName: VcsPreset = 'unknown-preset-name';
      expect(() =>
        normalizeConfig({
          vcs: presetName,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "vcs" failed custom validation because VCS config preset name 'unknown-preset-name' is not valid.
        ]
      `);
    });
  });

  describe('object config', () => {
    it('accepts vcs - full', () => {
      const vcs: VcsConfig = {
        initialize: (_params) => {},
        getFileCreationInfo: async (_filePath) => null,
        getFileLastUpdateInfo: async (_filePath) => null,
      };
      expect(
        normalizeConfig({
          vcs: vcs,
        }),
      ).toEqual(vcsContaining(vcs));
    });

    it('rejects vcs - empty', () => {
      expect(() =>
        normalizeConfig({
          vcs: {},
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "vcs" failed custom validation because "initialize" is required
        ]
      `);
    });

    it('accepts vcs - bad initialize() arity', () => {
      const vcs: VcsConfig = {
        // @ts-expect-error: invalid arity
        initialize: (_params, _extraParam) => {},
        getFileCreationInfo: async (_filePath) => null,
        getFileLastUpdateInfo: async (_filePath) => null,
      };
      expect(() =>
        normalizeConfig({
          vcs: vcs,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "vcs" failed custom validation because "initialize" must have an arity lesser or equal to 1
        ]
      `);
    });

    it('accepts vcs - bad getFileCreationInfo() arity', () => {
      const vcs: VcsConfig = {
        initialize: (_params) => {},
        // @ts-expect-error: invalid arity
        getFileCreationInfo: async (_filePath, _extraParam) => null,
        getFileLastUpdateInfo: async (_filePath) => null,
      };
      expect(() =>
        normalizeConfig({
          vcs: vcs,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "vcs" failed custom validation because "getFileCreationInfo" must have an arity of 1
        ]
      `);
    });

    it('accepts vcs - bad getFileLastUpdateInfo() arity', () => {
      const vcs: VcsConfig = {
        initialize: (_params) => {},
        getFileCreationInfo: async (_filePath) => null,
        // @ts-expect-error: invalid arity
        getFileLastUpdateInfo: async (_filePath, _extraParam) => null,
      };
      expect(() =>
        normalizeConfig({
          vcs: vcs,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "vcs" failed custom validation because "getFileLastUpdateInfo" must have an arity of 1
        ]
      `);
    });
  });
});

describe('future', () => {
  function futureContaining(future: Partial<FutureConfig>) {
    return expect.objectContaining({
      future: expect.objectContaining(future),
    });
  }

  it('accepts future - undefined', () => {
    expect(
      normalizeConfig({
        future: undefined,
      }),
    ).toEqual(futureContaining(DEFAULT_FUTURE_CONFIG));
  });

  it('accepts future - empty', () => {
    expect(
      normalizeConfig({
        future: {},
      }),
    ).toEqual(futureContaining(DEFAULT_FUTURE_CONFIG));
  });

  it('accepts future - full', () => {
    const future: DocusaurusConfig['future'] = {
      experimental_router: 'hash',
    };
    expect(
      normalizeConfig({
        future,
      }),
    ).toEqual(futureContaining(future));
  });

  it('rejects future - unknown key', () => {
    const future: Config['future'] = {
      // @ts-expect-error: invalid
      doesNotExistKey: {
        type: 'sessionStorage',
        namespace: 'myNamespace',
      },
    };
    expect(() =>
      normalizeConfig({
        future,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: These field(s) ("future.doesNotExistKey",) are not recognized in docusaurus.config.js.
      If you still want these fields to be in your configuration, put them in the "customFields" field.
      See https://docusaurus.io/docs/api/docusaurus-config/#customfields]
    `);
  });

  describe('router', () => {
    it('accepts router - undefined', () => {
      expect(
        normalizeConfig({
          future: {
            experimental_router: undefined,
          },
        }),
      ).toEqual(futureContaining({experimental_router: 'browser'}));
    });

    it('accepts router - hash', () => {
      expect(
        normalizeConfig({
          future: {
            experimental_router: 'hash',
          },
        }),
      ).toEqual(futureContaining({experimental_router: 'hash'}));
    });

    it('accepts router - browser', () => {
      expect(
        normalizeConfig({
          future: {
            experimental_router: 'browser',
          },
        }),
      ).toEqual(futureContaining({experimental_router: 'browser'}));
    });

    it('rejects router - invalid enum value', () => {
      // @ts-expect-error: invalid
      const router: FutureConfig['experimental_router'] = 'badRouter';
      expect(() =>
        normalizeConfig({
          future: {
            experimental_router: router,
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "future.experimental_router" must be one of [browser, hash]
        ]
      `);
    });

    it('rejects router - null', () => {
      // @ts-expect-error: invalid
      const router: FutureConfig['experimental_router'] = null;
      expect(() =>
        normalizeConfig({
          future: {
            experimental_router: router,
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "future.experimental_router" must be one of [browser, hash]
        "future.experimental_router" must be a string
        ]
      `);
    });

    it('rejects router - number', () => {
      // @ts-expect-error: invalid
      const router: FutureConfig['experimental_router'] = 42;
      expect(() =>
        normalizeConfig({
          future: {
            experimental_router: router,
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: "future.experimental_router" must be one of [browser, hash]
        "future.experimental_router" must be a string
        ]
      `);
    });
  });

  it('rejects future.faster', () => {
    expect(() =>
      normalizeConfig({
        future: {
          // @ts-expect-error: testing removed config
          faster: {rspackBundler: true},
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: The Docusaurus config \`future.faster\` has been removed. Docusaurus now uses Rspack by default. To keep using Webpack and Babel (deprecated), use \`siteConfig.webpack: true\`.
      ]
    `);
  });

  it('rejects removed future.v4', () => {
    expect(() =>
      normalizeConfig({
        future: {
          // @ts-expect-error: testing removed config
          v4: true,
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: These field(s) ("future.v4",) are not recognized in docusaurus.config.js.
      If you still want these fields to be in your configuration, put them in the "customFields" field.
      See https://docusaurus.io/docs/api/docusaurus-config/#customfields]
    `);
  });
});

describe('webpack', () => {
  it('accepts undefined', () => {
    expect(normalizeConfig({webpack: undefined}).webpack).toBeUndefined();
  });

  it('accepts false', () => {
    expect(normalizeConfig({webpack: false}).webpack).toBeUndefined();
  });

  it('accepts true', () => {
    expect(normalizeConfig({webpack: true}).webpack).toEqual({});
  });

  it('accepts empty object', () => {
    expect(normalizeConfig({webpack: {}}).webpack).toEqual({});
  });

  it('accepts jsLoader', () => {
    expect(normalizeConfig({webpack: {jsLoader: 'babel'}}).webpack).toEqual({
      jsLoader: 'babel',
    });
  });

  it('rejects invalid jsLoader', () => {
    expect(() =>
      normalizeConfig({
        // @ts-expect-error: invalid
        webpack: {jsLoader: 'swc'},
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "webpack.jsLoader" must be one of [babel, function]
      ]
    `);
  });

  it('rejects number', () => {
    expect(() =>
      normalizeConfig({
        // @ts-expect-error: invalid
        webpack: 42,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: "webpack" must be one of [boolean, object]
      ]
    `);
  });
});
