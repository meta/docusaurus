/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import * as _ from 'lodash';

import {
  normalizeThemeConfig,
  normalizePluginOptions,
} from '@docusaurus/utils-validation';
import {themes} from 'prism-react-renderer';
import {ThemeConfigSchema, DEFAULT_CONFIG, validateOptions} from '../options';
import type {Options, PluginOptions} from '@docusaurus/theme-classic';
import type {ThemeConfig} from '@docusaurus/theme-common';
import type {Validate} from '@docusaurus/types';

function testValidateThemeConfig(partialThemeConfig: {[key: string]: unknown}) {
  return normalizeThemeConfig(ThemeConfigSchema, {
    ...DEFAULT_CONFIG,
    ...partialThemeConfig,
  });
}

function testValidateOptions(options: Options) {
  return validateOptions({
    validate: normalizePluginOptions as Validate<Options, PluginOptions>,
    options,
  });
}

describe('themeConfig', () => {
  it('accepts empty theme config', () => {
    expect(testValidateThemeConfig({})).toEqual(DEFAULT_CONFIG);
  });

  it('accepts valid theme config', () => {
    const userConfig = {
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        defaultLanguage: 'javaSCRIPT',
        additionalLanguages: ['koTLin', 'jaVa'],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: {start: 'highlight-start', end: 'highlight-end'},
          },
        ],
      },
      docs: {
        versionPersistence: 'localStorage',
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      blog: {
        sidebar: {
          groupByYear: false,
        },
      },
      announcementBar: {
        id: 'supports',
        content: 'pls support',
        backgroundColor: '#fff',
        textColor: '#000',
        isCloseable: true,
      },
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        style: 'primary',
        hideOnScroll: true,
        title: 'Docusaurus',
        logo: {
          alt: 'Docusaurus Logo',
          src: 'img/docusaurus.svg',
          srcDark: 'img/docusaurus_keytar.svg',
          target: '_self',
          className: 'navbar__logo__custom',
          style: {
            maxWidth: 42,
          },
        },
        items: [
          {
            type: 'docsVersionDropdown',
            position: 'left',
            dropdownItemsBefore: [],
            dropdownItemsAfter: [],
          },
          {
            to: 'docs/next/support',
            label: 'Community',
            position: 'left',
            activeBaseRegex: `docs/next/(support|team|resources)`,
            'aria-label': 'Community',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Introduction',
                to: 'docs',
              },
            ],
          },
        ],
        logo: {
          alt: 'Meta Open Source Logo',
          src: 'img/footer_logo.png',
          href: 'https://opensource.facebook.com',
          target: '_self',
          className: 'footer__logo__custom',
          style: {
            maxWidth: 42,
          },
        },
        copyright: `Copyright © ${new Date().getFullYear()} Facebook, Inc. Built with Docusaurus.`,
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
    };
    expect(testValidateThemeConfig(userConfig)).toEqual({
      ...DEFAULT_CONFIG,
      ...userConfig,
      prism: {
        ...userConfig.prism,
        // Modified/normalized values
        defaultLanguage: 'javascript',
        additionalLanguages: ['kotlin', 'java'],
      },
    });
  });

  it('allows possible types of navbar items', () => {
    const config = {
      navbar: {
        items: [
          // Doc link
          {
            type: 'doc',
            position: 'left',
            docId: 'intro',
            label: 'Introduction',
          },
          // Doc link with HTML as label
          {
            type: 'doc',
            position: 'left',
            docId: 'intro',
            html: '<b>Introduction</b>',
          },
          // Regular link
          {
            to: '/guide/',
            label: 'Guide',
            position: 'left',
            activeBaseRegex: '/guide/',
          },
          // Regular link with HTML as label
          {
            to: '/guide/',
            html: '<b>Guide</b>',
            position: 'left',
            activeBaseRegex: '/guide/',
          },
          // Regular dropdown
          {
            label: 'Community',
            position: 'right',
            items: [
              {
                label: 'Facebook',
                href: 'https://.facebook.com/',
                target: '_self',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
                className: 'github-link',
              },
            ],
          },
          // HTML-only
          {
            type: 'html',
            position: 'right',
            value: '<button>Give feedback</button>',
          },
          // Dropdown with label as HTML
          {
            type: 'dropdown',
            label: 'Tools <sup>new</sup>',
            position: 'left',
            items: [
              {
                type: 'html',
                value: '<b>Supported package managers</b>',
              },
              {
                type: 'doc',
                docId: 'npm',
                label: 'npm',
              },
              {
                to: '/yarn',
                label: 'Yarn',
              },
            ],
          },
          // Doc version dropdown
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
            dropdownItemsBefore: [
              {
                href: 'https://www.npmjs.com/package/docusaurus?activeTab=versions',
                label: 'Versions on npm',
                className: 'npm-styled',
                target: '_self',
              },
            ],
            dropdownItemsAfter: [
              {
                type: 'html',
                value: '<hr/>',
              },
              {
                to: '/versions',
                label: 'All versions',
                className: 'all_vers',
              },
            ],
          },
          // External link with custom data attribute
          {
            href: 'https://github.com/facebook/docusaurus',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
          // Docs version
          {
            type: 'docsVersion',
            position: 'left',
            label: 'Current version',
          },
          // Search with className
          {
            type: 'search',
            position: 'right',
            className: 'search-bar-wrapper',
          },
        ],
      },
    };
    expect(testValidateThemeConfig(config)).toEqual({
      ...DEFAULT_CONFIG,
      navbar: {
        ...DEFAULT_CONFIG.navbar,
        ...config.navbar,
      },
    });
  });

  it('accept "custom-" prefixed custom navbar item type', () => {
    const config = {
      navbar: {
        items: [
          {
            type: 'custom-x',
            position: 'left',
            xyz: 42,
          },
          {
            label: 'Dropdown with custom item',
            position: 'right',
            items: [
              {
                label: 'Facebook',
                href: 'https://.facebook.com/',
                target: '_self',
              },
              {
                type: 'custom-y',
                any: new Date(),
                prop: 42,
                isAccepted: true,
              },
            ],
          },
        ],
      },
    };
    expect(testValidateThemeConfig(config)).toEqual({
      ...DEFAULT_CONFIG,
      navbar: {
        ...DEFAULT_CONFIG.navbar,
        ...config.navbar,
      },
    });
  });

  it('rejects unknown navbar item type', () => {
    const config = {
      navbar: {
        items: [
          {
            type: 'joke',
            position: 'left',
            label: 'hahaha',
          },
        ],
      },
    };
    expect(() =>
      testValidateThemeConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: Bad navbar item type joke]`,
    );
  });

  it('rejects nested dropdowns', () => {
    const config = {
      navbar: {
        items: [
          {
            position: 'left',
            label: 'Nested',
            items: [
              {
                label: 'Still a dropdown',
                items: [
                  {
                    label: 'Should reject this',
                    to: '/rejected',
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    expect(() =>
      testValidateThemeConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: Nested dropdowns are not allowed]`,
    );
  });

  it('rejects nested dropdowns 2', () => {
    const config = {
      navbar: {
        items: [
          {
            position: 'left',
            label: 'Nested',
            items: [{type: 'docsVersionDropdown'}],
          },
        ],
      },
    };
    expect(() =>
      testValidateThemeConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: Nested dropdowns are not allowed]`,
    );
  });

  it('rejects position attribute within dropdown', () => {
    const config = {
      navbar: {
        items: [
          {
            position: 'left',
            label: 'Dropdown',
            items: [
              {
                label: 'Hi',
                position: 'left',
                to: '/link',
              },
            ],
          },
        ],
      },
    };
    expect(() =>
      testValidateThemeConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "navbar.items[0].items[0].position" is not allowed]`,
    );
  });

  it('gives friendly error when href and to coexist', () => {
    const config = {
      navbar: {
        items: [
          {
            position: 'left',
            label: 'Nested',
            to: '/link',
            href: 'http://example.com/link',
          },
        ],
      },
    };
    expect(() =>
      testValidateThemeConfig(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: One and only one between "to" and "href" should be provided]`,
    );
  });

  it('allows empty alt tags for the logo image in the header', () => {
    const altTagConfig = {
      navbar: {
        logo: {
          alt: '',
          src: '/arbitrary-logo.png',
        },
        hideOnScroll: false,
      },
    };
    expect(testValidateThemeConfig(altTagConfig)).toEqual({
      ...DEFAULT_CONFIG,
      navbar: {
        ...DEFAULT_CONFIG.navbar,
        ...altTagConfig.navbar,
      },
    });
  });

  it('allows empty alt tags for the logo image in the footer', () => {
    const partialConfig = {
      footer: {
        logo: {
          alt: '',
          src: '/arbitrary-logo.png',
        },
      },
    };
    const normalizedConfig = testValidateThemeConfig(partialConfig);

    expect(normalizedConfig).toEqual({
      ...normalizedConfig,
      footer: {
        ...normalizedConfig.footer,
        ...partialConfig.footer,
      },
    });
  });

  it('allows simple links in footer', () => {
    const partialConfig = {
      footer: {
        links: [
          {
            label: 'Privacy',
            href: 'https://opensource.facebook.com/legal/privacy/',
          },
          {
            label: 'Terms',
            href: 'https://opensource.facebook.com/legal/terms/',
          },
          {
            label: 'Cookie Policy',
            href: 'https://opensource.facebook.com/legal/cookie-policy/',
          },
        ],
      },
    };
    const normalizedConfig = testValidateThemeConfig(partialConfig);

    expect(normalizedConfig).toEqual({
      ...normalizedConfig,
      footer: {
        ...normalizedConfig.footer,
        ...partialConfig.footer,
      },
    });
  });

  it('allows footer column with no title', () => {
    const partialConfig = {
      footer: {
        links: [
          {
            items: [
              {
                label: 'Cookie Policy',
                href: 'https://opensource.facebook.com/legal/cookie-policy/',
              },
            ],
          },
        ],
      },
    };
    const normalizedConfig = testValidateThemeConfig(partialConfig);

    expect(normalizedConfig).toEqual({
      ...normalizedConfig,
      footer: {
        ...normalizedConfig.footer,
        ...partialConfig.footer,
        links: [
          {
            title: null, // Default value is important to distinguish simple footer from multi-column footer
            items: partialConfig.footer.links[0]!.items,
          },
        ],
      },
    });
  });

  it('rejects mix of simple and multi-column links in footer', () => {
    const partialConfig = {
      footer: {
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Introduction',
                to: 'docs',
              },
            ],
          },
          {
            label: 'Privacy',
            href: 'https://opensource.facebook.com/legal/privacy/',
          },
        ],
      },
    };

    expect(() =>
      testValidateThemeConfig(partialConfig),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: The footer must be either simple or multi-column, and not a mix of the two. See: https://docusaurus.io/docs/api/themes/configuration#footer-links]`,
    );
  });

  it('allows width and height specification for logo', () => {
    const altTagConfig = {
      navbar: {
        logo: {
          alt: '',
          src: '/arbitrary-logo.png',
          srcDark: '/arbitrary-dark-logo.png',
          width: '20px',
          height: '20%',
        },
      },
    };
    expect(testValidateThemeConfig(altTagConfig)).toEqual({
      ...DEFAULT_CONFIG,
      navbar: {
        ...DEFAULT_CONFIG.navbar,
        ...altTagConfig.navbar,
      },
    });
  });

  describe('prism config', () => {
    it('accepts a range of magic comments', () => {
      const prismConfig = {
        prism: {
          additionalLanguages: ['kotlin', 'java'],
          theme: themes.dracula,
          magicComments: [],
        },
      };
      expect(testValidateThemeConfig(prismConfig)).toEqual({
        ...DEFAULT_CONFIG,
        ...prismConfig,
      });
      const prismConfig2 = {
        prism: {
          additionalLanguages: [],
          theme: themes.dracula,
          magicComments: [
            {
              className: 'a',
              line: 'a-next-line',
            },
          ],
        },
      };
      expect(testValidateThemeConfig(prismConfig2)).toEqual({
        ...DEFAULT_CONFIG,
        ...prismConfig2,
      });
      const prismConfig3 = {
        prism: {
          additionalLanguages: [],
          theme: themes.dracula,
          magicComments: [
            {
              className: 'a',
              block: {start: 'a-start', end: 'a-end'},
            },
          ],
        },
      };
      expect(testValidateThemeConfig(prismConfig3)).toEqual({
        ...DEFAULT_CONFIG,
        ...prismConfig3,
      });
    });

    it('rejects incomplete magic comments', () => {
      expect(() =>
        testValidateThemeConfig({
          prism: {
            magicComments: [{className: 'a'}],
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "prism.magicComments[0]" must contain at least one of [line, block]]`,
      );
      expect(() =>
        testValidateThemeConfig({
          prism: {
            magicComments: [{className: 'a', block: {start: 'start'}}],
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "prism.magicComments[0].block.end" is required]`,
      );
    });
  });

  describe('color mode config', () => {
    const withDefaultValues = (colorMode?: ThemeConfig['colorMode']) =>
      _.merge({}, DEFAULT_CONFIG.colorMode, colorMode);

    it('max config', () => {
      const colorMode: ThemeConfig['colorMode'] = {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      };
      expect(testValidateThemeConfig({colorMode})).toEqual({
        ...DEFAULT_CONFIG,
        colorMode: withDefaultValues(colorMode),
      });
    });

    it('undefined config', () => {
      const colorMode = undefined;
      expect(testValidateThemeConfig({colorMode})).toEqual({
        ...DEFAULT_CONFIG,
        colorMode: withDefaultValues(colorMode),
      });
    });

    it('empty config', () => {
      const colorMode = {};
      expect(testValidateThemeConfig({colorMode})).toEqual({
        ...DEFAULT_CONFIG,
        colorMode: {
          ...DEFAULT_CONFIG.colorMode,
          ...colorMode,
        },
      });
    });
  });

  describe('tableOfContents', () => {
    it('accepts undefined', () => {
      const tableOfContents = undefined;
      expect(testValidateThemeConfig({tableOfContents})).toEqual({
        ...DEFAULT_CONFIG,
        tableOfContents: {
          minHeadingLevel: DEFAULT_CONFIG.tableOfContents.minHeadingLevel,
          maxHeadingLevel: DEFAULT_CONFIG.tableOfContents.maxHeadingLevel,
        },
      });
    });

    it('accepts empty', () => {
      const tableOfContents = {};
      expect(testValidateThemeConfig({tableOfContents})).toEqual({
        ...DEFAULT_CONFIG,
        tableOfContents: {
          minHeadingLevel: DEFAULT_CONFIG.tableOfContents.minHeadingLevel,
          maxHeadingLevel: DEFAULT_CONFIG.tableOfContents.maxHeadingLevel,
        },
      });
    });

    it('accepts min', () => {
      const tableOfContents = {
        minHeadingLevel: 3,
      };
      expect(testValidateThemeConfig({tableOfContents})).toEqual({
        ...DEFAULT_CONFIG,
        tableOfContents: {
          minHeadingLevel: 3,
          maxHeadingLevel: DEFAULT_CONFIG.tableOfContents.maxHeadingLevel,
        },
      });
    });

    it('accepts max', () => {
      const tableOfContents = {
        maxHeadingLevel: 5,
      };
      expect(testValidateThemeConfig({tableOfContents})).toEqual({
        ...DEFAULT_CONFIG,
        tableOfContents: {
          minHeadingLevel: DEFAULT_CONFIG.tableOfContents.minHeadingLevel,
          maxHeadingLevel: 5,
        },
      });
    });

    it('rejects min 2.5', () => {
      const tableOfContents = {
        minHeadingLevel: 2.5,
      };
      expect(() =>
        testValidateThemeConfig({tableOfContents}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tableOfContents.minHeadingLevel" must be an integer]`,
      );
    });

    it('rejects max 2.5', () => {
      const tableOfContents = {
        maxHeadingLevel: 2.5,
      };
      expect(() =>
        testValidateThemeConfig({tableOfContents}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tableOfContents.maxHeadingLevel" must be an integer]`,
      );
    });

    it('rejects min 1', () => {
      const tableOfContents = {
        minHeadingLevel: 1,
      };
      expect(() =>
        testValidateThemeConfig({tableOfContents}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tableOfContents.minHeadingLevel" must be greater than or equal to 2]`,
      );
    });

    it('rejects min 7', () => {
      const tableOfContents = {
        minHeadingLevel: 7,
      };
      expect(() =>
        testValidateThemeConfig({tableOfContents}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tableOfContents.minHeadingLevel" must be less than or equal to ref:maxHeadingLevel]`,
      );
    });

    it('rejects max 1', () => {
      const tableOfContents = {
        maxHeadingLevel: 1,
      };
      expect(() =>
        testValidateThemeConfig({tableOfContents}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tableOfContents.maxHeadingLevel" must be greater than or equal to 2]`,
      );
    });

    it('rejects max 7', () => {
      const tableOfContents = {
        maxHeadingLevel: 7,
      };
      expect(() =>
        testValidateThemeConfig({tableOfContents}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tableOfContents.maxHeadingLevel" must be less than or equal to 6]`,
      );
    });

    it('rejects min 5 + max 3', () => {
      const tableOfContents = {
        minHeadingLevel: 5,
        maxHeadingLevel: 3,
      };
      expect(() =>
        testValidateThemeConfig({tableOfContents}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tableOfContents.minHeadingLevel" must be less than or equal to ref:maxHeadingLevel]`,
      );
    });
  });

  describe('docsVersionDropdown', () => {
    describe('versions', () => {
      it('accepts array of strings', () => {
        const config = {
          navbar: {
            items: [
              {
                type: 'docsVersionDropdown',
                versions: ['current', '1.0'],
              },
            ],
          },
        };
        testValidateThemeConfig(config);
      });

      it('rejects empty array of strings', () => {
        const config = {
          navbar: {
            items: [
              {
                type: 'docsVersionDropdown',
                versions: [],
              },
            ],
          },
        };
        expect(() =>
          testValidateThemeConfig(config),
        ).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "navbar.items[0].versions" must contain at least 1 items]`,
        );
      });

      it('rejects array of non-strings', () => {
        const config = {
          navbar: {
            items: [
              {
                type: 'docsVersionDropdown',
                versions: [1, 2],
              },
            ],
          },
        };
        expect(() =>
          testValidateThemeConfig(config),
        ).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "navbar.items[0].versions[0]" must be a string]`,
        );
      });

      it('accepts dictionary of version objects', () => {
        const config = {
          navbar: {
            items: [
              {
                type: 'docsVersionDropdown',
                versions: {current: {}, '1.0': {label: '1.x'}},
              },
            ],
          },
        };
        testValidateThemeConfig(config);
      });

      it('rejects empty dictionary of objects', () => {
        const config = {
          navbar: {
            items: [
              {
                type: 'docsVersionDropdown',
                versions: {},
              },
            ],
          },
        };
        expect(() =>
          testValidateThemeConfig(config),
        ).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "navbar.items[0].versions" must have at least 1 key]`,
        );
      });

      it('rejects dictionary of invalid objects', () => {
        const config = {
          navbar: {
            items: [
              {
                type: 'docsVersionDropdown',
                versions: {current: {}, '1.0': {invalid: '1.x'}},
              },
            ],
          },
        };
        expect(() =>
          testValidateThemeConfig(config),
        ).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "navbar.items[0].versions.1.0.invalid" is not allowed]`,
        );
      });
    });
  });
});

describe('validateOptions', () => {
  describe('customCss config', () => {
    it('accepts customCss undefined', () => {
      expect(
        testValidateOptions({
          customCss: undefined,
        }),
      ).toEqual({
        id: 'default',
        customCss: [],
      });
    });

    it('accepts customCss string', () => {
      expect(
        testValidateOptions({
          customCss: './path/to/cssFile.css',
        }),
      ).toEqual({
        id: 'default',
        customCss: ['./path/to/cssFile.css'],
      });
    });

    it('accepts customCss string array', () => {
      expect(
        testValidateOptions({
          customCss: ['./path/to/cssFile.css', './path/to/cssFile2.css'],
        }),
      ).toEqual({
        id: 'default',
        customCss: ['./path/to/cssFile.css', './path/to/cssFile2.css'],
      });
    });

    it('rejects customCss number', () => {
      expect(() =>
        testValidateOptions({
          // @ts-expect-error: test
          customCss: 42,
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "customCss" must be a string or an array of strings]`,
      );
    });
  });
});
