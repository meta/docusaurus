/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import BlogPostItems from '@theme/BlogPostItems';
import SearchMetadata from '@theme/SearchMetadata';
import ChangelogItem from '@theme/ChangelogItem';
import ChangelogListHeader from '@theme/ChangelogList/Header';
import type {Props} from '@theme/BlogListPage';

function ChangelogListMetadata(props: Props): ReactNode {
  const {metadata} = props;
  const {blogTitle, blogDescription} = metadata;
  return (
    <>
      <PageMetadata title={blogTitle} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function ChangelogListContent(props: Props): ReactNode {
  const {metadata, items, sidebar} = props;
  const {blogTitle} = metadata;
  return (
    <BlogLayout sidebar={sidebar}>
      <ChangelogListHeader blogTitle={blogTitle} />
      <BlogPostItems items={items} component={ChangelogItem} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}

export default function ChangelogList(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider className={ThemeClassNames.page.blogListPage}>
      <ChangelogListMetadata {...props} />
      <ChangelogListContent {...props} />
    </HtmlClassNameProvider>
  );
}
