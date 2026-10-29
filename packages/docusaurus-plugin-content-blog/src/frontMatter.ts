/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint-disable camelcase */

import {
  ContentVisibilitySchema,
  FrontMatterLastUpdateSchema,
  FrontMatterTOCHeadingLevels,
  FrontMatterTagsSchema,
  JoiFrontMatter as Joi, // Custom instance for front matter
  URISchema,
  validateFrontMatter,
} from '@docusaurus/utils-validation';
import {AuthorSocialsSchema} from './authorsSocials';
import type {BlogPostFrontMatter} from '@docusaurus/plugin-content-blog';

const BlogPostFrontMatterAuthorSchema = Joi.object({
  key: Joi.string(),
  name: Joi.string(),
  title: Joi.string(),
  url: URISchema,
  imageURL: Joi.string(),
  socials: AuthorSocialsSchema,
})
  .or('key', 'name', 'imageURL')
  .rename('image_url', 'imageURL', {alias: true});

const FrontMatterAuthorErrorMessage =
  '{{#label}} does not look like a valid blog post author. Please use an author key or an author object (with a key and/or name).';

const LegacyAuthorFrontMatterSchema = Joi.any().forbidden().messages({
  'any.unknown':
    '{{#label}} blog post front matter is not supported anymore. Use the "authors" front matter instead, with an inline author object (with name, title, url and imageURL attributes) or an author key declared in the authors map file (authors.yml).',
});

const BlogFrontMatterSchema = Joi.object<BlogPostFrontMatter>({
  title: Joi.string().allow(''),
  title_meta: Joi.string().allow(''),
  sidebar_label: Joi.string().allow(''),
  description: Joi.string().allow(''),
  tags: FrontMatterTagsSchema,
  date: Joi.date().raw(),

  // New multi-authors front matter:
  authors: Joi.alternatives()
    .try(
      Joi.string(),
      BlogPostFrontMatterAuthorSchema,
      Joi.array()
        .items(Joi.string(), BlogPostFrontMatterAuthorSchema)
        .messages({
          'array.sparse': FrontMatterAuthorErrorMessage,
          'array.includes': FrontMatterAuthorErrorMessage,
        }),
    )
    .messages({
      'alternatives.match': FrontMatterAuthorErrorMessage,
    }),
  // Legacy single-author front matter, removed in Docusaurus v4
  // TODO Docusaurus v5: remove these migration errors
  // @ts-expect-error: forbidden
  author: LegacyAuthorFrontMatterSchema,
  author_title: LegacyAuthorFrontMatterSchema,
  authorTitle: LegacyAuthorFrontMatterSchema,
  author_url: LegacyAuthorFrontMatterSchema,
  authorURL: LegacyAuthorFrontMatterSchema,
  author_image_url: LegacyAuthorFrontMatterSchema,
  authorImageURL: LegacyAuthorFrontMatterSchema,

  slug: Joi.string(),
  image: URISchema,
  keywords: Joi.array().items(Joi.string().required()),
  hide_table_of_contents: Joi.boolean(),

  ...FrontMatterTOCHeadingLevels,
  last_update: FrontMatterLastUpdateSchema,
}).concat(ContentVisibilitySchema);

export function validateBlogPostFrontMatter(frontMatter: {
  [key: string]: unknown;
}): BlogPostFrontMatter {
  return validateFrontMatter(frontMatter, BlogFrontMatterSchema);
}
