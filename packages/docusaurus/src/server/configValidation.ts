/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DEFAULT_I18N_DIR_NAME,
  DEFAULT_PARSE_FRONT_MATTER,
  DEFAULT_STATIC_DIR_NAME,
  getVcsPreset,
  VcsPresetNames,
} from '@docusaurus/utils';
import {Joi, printWarning} from '@docusaurus/utils-validation';
import {
  addLeadingSlash,
  addTrailingSlash,
  removeTrailingSlash,
} from '@docusaurus/utils-common';
import logger from '@docusaurus/logger';
import type {
  DocusaurusConfig,
  FutureConfig,
  I18nConfig,
  I18nLocaleConfig,
  MarkdownConfig,
  MarkdownHooks,
  StorageConfig,
  VcsConfig,
  VcsPreset,
  WebpackConfig,
} from '@docusaurus/types';

const DEFAULT_I18N_LOCALE = 'en';

const SiteUrlSchema = Joi.string()
  .custom((value: string, helpers) => {
    const url = URL.parse(value);
    if (url === null) {
      return helpers.error('any.invalid');
    }
    const {pathname} = url;
    if (pathname !== '/') {
      return helpers.error('docusaurus.subPathError', {pathname});
    }
    return removeTrailingSlash(value);
  })
  .messages({
    'any.invalid':
      '"{#value}" does not look like a valid URL. Make sure it has a protocol; for example, "https://example.com".',
    'docusaurus.subPathError':
      'The url is not supposed to contain a sub-path like "{#pathname}". Please use the baseUrl field for sub-paths.',
  });

const BaseUrlSchema = Joi
  // Weird Joi trick needed, otherwise value '' is not normalized...
  .alternatives()
  .try(Joi.string().required().allow(''))
  .custom((value: string) => addLeadingSlash(addTrailingSlash(value)));

export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLocale: DEFAULT_I18N_LOCALE,
  path: DEFAULT_I18N_DIR_NAME,
  locales: [DEFAULT_I18N_LOCALE],
  localeConfigs: {},
};

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  type: 'localStorage',
  namespace: true,
};

export const DEFAULT_FUTURE_CONFIG: FutureConfig = {
  experimental_router: 'browser',
};

const DEFAULT_MARKDOWN_HOOKS: MarkdownHooks = {
  onBrokenMarkdownLinks: 'warn',
  onBrokenMarkdownImages: 'throw',
  onUnusedMarkdownDirectives: 'warn',
};

const DEFAULT_MARKDOWN_CONFIG: MarkdownConfig = {
  // TODO Docusaurus v5: change this to "detect"?
  //  we probably need stable CommonMark support first
  //  see https://github.com/facebook/docusaurus/issues/9092
  format: 'mdx',
  mermaid: false,
  emoji: true,
  preprocessor: undefined,
  parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
  mdx1Compat: {
    comments: false,
    admonitions: false,
    headingIds: false,
  },
  anchors: {
    maintainCase: false,
  },
  remarkRehypeOptions: undefined,
  hooks: DEFAULT_MARKDOWN_HOOKS,
};

export const DEFAULT_CONFIG: Pick<
  DocusaurusConfig,
  | 'i18n'
  | 'storage'
  | 'vcs'
  | 'future'
  | 'onBrokenLinks'
  | 'onBrokenAnchors'
  | 'onDuplicateRoutes'
  | 'plugins'
  | 'themes'
  | 'presets'
  | 'headTags'
  | 'stylesheets'
  | 'scripts'
  | 'clientModules'
  | 'customFields'
  | 'themeConfig'
  | 'titleDelimiter'
  | 'noIndex'
  | 'tagline'
  | 'baseUrlIssueBanner'
  | 'staticDirectories'
  | 'markdown'
> = {
  i18n: DEFAULT_I18N_CONFIG,
  storage: DEFAULT_STORAGE_CONFIG,
  vcs: getVcsPreset('default'),
  future: DEFAULT_FUTURE_CONFIG,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'warn',
  plugins: [],
  themes: [],
  presets: [],
  headTags: [],
  stylesheets: [],
  scripts: [],
  clientModules: [],
  customFields: {},
  themeConfig: {},
  titleDelimiter: '|',
  noIndex: false,
  tagline: '',
  baseUrlIssueBanner: true,
  staticDirectories: [DEFAULT_STATIC_DIR_NAME],
  markdown: DEFAULT_MARKDOWN_CONFIG,
};

function createPluginSchema(theme: boolean) {
  return Joi.alternatives()
    .try(
      Joi.function(),
      Joi.array()
        .ordered(Joi.function().required(), Joi.object().required())
        .length(2),
      Joi.string(),
      Joi.array()
        .ordered(Joi.string().required(), Joi.object().required())
        .length(2),
      Joi.any().valid(false, null),
    )
    .error((errors) => {
      errors.forEach((error) => {
        const validConfigExample = theme
          ? `Example valid theme config:
{
  themes: [
    ["@docusaurus/theme-classic",options],
    "./myTheme",
    ["./myTheme",{someOption: 42}],
    function myTheme() { },
    [function myTheme() { },options]
  ],
};`
          : `Example valid plugin config:
{
  plugins: [
    ["@docusaurus/plugin-content-docs",options],
    "./myPlugin",
    ["./myPlugin",{someOption: 42}],
    function myPlugin() { },
    [function myPlugin() { },options]
  ],
};`;

        error.message = ` => Bad Docusaurus ${
          theme ? 'theme' : 'plugin'
        } value ${error.path.reduce((acc, cur) =>
          typeof cur === 'string' ? `${acc}.${cur}` : `${acc}[${cur}]`,
        )}.
${validConfigExample}
`;
      });
      return errors;
    });
}

const PluginSchema = createPluginSchema(false);

const ThemeSchema = createPluginSchema(true);

const PresetSchema = Joi.alternatives()
  .try(
    Joi.string(),
    Joi.array()
      .items(Joi.string().required(), Joi.object().required())
      .length(2),
    Joi.any().valid(false, null),
  )
  .messages({
    'alternatives.types': `{#label} does not look like a valid preset config. A preset config entry should be one of:
- A tuple of [presetName, options], like \`["classic", \\{ blog: false \\}]\`, or
- A simple string, like \`"classic"\``,
  });

const LocaleConfigSchema = Joi.object<I18nLocaleConfig>({
  label: Joi.string(),
  htmlLang: Joi.string(),
  direction: Joi.string().equal('ltr', 'rtl'),
  calendar: Joi.string(),
  path: Joi.string(),
  translate: Joi.boolean(),
  url: SiteUrlSchema,
  baseUrl: BaseUrlSchema,
});

const I18N_CONFIG_SCHEMA = Joi.object<I18nConfig>({
  defaultLocale: Joi.string().required(),
  path: Joi.string().default(DEFAULT_I18N_CONFIG.path),
  locales: Joi.array().items().min(1).items(Joi.string().required()).required(),
  localeConfigs: Joi.object()
    .pattern(/.*/, LocaleConfigSchema)
    .default(DEFAULT_I18N_CONFIG.localeConfigs),
})
  .optional()
  .default(DEFAULT_I18N_CONFIG);

const STORAGE_CONFIG_SCHEMA = Joi.object({
  type: Joi.string()
    .equal('localStorage', 'sessionStorage')
    .default(DEFAULT_STORAGE_CONFIG.type),
  namespace: Joi.alternatives()
    .try(Joi.string(), Joi.boolean())
    .default(DEFAULT_STORAGE_CONFIG.namespace),
})
  .optional()
  .default(DEFAULT_STORAGE_CONFIG);

const VCS_CONFIG_OBJECT_SCHEMA = Joi.object<VcsConfig>({
  // All the fields are required on purpose
  // You either provide a full VCS config or nothing
  initialize: Joi.function().maxArity(1).required(),
  getFileCreationInfo: Joi.function().arity(1).required(),
  getFileLastUpdateInfo: Joi.function().arity(1).required(),
});

const VCS_CONFIG_SCHEMA = Joi.custom((input) => {
  if (typeof input === 'string') {
    const presetName = input as VcsPreset;
    if (!VcsPresetNames.includes(presetName)) {
      throw new Error(`VCS config preset name '${input}' is not valid.`);
    }
    return getVcsPreset(presetName);
  }
  if (typeof input === 'boolean') {
    return input ? getVcsPreset('default') : getVcsPreset('disabled');
  }
  const {error, value} = VCS_CONFIG_OBJECT_SCHEMA.validate(input);
  if (error) {
    throw error;
  }
  return value;
}).default(() => DEFAULT_CONFIG.vcs);

// TODO Docusaurus v5: remove this migration error for legacy template variables
const LegacySSGTemplateVariables: {[name: string]: string} = {
  appHtml: logger.code('it.body.appHtml'),
  htmlAttributes: logger.code('it.html.attributes'),
  bodyAttributes: logger.code('it.body.attributes'),
  metaAttributes: `${logger.code('it.head.pageTags')} (a string)`,
  headTags: logger.code('it.head.pluginTags'),
  preBodyTags: logger.code('it.body.preTags'),
  postBodyTags: logger.code('it.body.postTags'),
  stylesheets: `${logger.code('it.assets.stylesheets')} (URLs including the baseUrl)`,
  scripts: `${logger.code('it.assets.scripts')} (URLs including the baseUrl)`,
  noIndex: `removed: the ${logger.code('<meta name="robots">')} tag is part of ${logger.code('it.head.pageTags')}`,
};

function getLegacySSGTemplateVariablesMessage(
  template: string,
): string | undefined {
  const usedLegacyVariables = Object.keys(LegacySSGTemplateVariables).filter(
    (name) => new RegExp(String.raw`\bit\.${name}\b`).test(template),
  );
  if (usedLegacyVariables.length === 0) {
    return undefined;
  }
  return usedLegacyVariables
    .map(
      (name) =>
        `- ${logger.code(`it.${name}`)} => ${LegacySSGTemplateVariables[name]}`,
    )
    .join('\n');
}

const SSG_TEMPLATE_SCHEMA = Joi.string()
  // TODO Docusaurus v5: remove this migration error
  .custom((template: string, helpers) => {
    const legacyVariablesMessage =
      getLegacySSGTemplateVariablesMessage(template);
    if (legacyVariablesMessage) {
      return helpers.error('docusaurus.legacyVariables', {
        legacyVariablesMessage,
      });
    }
    return template;
  })
  .messages({
    'docusaurus.legacyVariables': `The Docusaurus config ${logger.code(
      'siteConfig.ssgTemplate',
    )} uses template variables that have been renamed or removed:
{#legacyVariablesMessage}
Please update your template.`,
  });

// TODO Docusaurus v5: remove these never types for removed/renamed options
const FUTURE_CONFIG_SCHEMA = Joi.object<
  FutureConfig & {
    experimental_storage: never;
    experimental_faster: never;
    faster: never;
  }
>({
  // TODO Docusaurus v5: remove this migration error
  faster: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': `The Docusaurus config ${logger.code(
        'future.faster',
      )} has been removed. Docusaurus now uses Rspack by default. To keep using Webpack and Babel (deprecated), use ${logger.code(
        'siteConfig.webpack: true',
      )}.`,
    }),
  experimental_router: Joi.string()
    .equal('browser', 'hash')
    .default(DEFAULT_FUTURE_CONFIG.experimental_router),
  // TODO Docusaurus v5: remove this migration error
  experimental_storage: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': `The Docusaurus config ${logger.code(
        'future.experimental_storage',
      )} has been promoted to a stable top-level ${logger.code(
        'storage',
      )} config attribute. Please move your storage config to the top level.`,
    }),
  // TODO Docusaurus v5: remove this migration error
  experimental_faster: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': `The Docusaurus config ${logger.code(
        'future.experimental_faster',
      )} has been removed. Docusaurus now uses Rspack by default. To keep using Webpack and Babel (deprecated), use ${logger.code(
        'siteConfig.webpack: true',
      )}.`,
    }),
})
  .optional()
  .default(DEFAULT_FUTURE_CONFIG);

// TODO move to @docusaurus/utils-validation
// TODO Docusaurus v5: remove these never types for removed/renamed options
export const ConfigSchema = Joi.object<
  DocusaurusConfig & {onBrokenMarkdownLinks: never; ssrTemplate: never}
>({
  url: SiteUrlSchema.required(),
  baseUrl: BaseUrlSchema.required(),
  baseUrlIssueBanner: Joi.boolean().default(DEFAULT_CONFIG.baseUrlIssueBanner),
  favicon: Joi.string().optional(),
  title: Joi.string().required(),
  trailingSlash: Joi.boolean(), // No default value! undefined = retrocompatible legacy behavior!
  i18n: I18N_CONFIG_SCHEMA,
  storage: STORAGE_CONFIG_SCHEMA,
  vcs: VCS_CONFIG_SCHEMA,
  future: FUTURE_CONFIG_SCHEMA,
  onBrokenLinks: Joi.string()
    .equal('ignore', 'log', 'warn', 'throw')
    .default(DEFAULT_CONFIG.onBrokenLinks),
  onBrokenAnchors: Joi.string()
    .equal('ignore', 'log', 'warn', 'throw')
    .default(DEFAULT_CONFIG.onBrokenAnchors),
  // TODO Docusaurus v5: remove this migration error
  onBrokenMarkdownLinks: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': `The Docusaurus config ${logger.code(
        'siteConfig.onBrokenMarkdownLinks',
      )} has been removed. Please move this option to ${logger.code(
        'siteConfig.markdown.hooks.onBrokenMarkdownLinks',
      )} instead.`,
    }),
  onDuplicateRoutes: Joi.string()
    .equal('ignore', 'log', 'warn', 'throw')
    .default(DEFAULT_CONFIG.onDuplicateRoutes),
  organizationName: Joi.string().allow(''),
  staticDirectories: Joi.array()
    .items(Joi.string())
    .default(DEFAULT_CONFIG.staticDirectories),
  projectName: Joi.string().allow(''),
  deploymentBranch: Joi.string().optional(),
  customFields: Joi.object().unknown().default(DEFAULT_CONFIG.customFields),
  githubHost: Joi.string(),
  githubPort: Joi.string(),
  plugins: Joi.array().items(PluginSchema).default(DEFAULT_CONFIG.plugins),
  themes: Joi.array().items(ThemeSchema).default(DEFAULT_CONFIG.themes),
  presets: Joi.array().items(PresetSchema).default(DEFAULT_CONFIG.presets),
  themeConfig: Joi.object().unknown().default(DEFAULT_CONFIG.themeConfig),
  scripts: Joi.array()
    .items(
      Joi.string(),
      Joi.object({
        src: Joi.string().required(),
        async: Joi.bool(),
        defer: Joi.bool(),
      })
        // See https://github.com/facebook/docusaurus/issues/3378
        .unknown(),
    )
    .messages({
      'array.includes':
        '{#label} is invalid. A script must be a plain string (the src), or an object with at least a "src" property.',
    })
    .default(DEFAULT_CONFIG.scripts),
  ssgTemplate: SSG_TEMPLATE_SCHEMA,
  // TODO Docusaurus v5: remove this migration error
  ssrTemplate: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': `The Docusaurus config ${logger.code(
        'siteConfig.ssrTemplate',
      )} has been renamed to ${logger.code(
        'siteConfig.ssgTemplate',
      )}. Please rename it in your site config.`,
    }),
  headTags: Joi.array()
    .items(
      Joi.object({
        tagName: Joi.string().required(),
        attributes: Joi.object().when('customElement', {
          is: Joi.valid(true),
          then: Joi.optional(),
          otherwise: Joi.object()
            .pattern(
              /[\w-]+/,
              Joi.alternatives().try(Joi.string(), Joi.boolean()),
            )
            .required(),
        }),
        customElement: Joi.bool().default(false),
      }).unknown(),
    )
    .messages({
      'array.includes':
        '{#label} is invalid. A headTag must be an object with at least a "tagName" and an "attributes" property.',
    })
    .default(DEFAULT_CONFIG.headTags),
  stylesheets: Joi.array()
    .items(
      Joi.string(),
      Joi.object({
        href: Joi.string().required(),
        type: Joi.string(),
      }).unknown(),
    )
    .messages({
      'array.includes':
        '{#label} is invalid. A stylesheet must be a plain string (the href), or an object with at least a "href" property.',
    })
    .default(DEFAULT_CONFIG.stylesheets),
  clientModules: Joi.array()
    .items(Joi.string())
    .default(DEFAULT_CONFIG.clientModules),
  tagline: Joi.string().allow('').default(DEFAULT_CONFIG.tagline),
  titleDelimiter: Joi.string().default(DEFAULT_CONFIG.titleDelimiter),
  noIndex: Joi.bool().default(DEFAULT_CONFIG.noIndex),
  // Normalized in postProcessDocusaurusConfig
  webpack: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.object<WebpackConfig>({
        jsLoader: Joi.alternatives()
          .try(Joi.string().equal('babel'), Joi.function())
          .optional(),
      }),
    )
    .optional(),
  markdown: Joi.object({
    format: Joi.string()
      .equal('mdx', 'md', 'detect')
      .default(DEFAULT_CONFIG.markdown.format),
    parseFrontMatter: Joi.function().default(
      () => DEFAULT_CONFIG.markdown.parseFrontMatter,
    ),
    mermaid: Joi.boolean().default(DEFAULT_CONFIG.markdown.mermaid),
    emoji: Joi.boolean().default(DEFAULT_CONFIG.markdown.emoji),
    preprocessor: Joi.function()
      .arity(1)
      .optional()
      .default(() => DEFAULT_CONFIG.markdown.preprocessor),
    mdx1Compat: Joi.object({
      comments: Joi.boolean().default(
        DEFAULT_CONFIG.markdown.mdx1Compat.comments,
      ),
      admonitions: Joi.boolean().default(
        DEFAULT_CONFIG.markdown.mdx1Compat.admonitions,
      ),
      headingIds: Joi.boolean().default(
        DEFAULT_CONFIG.markdown.mdx1Compat.headingIds,
      ),
    }).default(DEFAULT_CONFIG.markdown.mdx1Compat),
    remarkRehypeOptions:
      // add proper external options validation?
      // Not sure if it's a good idea, validation is likely to become stale
      // See https://github.com/remarkjs/remark-rehype#options
      Joi.object().unknown(),
    anchors: Joi.object({
      maintainCase: Joi.boolean().default(
        DEFAULT_CONFIG.markdown.anchors.maintainCase,
      ),
    }).default(DEFAULT_CONFIG.markdown.anchors),
    hooks: Joi.object<MarkdownHooks>({
      onBrokenMarkdownLinks: Joi.alternatives()
        .try(
          Joi.string().equal('ignore', 'log', 'warn', 'throw'),
          Joi.function(),
        )
        .default(DEFAULT_CONFIG.markdown.hooks.onBrokenMarkdownLinks),
      onBrokenMarkdownImages: Joi.alternatives()
        .try(
          Joi.string().equal('ignore', 'log', 'warn', 'throw'),
          Joi.function(),
        )
        .default(DEFAULT_CONFIG.markdown.hooks.onBrokenMarkdownImages),
      onUnusedMarkdownDirectives: Joi.alternatives()
        .try(
          Joi.string().equal('ignore', 'log', 'warn', 'throw'),
          Joi.function(),
        )
        .default(DEFAULT_CONFIG.markdown.hooks.onUnusedMarkdownDirectives),
    }).default(DEFAULT_CONFIG.markdown.hooks),
  }).default(DEFAULT_CONFIG.markdown),
}).messages({
  'docusaurus.configValidationWarning':
    'Docusaurus config validation warning. Field {#label}: {#warningMessage}',
});

// Expressing this kind of logic in Joi is a pain
// We also want to decouple logic from Joi: easier to remove it later!
function postProcessDocusaurusConfig(config: DocusaurusConfig) {
  // Resolve webpack config: true => {}, false => undefined (Rspack)
  const webpack = config.webpack as boolean | WebpackConfig | undefined;
  if (webpack === true) {
    config.webpack = {};
  } else if (webpack === false) {
    delete config.webpack;
  }
}

// TODO move to @docusaurus/utils-validation
export function validateConfig(
  config: unknown,
  siteConfigPath: string,
): DocusaurusConfig {
  const {error, warning, value} = ConfigSchema.validate(config, {
    abortEarly: false,
  });

  printWarning(warning);

  if (error) {
    const unknownFields = error.details.reduce((formattedError, err) => {
      if (err.type === 'object.unknown') {
        return `${formattedError}"${err.path.reduce((acc, cur) =>
          typeof cur === 'string' ? `${acc}.${cur}` : `${acc}[${cur}]`,
        )}",`;
      }
      return formattedError;
    }, '');
    let formattedError = error.details.reduce(
      (accumulatedErr, err) =>
        err.type !== 'object.unknown'
          ? `${accumulatedErr}${err.message}\n`
          : accumulatedErr,
      '',
    );
    formattedError = unknownFields
      ? `${formattedError}These field(s) (${unknownFields}) are not recognized in ${siteConfigPath}.\nIf you still want these fields to be in your configuration, put them in the "customFields" field.\nSee https://docusaurus.io/docs/api/docusaurus-config/#customfields`
      : formattedError;
    throw new Error(formattedError);
  }

  postProcessDocusaurusConfig(value);

  return value;
}
