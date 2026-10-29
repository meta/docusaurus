/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import {usePluralForm} from '@docusaurus/theme-common';

// Only used locally
function useBlogPostsPlural(): (count: number) => string {
  const {selectMessage} = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: 'theme.blog.post.plurals',
          description:
            'Pluralized label for "{count} posts". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One post|{count} posts',
        },
        {count},
      ),
    );
}

export function useBlogTagsPostsPageTitle(tag: {
  label: string;
  count: number;
}): string {
  const blogPostsPlural = useBlogPostsPlural();
  return translate(
    {
      id: 'theme.blog.tagTitle',
      description: 'The title of the page for a blog tag',
      message: '{nPosts} tagged with "{tagName}"',
    },
    {nPosts: blogPostsPlural(tag.count), tagName: tag.label},
  );
}

export function useBlogAuthorPageTitle(author: {
  key: string;
  name?: string;
  count: number;
}): string {
  const blogPostsPlural = useBlogPostsPlural();
  return translate(
    {
      id: 'theme.blog.author.pageTitle',
      description: 'The title of the page for a blog author',
      message: '{authorName} - {nPosts}',
    },
    {
      nPosts: blogPostsPlural(author.count),
      authorName: author.name || author.key,
    },
  );
}

export const translateBlogAuthorsListPageTitle = (): string =>
  translate({
    id: 'theme.blog.authorsList.pageTitle',
    message: 'Authors',
    description: 'The title of the authors page',
  });

export function BlogAuthorsListViewAllLabel(): ReactNode {
  return (
    <Translate
      id="theme.blog.authorsList.viewAll"
      description="The label of the link targeting the blog authors page">
      View all authors
    </Translate>
  );
}

export function BlogAuthorNoPostsLabel(): ReactNode {
  return (
    <Translate
      id="theme.blog.author.noPosts"
      description="The text for authors with 0 blog post">
      This author has not written any posts yet.
    </Translate>
  );
}
