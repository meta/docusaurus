/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import {normalizeUrl} from '@docusaurus/utils';
import {normalizeSocials} from './authorsSocials';
import type {
  Author,
  AuthorsMap,
  BlogPost,
  BlogPostFrontMatter,
  BlogPostFrontMatterAuthor,
} from '@docusaurus/plugin-content-blog';

type AuthorsParam = {
  frontMatter: BlogPostFrontMatter;
  authorsMap: AuthorsMap | undefined;
  baseUrl: string;
};

export function normalizeImageUrl({
  imageURL,
  baseUrl,
}: {
  imageURL: string | undefined;
  baseUrl: string;
}): string | undefined {
  return imageURL?.startsWith('/')
    ? normalizeUrl([baseUrl, imageURL])
    : imageURL;
}

function normalizeAuthorUrl({
  author,
  baseUrl,
}: {
  author: Author;
  baseUrl: string;
}): string | undefined {
  if (author.key) {
    // Ensures invariant: global authors should have already been normalized
    if (
      author.imageURL?.startsWith('/') &&
      !author.imageURL.startsWith(baseUrl)
    ) {
      throw new Error(
        `Docusaurus internal bug: global authors image ${author.imageURL} should start with the expected baseUrl=${baseUrl}`,
      );
    }

    return author.imageURL;
  }
  return normalizeImageUrl({imageURL: author.imageURL, baseUrl});
}

export function getBlogPostAuthors(params: AuthorsParam): Author[] {
  const {authorsMap, frontMatter, baseUrl} = params;
  return normalizeFrontMatterAuthors().map(toAuthor);

  function normalizeFrontMatterAuthors(): BlogPostFrontMatterAuthor[] {
    if (frontMatter.authors === undefined) {
      return [];
    }

    function normalizeAuthor(
      authorInput: string | BlogPostFrontMatterAuthor,
    ): BlogPostFrontMatterAuthor {
      if (typeof authorInput === 'string') {
        // We could allow users to provide an author's name here, but we only
        // support keys, otherwise, a typo in a key would fall back to
        // becoming a name and may end up unnoticed
        return {key: authorInput};
      }
      return {
        ...authorInput,
        socials: normalizeSocials(authorInput.socials ?? {}),
      };
    }

    return Array.isArray(frontMatter.authors)
      ? frontMatter.authors.map(normalizeAuthor)
      : [normalizeAuthor(frontMatter.authors)];
  }

  function getAuthorsMapAuthor(key: string | undefined): Author | undefined {
    if (key) {
      if (!authorsMap || Object.keys(authorsMap).length === 0) {
        throw new Error(`Can't reference blog post authors by a key (such as '${key}') because no authors map file could be loaded.
Please double-check your blog plugin config (in particular 'authorsMapPath'), ensure the file exists at the configured path, is not empty, and is valid!`);
      }
      const author = authorsMap[key];
      if (!author) {
        throw Error(`Blog author with key "${key}" not found in the authors map file.
Valid author keys are:
${Object.keys(authorsMap)
  .map((validKey) => `- ${validKey}`)
  .join('\n')}`);
      }
      return author;
    }
    return undefined;
  }

  function toAuthor(frontMatterAuthor: BlogPostFrontMatterAuthor): Author {
    const author = {
      // Author def from authorsMap can be locally overridden by front matter
      ...getAuthorsMapAuthor(frontMatterAuthor.key),
      ...frontMatterAuthor,
    } as Author;

    return {
      ...author,
      key: author.key ?? null,
      page: author.page ?? null,
      // global author images have already been normalized
      imageURL: normalizeAuthorUrl({author, baseUrl}),
    };
  }
}

/**
 * Group blog posts by author key
 * Blog posts with only inline authors are ignored
 */
export function groupBlogPostsByAuthorKey({
  blogPosts,
  authorsMap,
}: {
  blogPosts: BlogPost[];
  authorsMap: AuthorsMap | undefined;
}): Record<string, BlogPost[]> {
  return _.mapValues(authorsMap, (author, key) =>
    blogPosts.filter((p) => p.metadata.authors.some((a) => a.key === key)),
  );
}
