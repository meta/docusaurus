/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {TagsListItem, TagModule} from '@docusaurus/utils';
import type {
  AuthorItemProp,
  AuthorWithKey,
  BlogPost,
  BlogSidebar,
  BlogTag,
  BlogTags,
} from '@docusaurus/plugin-content-blog';

export function toTagsProp({blogTags}: {blogTags: BlogTags}): TagsListItem[] {
  return Object.values(blogTags)
    .filter((tag) => !tag.unlisted)
    .map((tag) => ({
      label: tag.label,
      permalink: tag.permalink,
      description: tag.description,
      count: tag.items.length,
    }));
}

export function toTagProp({
  blogTagsListPath,
  tag,
}: {
  blogTagsListPath: string;
  tag: BlogTag;
}): TagModule {
  return {
    label: tag.label,
    permalink: tag.permalink,
    description: tag.description,
    allTagsPath: blogTagsListPath,
    count: tag.items.length,
    unlisted: tag.unlisted,
  };
}

export function toAuthorItemProp({
  author,
  count,
}: {
  author: AuthorWithKey;
  count: number;
}): AuthorItemProp {
  return {
    ...author,
    count,
  };
}

export function toBlogSidebarProp({
  blogSidebarTitle,
  blogPosts,
}: {
  blogSidebarTitle: string;
  blogPosts: BlogPost[];
}): BlogSidebar {
  return {
    title: blogSidebarTitle,
    items: blogPosts.map((blogPost) => ({
      title:
        blogPost.metadata.frontMatter.sidebar_label ?? blogPost.metadata.title,
      permalink: blogPost.metadata.permalink,
      unlisted: blogPost.metadata.unlisted,
      date: blogPost.metadata.date,
    })),
  };
}
