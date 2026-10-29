/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {
  Joi,
  RemarkPluginsSchema,
  RehypePluginsSchema,
  RecmaPluginsSchema,
  AdmonitionsSchema,
  RouteBasePathSchema,
  URISchema,
} from '@docusaurus/utils-validation';
import {GlobExcludeDefault} from '@docusaurus/glob';
import {DefaultSidebarItemsGenerator} from './sidebars/generator';
import {
  DefaultNumberPrefixParser,
  DisabledNumberPrefixParser,
} from './numberPrefix';
import type {OptionValidationContext} from '@docusaurus/types';
import type {PluginOptions, Options} from '@docusaurus/plugin-content-docs';

export const DEFAULT_OPTIONS: Omit<PluginOptions, 'id' | 'sidebarPath'> = {
  path: 'docs', // Path to data on filesystem, relative to site dir.
  routeBasePath: 'docs', // URL Route.
  tagsBasePath: 'tags', // URL Tags Route.
  include: ['**/*.{md,mdx}'], // Extensions to include.
  exclude: GlobExcludeDefault,
  sidebarItemsGenerator: DefaultSidebarItemsGenerator,
  numberPrefixParser: DefaultNumberPrefixParser,
  docsRootComponent: '@theme/DocsRoot',
  docVersionRootComponent: '@theme/DocVersionRoot',
  docRootComponent: '@theme/DocRoot',
  docItemComponent: '@theme/DocItem',
  docTagDocListComponent: '@theme/DocTagDocListPage',
  docTagsListComponent: '@theme/DocTagsListPage',
  docCategoryGeneratedIndexComponent: '@theme/DocCategoryGeneratedIndexPage',
  remarkPlugins: [],
  rehypePlugins: [],
  recmaPlugins: [],
  beforeDefaultRemarkPlugins: [],
  beforeDefaultRehypePlugins: [],
  showLastUpdateTime: false,
  showLastUpdateAuthor: false,
  admonitions: true,
  includeCurrentVersion: true,
  disableVersioning: false,
  lastVersion: undefined,
  versions: {},
  editCurrentVersion: false,
  editLocalizedFiles: false,
  sidebarCollapsible: true,
  sidebarCollapsed: true,
  breadcrumbs: true,
  onInlineTags: 'warn',
  tags: undefined,
};

const VersionOptionsSchema = Joi.object({
  path: Joi.string().allow('').optional(),
  label: Joi.string().optional(),
  banner: Joi.string().equal('none', 'unreleased', 'unmaintained').optional(),
  badge: Joi.boolean().optional(),
  className: Joi.string().optional(),
  noIndex: Joi.boolean().optional(),
});

const VersionsOptionsSchema = Joi.object()
  .pattern(Joi.string().required(), VersionOptionsSchema)
  .default(DEFAULT_OPTIONS.versions);

const OptionsSchema = Joi.object<PluginOptions>({
  path: Joi.string().default(DEFAULT_OPTIONS.path),
  editUrl: Joi.alternatives().try(URISchema, Joi.function()),
  editCurrentVersion: Joi.boolean().default(DEFAULT_OPTIONS.editCurrentVersion),
  editLocalizedFiles: Joi.boolean().default(DEFAULT_OPTIONS.editLocalizedFiles),
  routeBasePath: RouteBasePathSchema.default(DEFAULT_OPTIONS.routeBasePath),
  tagsBasePath: Joi.string().default(DEFAULT_OPTIONS.tagsBasePath),

  include: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.include),
  exclude: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.exclude),
  sidebarPath: Joi.alternatives().try(
    Joi.boolean().invalid(true),
    Joi.string(),
  ),
  sidebarItemsGenerator: Joi.function().default(
    () => DEFAULT_OPTIONS.sidebarItemsGenerator,
  ),
  sidebarCollapsible: Joi.boolean().default(DEFAULT_OPTIONS.sidebarCollapsible),
  sidebarCollapsed: Joi.boolean().default(DEFAULT_OPTIONS.sidebarCollapsed),
  numberPrefixParser: Joi.alternatives()
    .try(
      Joi.function(),
      // Convert boolean values to functions
      Joi.alternatives().conditional(Joi.boolean(), {
        then: Joi.custom((val: boolean) =>
          val ? DefaultNumberPrefixParser : DisabledNumberPrefixParser,
        ),
      }),
    )
    .default(() => DEFAULT_OPTIONS.numberPrefixParser),
  docsRootComponent: Joi.string().default(DEFAULT_OPTIONS.docsRootComponent),
  docVersionRootComponent: Joi.string().default(
    DEFAULT_OPTIONS.docVersionRootComponent,
  ),
  docRootComponent: Joi.string().default(DEFAULT_OPTIONS.docRootComponent),
  docItemComponent: Joi.string().default(DEFAULT_OPTIONS.docItemComponent),
  docTagsListComponent: Joi.string().default(
    DEFAULT_OPTIONS.docTagsListComponent,
  ),
  docTagDocListComponent: Joi.string().default(
    DEFAULT_OPTIONS.docTagDocListComponent,
  ),
  docCategoryGeneratedIndexComponent: Joi.string().default(
    DEFAULT_OPTIONS.docCategoryGeneratedIndexComponent,
  ),
  remarkPlugins: RemarkPluginsSchema.default(DEFAULT_OPTIONS.remarkPlugins),
  rehypePlugins: RehypePluginsSchema.default(DEFAULT_OPTIONS.rehypePlugins),
  recmaPlugins: RecmaPluginsSchema.default(DEFAULT_OPTIONS.recmaPlugins),
  beforeDefaultRemarkPlugins: RemarkPluginsSchema.default(
    DEFAULT_OPTIONS.beforeDefaultRemarkPlugins,
  ),
  beforeDefaultRehypePlugins: RehypePluginsSchema.default(
    DEFAULT_OPTIONS.beforeDefaultRehypePlugins,
  ),
  admonitions: AdmonitionsSchema.default(DEFAULT_OPTIONS.admonitions),
  showLastUpdateTime: Joi.bool().default(DEFAULT_OPTIONS.showLastUpdateTime),
  showLastUpdateAuthor: Joi.bool().default(
    DEFAULT_OPTIONS.showLastUpdateAuthor,
  ),
  includeCurrentVersion: Joi.bool().default(
    DEFAULT_OPTIONS.includeCurrentVersion,
  ),
  onlyIncludeVersions: Joi.array().items(Joi.string().required()).optional(),
  disableVersioning: Joi.bool().default(DEFAULT_OPTIONS.disableVersioning),
  lastVersion: Joi.string().optional(),
  versions: VersionsOptionsSchema,
  breadcrumbs: Joi.bool().default(DEFAULT_OPTIONS.breadcrumbs),
  onInlineTags: Joi.string()
    .equal('ignore', 'log', 'warn', 'throw')
    .default(DEFAULT_OPTIONS.onInlineTags),
  tags: Joi.string()
    .disallow('')
    .allow(null, false)
    .default(() => DEFAULT_OPTIONS.tags),
});

export function validateOptions({
  validate,
  options: userOptions,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  let options = userOptions;

  if (options.sidebarCollapsible === false) {
    // When sidebarCollapsible=false and sidebarCollapsed=undefined, we don't
    // want to have the inconsistency warning. We let options.sidebarCollapsible
    // become the default value for options.sidebarCollapsed
    if (typeof options.sidebarCollapsed === 'undefined') {
      options = {
        ...options,
        sidebarCollapsed: false,
      };
    }
    if (options.sidebarCollapsed) {
      logger.warn`The docs plugin config is inconsistent. It does not make sense to use code=${'sidebarCollapsible: false'} and code=${'sidebarCollapsed: true'} at the same time. code=${'sidebarCollapsed: true'} will be ignored.`;
      options = {
        ...options,
        sidebarCollapsed: false,
      };
    }
  }

  const normalizedOptions = validate(OptionsSchema, options);

  return normalizedOptions;
}
