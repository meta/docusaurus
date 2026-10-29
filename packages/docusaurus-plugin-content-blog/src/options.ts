/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
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
import type {
  PluginOptions,
  Options,
  FeedType,
  FeedXSLTOptions,
} from '@docusaurus/plugin-content-blog';
import type {OptionValidationContext} from '@docusaurus/types';

export const DEFAULT_OPTIONS: PluginOptions = {
  id: DEFAULT_PLUGIN_ID,
  feedOptions: {
    type: ['rss', 'atom'],
    copyright: '',
    limit: 20,
    xslt: {
      rss: null,
      atom: null,
    },
  },
  beforeDefaultRehypePlugins: [],
  beforeDefaultRemarkPlugins: [],
  admonitions: true,
  truncateMarker: /<!--\s*truncate\s*-->|\{\/\*\s*truncate\s*\*\/\}/,
  rehypePlugins: [],
  remarkPlugins: [],
  recmaPlugins: [],
  showReadingTime: true,
  blogTagsPostsComponent: '@theme/BlogTagsPostsPage',
  blogTagsListComponent: '@theme/BlogTagsListPage',
  blogAuthorsPostsComponent: '@theme/Blog/Pages/BlogAuthorsPostsPage',
  blogAuthorsListComponent: '@theme/Blog/Pages/BlogAuthorsListPage',
  blogPostComponent: '@theme/BlogPostPage',
  blogListComponent: '@theme/BlogListPage',
  blogArchiveComponent: '@theme/BlogArchivePage',
  blogDescription: 'Blog',
  blogTitle: 'Blog',
  blogSidebarCount: 5,
  blogSidebarTitle: 'Recent posts',
  postsPerPage: 10,
  include: ['**/*.{md,mdx}'],
  exclude: GlobExcludeDefault,
  routeBasePath: 'blog',
  tagsBasePath: 'tags',
  archiveBasePath: 'archive',
  pageBasePath: 'page',
  path: 'blog',
  editLocalizedFiles: false,
  authorsMapPath: 'authors.yml',
  readingTime: ({content, defaultReadingTime, locale}) =>
    defaultReadingTime({content, locale}),
  sortPosts: 'descending',
  showLastUpdateTime: false,
  showLastUpdateAuthor: false,
  processBlogPosts: async () => undefined,
  tags: undefined,
  authorsBasePath: 'authors',
  onInlineTags: 'warn',
  onInlineAuthors: 'warn',
  onUntruncatedBlogPosts: 'warn',
};

export const XSLTBuiltInPaths = {
  rss: path.resolve(__dirname, '..', 'assets', 'rss.xsl'),
  atom: path.resolve(__dirname, '..', 'assets', 'atom.xsl'),
};

function normalizeXsltOption(
  option: string | null | boolean,
  type: 'rss' | 'atom',
): string | null {
  if (typeof option === 'string') {
    return option;
  }
  if (option === true) {
    return XSLTBuiltInPaths[type];
  }
  return null;
}

function createXSLTFilePathSchema(type: 'atom' | 'rss') {
  return Joi.alternatives()
    .try(
      Joi.string().required(),
      Joi.boolean()
        .allow(null, () => undefined)
        .custom((val) => normalizeXsltOption(val, type)),
    )
    .optional()
    .default(null);
}

const FeedXSLTOptionsSchema = Joi.alternatives()
  .try(
    Joi.object<FeedXSLTOptions>({
      rss: createXSLTFilePathSchema('rss'),
      atom: createXSLTFilePathSchema('atom'),
    }).required(),
    Joi.boolean()
      .allow(null, () => undefined)
      .custom((val) => ({
        rss: normalizeXsltOption(val, 'rss'),
        atom: normalizeXsltOption(val, 'atom'),
      })),
  )
  .optional()
  .custom((val) => {
    if (val === null) {
      return {
        rss: null,
        atom: null,
      };
    }
    return val;
  })
  .default(DEFAULT_OPTIONS.feedOptions.xslt);

const FeedOptionsSchema = Joi.object({
  type: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().equal('rss', 'atom', 'json')),
      Joi.alternatives().conditional(
        Joi.string().equal('all', 'rss', 'atom', 'json'),
        {
          then: Joi.custom((val: FeedType | 'all') =>
            val === 'all' ? ['rss', 'atom', 'json'] : [val],
          ),
        },
      ),
    )
    .allow(null)
    .default(DEFAULT_OPTIONS.feedOptions.type),
  xslt: FeedXSLTOptionsSchema,
  title: Joi.string().allow(''),
  description: Joi.string().allow(''),
  // Only add default value when user actually wants a feed (type is not null)
  copyright: Joi.when('type', {
    is: Joi.any().valid(null),
    then: Joi.string().optional(),
    otherwise: Joi.string()
      .allow('')
      .default(DEFAULT_OPTIONS.feedOptions.copyright),
  }),
  language: Joi.string(),
  createFeedItems: Joi.function(),
  limit: Joi.alternatives()
    .try(Joi.number(), Joi.valid(null), Joi.valid(false))
    .default(DEFAULT_OPTIONS.feedOptions.limit),
}).default(DEFAULT_OPTIONS.feedOptions);

const PluginOptionSchema = Joi.object<PluginOptions>({
  path: Joi.string().default(DEFAULT_OPTIONS.path),
  archiveBasePath: Joi.string()
    .default(DEFAULT_OPTIONS.archiveBasePath)
    .allow(null),
  routeBasePath: RouteBasePathSchema.default(DEFAULT_OPTIONS.routeBasePath),
  tagsBasePath: Joi.string().default(DEFAULT_OPTIONS.tagsBasePath),
  pageBasePath: Joi.string().default(DEFAULT_OPTIONS.pageBasePath),
  include: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.include),
  exclude: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.exclude),
  postsPerPage: Joi.alternatives()
    .try(Joi.equal('ALL').required(), Joi.number().integer().min(1).required())
    .default(DEFAULT_OPTIONS.postsPerPage),
  blogListComponent: Joi.string().default(DEFAULT_OPTIONS.blogListComponent),
  blogPostComponent: Joi.string().default(DEFAULT_OPTIONS.blogPostComponent),
  blogTagsListComponent: Joi.string().default(
    DEFAULT_OPTIONS.blogTagsListComponent,
  ),
  blogTagsPostsComponent: Joi.string().default(
    DEFAULT_OPTIONS.blogTagsPostsComponent,
  ),
  blogAuthorsPostsComponent: Joi.string().default(
    DEFAULT_OPTIONS.blogAuthorsPostsComponent,
  ),
  blogAuthorsListComponent: Joi.string().default(
    DEFAULT_OPTIONS.blogAuthorsListComponent,
  ),
  blogArchiveComponent: Joi.string().default(
    DEFAULT_OPTIONS.blogArchiveComponent,
  ),
  blogTitle: Joi.string().allow('').default(DEFAULT_OPTIONS.blogTitle),
  blogDescription: Joi.string()
    .allow('')
    .default(DEFAULT_OPTIONS.blogDescription),
  blogSidebarCount: Joi.alternatives()
    .try(Joi.equal('ALL').required(), Joi.number().integer().min(0).required())
    .default(DEFAULT_OPTIONS.blogSidebarCount),
  blogSidebarTitle: Joi.string().default(DEFAULT_OPTIONS.blogSidebarTitle),
  showReadingTime: Joi.bool().default(DEFAULT_OPTIONS.showReadingTime),
  remarkPlugins: RemarkPluginsSchema.default(DEFAULT_OPTIONS.remarkPlugins),
  rehypePlugins: RehypePluginsSchema.default(DEFAULT_OPTIONS.rehypePlugins),
  recmaPlugins: RecmaPluginsSchema.default(DEFAULT_OPTIONS.recmaPlugins),
  admonitions: AdmonitionsSchema.default(DEFAULT_OPTIONS.admonitions),
  editUrl: Joi.alternatives().try(URISchema, Joi.function()),
  editLocalizedFiles: Joi.boolean().default(DEFAULT_OPTIONS.editLocalizedFiles),
  truncateMarker: Joi.object().default(DEFAULT_OPTIONS.truncateMarker),
  beforeDefaultRemarkPlugins: RemarkPluginsSchema.default(
    DEFAULT_OPTIONS.beforeDefaultRemarkPlugins,
  ),
  beforeDefaultRehypePlugins: RehypePluginsSchema.default(
    DEFAULT_OPTIONS.beforeDefaultRehypePlugins,
  ),
  feedOptions: FeedOptionsSchema,
  authorsMapPath: Joi.string().default(DEFAULT_OPTIONS.authorsMapPath),
  readingTime: Joi.function().default(() => DEFAULT_OPTIONS.readingTime),
  sortPosts: Joi.string()
    .valid('descending', 'ascending')
    .default(DEFAULT_OPTIONS.sortPosts),
  showLastUpdateTime: Joi.bool().default(DEFAULT_OPTIONS.showLastUpdateTime),
  showLastUpdateAuthor: Joi.bool().default(
    DEFAULT_OPTIONS.showLastUpdateAuthor,
  ),
  processBlogPosts: Joi.function()
    .optional()
    .default(() => DEFAULT_OPTIONS.processBlogPosts),
  onInlineTags: Joi.string()
    .equal('ignore', 'log', 'warn', 'throw')
    .default(DEFAULT_OPTIONS.onInlineTags),
  tags: Joi.string()
    .disallow('')
    .allow(null, false)
    .default(() => DEFAULT_OPTIONS.tags),
  authorsBasePath: Joi.string()
    .default(DEFAULT_OPTIONS.authorsBasePath)
    .disallow(''),
  onInlineAuthors: Joi.string()
    .equal('ignore', 'log', 'warn', 'throw')
    .default(DEFAULT_OPTIONS.onInlineAuthors),
  onUntruncatedBlogPosts: Joi.string()
    .equal('ignore', 'log', 'warn', 'throw')
    .default(DEFAULT_OPTIONS.onUntruncatedBlogPosts),
}).default(DEFAULT_OPTIONS);

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options | undefined, PluginOptions>): PluginOptions {
  const validatedOptions = validate(PluginOptionSchema, options);
  return validatedOptions;
}
