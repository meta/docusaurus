/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {themes} from 'prism-react-renderer';
import {Joi, URISchema} from '@docusaurus/utils-validation';
import type {
  PropVersionItem,
  PropVersionItems,
} from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
import type {Options, PluginOptions} from '@docusaurus/theme-classic';
import type {ThemeConfig} from '@docusaurus/theme-common';
import type {
  ThemeConfigValidationContext,
  OptionValidationContext,
} from '@docusaurus/types';

const defaultPrismTheme = themes.palenight;

const DEFAULT_DOCS_CONFIG: ThemeConfig['docs'] = {
  versionPersistence: 'localStorage',
  sidebar: {
    hideable: false,
    autoCollapseCategories: false,
  },
};

const DocsSchema = Joi.object<ThemeConfig['docs']>({
  versionPersistence: Joi.string()
    .equal('localStorage', 'none')
    .default(DEFAULT_DOCS_CONFIG.versionPersistence),
  sidebar: Joi.object<ThemeConfig['docs']['sidebar']>({
    hideable: Joi.bool().default(DEFAULT_DOCS_CONFIG.sidebar.hideable),
    autoCollapseCategories: Joi.bool().default(
      DEFAULT_DOCS_CONFIG.sidebar.autoCollapseCategories,
    ),
  }).default(DEFAULT_DOCS_CONFIG.sidebar),
}).default(DEFAULT_DOCS_CONFIG);

const DEFAULT_BLOG_CONFIG: ThemeConfig['blog'] = {
  sidebar: {
    groupByYear: true,
  },
};

const BlogSchema = Joi.object<ThemeConfig['blog']>({
  sidebar: Joi.object<ThemeConfig['blog']['sidebar']>({
    groupByYear: Joi.bool().default(DEFAULT_BLOG_CONFIG.sidebar.groupByYear),
  }).default(DEFAULT_BLOG_CONFIG.sidebar),
}).default(DEFAULT_BLOG_CONFIG);

const DEFAULT_COLOR_MODE_CONFIG: ThemeConfig['colorMode'] = {
  defaultMode: 'light',
  disableSwitch: false,
  respectPrefersColorScheme: true,
};

export const DEFAULT_CONFIG: ThemeConfig = {
  colorMode: DEFAULT_COLOR_MODE_CONFIG,
  docs: DEFAULT_DOCS_CONFIG,
  blog: DEFAULT_BLOG_CONFIG,
  metadata: [],
  prism: {
    additionalLanguages: [],
    theme: defaultPrismTheme,
    magicComments: [
      {
        className: 'theme-code-block-highlighted-line',
        line: 'highlight-next-line',
        block: {start: 'highlight-start', end: 'highlight-end'},
      },
    ],
  },
  navbar: {
    hideOnScroll: false,
    items: [],
  },
  tableOfContents: {
    minHeadingLevel: 2,
    maxHeadingLevel: 3,
  },
};

const NavbarItemPosition = Joi.string().equal('left', 'right').default('left');

const NavbarItemBaseSchema = Joi.object({
  label: Joi.string(),
  html: Joi.string(),
  className: Joi.string(),
})
  .nand('html', 'label')
  // We allow any unknown attributes on the links (users may need additional
  // attributes like target, aria-role, data-customAttribute...)
  .unknown();

const DefaultNavbarItemSchema = NavbarItemBaseSchema.append({
  to: Joi.string(),
  href: URISchema,
  activeBasePath: Joi.string(),
  activeBaseRegex: Joi.string(),
  prependBaseUrlToHref: Joi.bool(),
  // This is only triggered in case of a nested dropdown
  items: Joi.forbidden().messages({
    'any.unknown': 'Nested dropdowns are not allowed',
  }),
})
  .xor('href', 'to')
  .messages({
    'object.xor': 'One and only one between "to" and "href" should be provided',
  });

const DocsVersionNavbarItemSchema = NavbarItemBaseSchema.append({
  type: Joi.string().equal('docsVersion').required(),
  to: Joi.string(),
  docsPluginId: Joi.string(),
});

const DocItemSchema = NavbarItemBaseSchema.append({
  type: Joi.string().equal('doc').required(),
  docId: Joi.string().required(),
  docsPluginId: Joi.string(),
});

const DocSidebarItemSchema = NavbarItemBaseSchema.append({
  type: Joi.string().equal('docSidebar').required(),
  sidebarId: Joi.string().required(),
  docsPluginId: Joi.string(),
});

const HtmlNavbarItemSchema = Joi.object({
  className: Joi.string(),
  type: Joi.string().equal('html').required(),
  value: Joi.string().required(),
});

// A temporary workaround to allow users to add custom navbar items
// See https://github.com/facebook/docusaurus/issues/7227
const CustomNavbarItemRegexp = /custom-.*/;
const CustomNavbarItemSchema = Joi.object({
  type: Joi.string().regex(CustomNavbarItemRegexp).required(),
}).unknown();

const itemWithType = (type: string | RegExp | undefined) => {
  // Because equal(undefined) is not supported :/
  const typeSchema =
    // eslint-disable-next-line no-nested-ternary
    type instanceof RegExp
      ? Joi.string().required().regex(type)
      : type
        ? Joi.string().required().equal(type)
        : Joi.string().forbidden();
  return Joi.object({
    type: typeSchema,
  })
    .unknown()
    .required();
};

const DropdownSubitemSchema = Joi.object({
  position: Joi.forbidden(),
}).when('.', {
  switch: [
    {
      is: itemWithType('docsVersion'),
      then: DocsVersionNavbarItemSchema,
    },
    {
      is: itemWithType('doc'),
      then: DocItemSchema,
    },
    {
      is: itemWithType('docSidebar'),
      then: DocSidebarItemSchema,
    },
    {
      is: itemWithType(undefined),
      then: DefaultNavbarItemSchema,
    },
    {
      is: itemWithType('html'),
      then: HtmlNavbarItemSchema,
    },
    {
      is: itemWithType(CustomNavbarItemRegexp),
      then: CustomNavbarItemSchema,
    },
    {
      is: Joi.alternatives().try(
        itemWithType('dropdown'),
        itemWithType('docsVersionDropdown'),
        itemWithType('localeDropdown'),
        itemWithType('search'),
      ),
      then: Joi.forbidden().messages({
        'any.unknown': 'Nested dropdowns are not allowed',
      }),
    },
  ],
  otherwise: Joi.forbidden().messages({
    'any.unknown': 'Bad navbar item type {.type}',
  }),
});

const DropdownNavbarItemSchema = NavbarItemBaseSchema.append({
  items: Joi.array().items(DropdownSubitemSchema).required(),
});

const DocsVersionDropdownNavbarItemSchema = NavbarItemBaseSchema.append({
  type: Joi.string().equal('docsVersionDropdown').required(),
  docsPluginId: Joi.string(),
  dropdownActiveClassDisabled: Joi.boolean(),
  dropdownItemsBefore: Joi.array().items(DropdownSubitemSchema).default([]),
  dropdownItemsAfter: Joi.array().items(DropdownSubitemSchema).default([]),
  versions: Joi.alternatives().try(
    Joi.array().items(Joi.string().min(1)).min(1),
    Joi.object<PropVersionItems>()
      .pattern(
        Joi.string().min(1),
        Joi.object<PropVersionItem>({
          label: Joi.string().min(1),
        }),
      )
      .min(1),
  ),
});

const LocaleDropdownNavbarItemSchema = NavbarItemBaseSchema.append({
  type: Joi.string().equal('localeDropdown').required(),
  dropdownItemsBefore: Joi.array().items(DropdownSubitemSchema).default([]),
  dropdownItemsAfter: Joi.array().items(DropdownSubitemSchema).default([]),
  queryString: Joi.string(),
});

const SearchItemSchema = Joi.object({
  type: Joi.string().equal('search').required(),
  className: Joi.string(),
});

const NavbarItemSchema = Joi.object({
  position: NavbarItemPosition,
}).when('.', {
  switch: [
    {
      is: itemWithType('docsVersion'),
      then: DocsVersionNavbarItemSchema,
    },
    {
      is: itemWithType('dropdown'),
      then: DropdownNavbarItemSchema,
    },
    {
      is: itemWithType('docsVersionDropdown'),
      then: DocsVersionDropdownNavbarItemSchema,
    },
    {
      is: itemWithType('doc'),
      then: DocItemSchema,
    },
    {
      is: itemWithType('docSidebar'),
      then: DocSidebarItemSchema,
    },
    {
      is: itemWithType('localeDropdown'),
      then: LocaleDropdownNavbarItemSchema,
    },
    {
      is: itemWithType('search'),
      then: SearchItemSchema,
    },
    {
      is: itemWithType('html'),
      then: HtmlNavbarItemSchema,
    },
    {
      is: itemWithType(CustomNavbarItemRegexp),
      then: CustomNavbarItemSchema,
    },
    {
      is: itemWithType(undefined),
      then: Joi.object().when('.', {
        // Dropdown item can be specified without type field
        is: Joi.object({
          items: Joi.array().required(),
        }).unknown(),
        then: DropdownNavbarItemSchema,
        otherwise: DefaultNavbarItemSchema,
      }),
    },
  ],
  otherwise: Joi.forbidden().messages({
    'any.unknown': 'Bad navbar item type {.type}',
  }),
});

const ColorModeSchema = Joi.object({
  defaultMode: Joi.string()
    .equal('dark', 'light')
    .default(DEFAULT_COLOR_MODE_CONFIG.defaultMode),
  disableSwitch: Joi.bool().default(DEFAULT_COLOR_MODE_CONFIG.disableSwitch),
  respectPrefersColorScheme: Joi.bool().default(
    DEFAULT_COLOR_MODE_CONFIG.respectPrefersColorScheme,
  ),
}).default(DEFAULT_COLOR_MODE_CONFIG);

const HtmlMetadataSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string(),
  property: Joi.string(),
  content: Joi.string(),
  itemprop: Joi.string(),
}).unknown();

const FooterLinkItemSchema = Joi.object({
  to: Joi.string(),
  href: URISchema,
  html: Joi.string(),
  label: Joi.string(),
  className: Joi.string(),
})
  .xor('to', 'href', 'html')
  .with('to', 'label')
  .with('href', 'label')
  .nand('html', 'label')
  // We allow any unknown attributes on the links (users may need additional
  // attributes like target, aria-role, data-customAttribute...)
  .unknown();

const FooterColumnItemSchema = Joi.object({
  title: Joi.string().allow(null).default(null),
  className: Joi.string(),
  items: Joi.array().items(FooterLinkItemSchema).default([]),
});

const LogoSchema = Joi.object({
  alt: Joi.string().allow(''),
  src: Joi.string().required(),
  srcDark: Joi.string(),
  width: Joi.alternatives().try(Joi.string(), Joi.number()),
  height: Joi.alternatives().try(Joi.string(), Joi.number()),
  href: Joi.string(),
  target: Joi.string(),
  style: Joi.object(),
  className: Joi.string(),
});

// Normalize prism language to lowercase
// See https://github.com/facebook/docusaurus/issues/9012
const PrismLanguage = Joi.string().custom((val) => val.toLowerCase());

export const ThemeConfigSchema = Joi.object<ThemeConfig>({
  colorMode: ColorModeSchema,
  image: Joi.string(),
  docs: DocsSchema,
  blog: BlogSchema,
  metadata: Joi.array()
    .items(HtmlMetadataSchema)
    .default(DEFAULT_CONFIG.metadata),
  announcementBar: Joi.object({
    id: Joi.string().default('announcement-bar'),
    content: Joi.string().required(),
    backgroundColor: Joi.string(),
    textColor: Joi.string(),
    isCloseable: Joi.bool().default(true),
  }).optional(),
  navbar: Joi.object({
    style: Joi.string().equal('dark', 'primary'),
    hideOnScroll: Joi.bool().default(DEFAULT_CONFIG.navbar.hideOnScroll),
    items: Joi.array()
      .items(NavbarItemSchema)
      .default(DEFAULT_CONFIG.navbar.items),
    title: Joi.string().allow('', null),
    logo: LogoSchema,
  }).default(DEFAULT_CONFIG.navbar),
  footer: Joi.object({
    style: Joi.string().equal('dark', 'light').default('light'),
    logo: LogoSchema,
    copyright: Joi.string(),
    links: Joi.alternatives(
      Joi.array().items(FooterColumnItemSchema),
      Joi.array().items(FooterLinkItemSchema),
    )
      .messages({
        'alternatives.match': `The footer must be either simple or multi-column, and not a mix of the two. See: https://docusaurus.io/docs/api/themes/configuration#footer-links`,
      })
      .default([]),
  }).optional(),
  prism: Joi.object({
    theme: Joi.object({
      plain: Joi.alternatives().try(Joi.array(), Joi.object()).required(),
      styles: Joi.alternatives().try(Joi.array(), Joi.object()).required(),
    }).default(DEFAULT_CONFIG.prism.theme),
    darkTheme: Joi.object({
      plain: Joi.alternatives().try(Joi.array(), Joi.object()).required(),
      styles: Joi.alternatives().try(Joi.array(), Joi.object()).required(),
    }),
    defaultLanguage: PrismLanguage,
    additionalLanguages: Joi.array()
      .items(PrismLanguage)
      .default(DEFAULT_CONFIG.prism.additionalLanguages),
    magicComments: Joi.array()
      .items(
        Joi.object({
          className: Joi.string().required(),
          line: Joi.string(),
          block: Joi.object({
            start: Joi.string().required(),
            end: Joi.string().required(),
          }),
        }).or('line', 'block'),
      )
      .default(DEFAULT_CONFIG.prism.magicComments),
  })
    .default(DEFAULT_CONFIG.prism)
    .unknown(),
  tableOfContents: Joi.object({
    minHeadingLevel: Joi.number()
      .default(DEFAULT_CONFIG.tableOfContents.minHeadingLevel)
      .when('maxHeadingLevel', {
        is: Joi.exist(),
        then: Joi.number()
          .integer()
          .min(2)
          .max(6)
          .max(Joi.ref('maxHeadingLevel')),
        otherwise: Joi.number().integer().min(2).max(6),
      }),
    maxHeadingLevel: Joi.number()
      .integer()
      .min(2)
      .max(6)
      .default(DEFAULT_CONFIG.tableOfContents.maxHeadingLevel),
  }).default(DEFAULT_CONFIG.tableOfContents),
});

export function validateThemeConfig({
  validate,
  themeConfig,
}: ThemeConfigValidationContext<ThemeConfig>): ThemeConfig {
  return validate(ThemeConfigSchema, themeConfig);
}

const DEFAULT_OPTIONS = {
  customCss: [],
};

const PluginOptionSchema = Joi.object<PluginOptions>({
  customCss: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().required()),
      Joi.alternatives().conditional(Joi.string().required(), {
        then: Joi.custom((val: string) => [val]),
        otherwise: Joi.forbidden().messages({
          'any.unknown': '"customCss" must be a string or an array of strings',
        }),
      }),
    )
    .default(DEFAULT_OPTIONS.customCss),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  const validatedOptions = validate(PluginOptionSchema, options);
  return validatedOptions;
}
