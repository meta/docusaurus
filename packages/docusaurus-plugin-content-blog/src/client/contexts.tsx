/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useMemo, type ReactNode, useContext} from 'react';
import {ReactContextError} from '@docusaurus/theme-common';
import useRouteContext from '@docusaurus/useRouteContext';

import type {
  PropBlogPostContent,
  BlogMetadata,
} from '@docusaurus/plugin-content-blog';

export function useBlogMetadata(): BlogMetadata {
  const routeContext = useRouteContext();
  const blogMetadata = routeContext?.data?.blogMetadata;
  if (!blogMetadata) {
    throw new Error(
      "useBlogMetadata() can't be called on the current route because the blog metadata could not be found in route context",
    );
  }
  return blogMetadata as BlogMetadata;
}

/**
 * The React context value returned by the `useBlogPost()` hook.
 * It contains useful data related to the currently browsed blog post.
 */
export type BlogPostContextValue = Pick<
  PropBlogPostContent,
  'metadata' | 'frontMatter' | 'assets' | 'toc'
> & {
  readonly isBlogPostPage: boolean;
};

const Context = React.createContext<BlogPostContextValue | null>(null);

/**
 * Note: we don't use `PropBlogPostContent` as context value on purpose.
 * Metadata is currently stored inside the MDX component, but we may want to
 * change that in the future.
 */
function useContextValue({
  content,
  isBlogPostPage,
}: {
  content: PropBlogPostContent;
  isBlogPostPage: boolean;
}): BlogPostContextValue {
  return useMemo(
    () => ({
      metadata: content.metadata,
      frontMatter: content.frontMatter,
      assets: content.assets,
      toc: content.toc,
      isBlogPostPage,
    }),
    [content, isBlogPostPage],
  );
}

/**
 * This is a very thin layer around the `content` received from the MDX loader.
 * It provides metadata about the blog post to the children tree.
 */
export function BlogPostProvider({
  children,
  content,
  isBlogPostPage = false,
}: {
  children: ReactNode;
  content: PropBlogPostContent;
  isBlogPostPage?: boolean;
}): ReactNode {
  const contextValue = useContextValue({content, isBlogPostPage});
  return <Context value={contextValue}>{children}</Context>;
}

/**
 * Returns the data of the currently browsed blog post. Gives access to
 * front matter, metadata, TOC, etc.
 * When swizzling a low-level component (e.g. the "Edit this page" link)
 * and you need some extra metadata, you don't have to drill the props
 * all the way through the component tree: simply use this hook instead.
 */
export function useBlogPost(): BlogPostContextValue {
  const blogPost = useContext(Context);
  if (blogPost === null) {
    throw new ReactContextError('BlogPostProvider');
  }
  return blogPost;
}
