/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/BlogListPage';
import BlogPostItems from '@theme/BlogPostItems';
import Heading from '@theme/Heading';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';

function useBlogListPageTitle(props: Props): string {
  const {metadata} = props;
  const {
    siteConfig: {title: siteTitle},
  } = useDocusaurusContext();
  const {blogTitle, permalink} = metadata;
  const isBlogOnlyMode = permalink === '/';
  return isBlogOnlyMode ? siteTitle : blogTitle;
}

function BlogListPageMetadata(props: Props): ReactNode {
  const {metadata} = props;
  const {blogDescription} = metadata;
  const title = useBlogListPageTitle(props);
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent(props: Props): ReactNode {
  const {metadata, items, sidebar} = props;
  const title = useBlogListPageTitle(props);
  return (
    <BlogLayout sidebar={sidebar}>
      <Heading as="h1">{title}</Heading>
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}

export default function BlogListPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider className={ThemeClassNames.page.blogListPage}>
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
