/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type BlogBreadcrumbItem = {
  label: string;
  href: string;
};

export type BlogPostBreadcrumbsOptions = {
  /** The root home page URL. Defaults to '/' */
  homeUrl?: string;
  /** The root home page label. Defaults to 'Home' */
  homeLabel?: string;
  /** The blog or archive page URL. Defaults to '/blog' */
  blogUrl?: string;
  /** The blog or archive page label. Defaults to 'Blog' */
  blogLabel?: string;
};

export type BlogPostBreadcrumbsParams = {
  title: string;
  url?: string;
  permalink?: string;
};

/**
 * Returns an array of breadcrumb items for a given blog post:
 * Home -> Blog (archive) -> <Post Title>
 */
export function getBlogPostBreadcrumbs(
  post: BlogPostBreadcrumbsParams,
  options?: BlogPostBreadcrumbsOptions,
): BlogBreadcrumbItem[];
export function getBlogPostBreadcrumbs(
  title: string,
  url: string,
  options?: BlogPostBreadcrumbsOptions,
): BlogBreadcrumbItem[];
export function getBlogPostBreadcrumbs(
  postOrTitle: BlogPostBreadcrumbsParams | string,
  urlOrOptions?: string | BlogPostBreadcrumbsOptions,
  options?: BlogPostBreadcrumbsOptions,
): BlogBreadcrumbItem[] {
  const isObjectInput = typeof postOrTitle === 'object' && postOrTitle !== null;
  const title = isObjectInput ? postOrTitle.title : postOrTitle;
  const url = isObjectInput
    ? (postOrTitle.url ?? postOrTitle.permalink ?? '')
    : (urlOrOptions as string);
  const opts =
    (isObjectInput
      ? (urlOrOptions as BlogPostBreadcrumbsOptions)
      : options) ?? {};

  const homeLabel = opts.homeLabel ?? 'Home';
  const homeUrl = opts.homeUrl ?? '/';
  const blogLabel = opts.blogLabel ?? 'Blog';
  const blogUrl = opts.blogUrl ?? '/blog';

  return [
    {
      label: homeLabel,
      href: homeUrl,
    },
    {
      label: blogLabel,
      href: blogUrl,
    },
    {
      label: title,
      href: url,
    },
  ];
}
