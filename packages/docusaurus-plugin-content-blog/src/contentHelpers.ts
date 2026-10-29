/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {BlogContent, BlogPost} from '@docusaurus/plugin-content-blog';

function indexBlogPostsBySource(content: BlogContent): Map<string, BlogPost> {
  return new Map(
    content.blogPosts.map((blogPost) => [blogPost.metadata.source, blogPost]),
  );
}

// TODO this is bad, we should have a better way to do this (new lifecycle?)
//  The source to blog/permalink is a mutable map passed to the mdx loader
//  See https://github.com/facebook/docusaurus/pull/10457
//  See https://github.com/facebook/docusaurus/pull/10185
export function createContentHelpers() {
  const sourceToBlogPost = new Map<string, BlogPost>();
  const sourceToPermalink = new Map<string, string>();

  // Mutable map update :/
  function updateContent(content: BlogContent): void {
    sourceToBlogPost.clear();
    sourceToPermalink.clear();
    indexBlogPostsBySource(content).forEach((value, key) => {
      sourceToBlogPost.set(key, value);
      sourceToPermalink.set(key, value.metadata.permalink);
    });
  }

  return {updateContent, sourceToBlogPost, sourceToPermalink};
}
