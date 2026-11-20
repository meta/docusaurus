/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getBlogPostBreadcrumbs} from './breadcrumbUtils';

describe('getBlogPostBreadcrumbs', () => {
  it('generates breadcrumbs from title and url positional arguments', () => {
    const breadcrumbs = getBlogPostBreadcrumbs(
      'Introducing Docusaurus v4',
      '/blog/introducing-docusaurus-v4',
    );

    expect(breadcrumbs).toEqual([
      {label: 'Home', href: '/'},
      {label: 'Blog', href: '/blog'},
      {label: 'Introducing Docusaurus v4', href: '/blog/introducing-docusaurus-v4'},
    ]);
  });

  it('generates breadcrumbs from object params with url', () => {
    const breadcrumbs = getBlogPostBreadcrumbs({
      title: 'My First Post',
      url: '/blog/2026/my-first-post',
    });

    expect(breadcrumbs).toEqual([
      {label: 'Home', href: '/'},
      {label: 'Blog', href: '/blog'},
      {label: 'My First Post', href: '/blog/2026/my-first-post'},
    ]);
  });

  it('generates breadcrumbs from object params with permalink', () => {
    const breadcrumbs = getBlogPostBreadcrumbs({
      title: 'Post with Permalink',
      permalink: '/blog/permalink-post',
    });

    expect(breadcrumbs).toEqual([
      {label: 'Home', href: '/'},
      {label: 'Blog', href: '/blog'},
      {label: 'Post with Permalink', href: '/blog/permalink-post'},
    ]);
  });

  it('allows customizing home and blog archive labels and urls', () => {
    const breadcrumbs = getBlogPostBreadcrumbs(
      'Deep Dive into SSG',
      '/blog/deep-dive-ssg',
      {
        homeLabel: 'Welcome',
        homeUrl: '/docs/intro',
        blogLabel: 'Archive',
        blogUrl: '/blog/archive',
      },
    );

    expect(breadcrumbs).toEqual([
      {label: 'Welcome', href: '/docs/intro'},
      {label: 'Archive', href: '/blog/archive'},
      {label: 'Deep Dive into SSG', href: '/blog/deep-dive-ssg'},
    ]);
  });
});
