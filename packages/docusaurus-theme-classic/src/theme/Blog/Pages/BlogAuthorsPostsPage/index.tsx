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
import Link from '@docusaurus/Link';
import {
  useBlogMetadata,
  useBlogAuthorPageTitle,
  BlogAuthorsListViewAllLabel,
  BlogAuthorNoPostsLabel,
} from '@docusaurus/plugin-content-blog/client';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/Blog/Pages/BlogAuthorsPostsPage';
import BlogPostItems from '@theme/BlogPostItems';
import Author from '@theme/Blog/Components/Author';

function Metadata({author}: Props): ReactNode {
  const title = useBlogAuthorPageTitle(author);
  return (
    <>
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_authors_posts" />
    </>
  );
}

function ViewAllAuthorsLink() {
  const {authorsListPath} = useBlogMetadata();
  return (
    <Link href={authorsListPath}>
      <BlogAuthorsListViewAllLabel />
    </Link>
  );
}

function Content({author, items, sidebar, listMetadata}: Props): ReactNode {
  return (
    <BlogLayout sidebar={sidebar}>
      <header className="margin-bottom--xl">
        <Author as="h1" author={author} />
        {author.description && <p>{author.description}</p>}
        <ViewAllAuthorsLink />
      </header>
      {items.length === 0 ? (
        <p>
          <BlogAuthorNoPostsLabel />
        </p>
      ) : (
        <>
          <hr />
          <BlogPostItems items={items} />
          <BlogListPaginator metadata={listMetadata} />
        </>
      )}
    </BlogLayout>
  );
}

export default function BlogAuthorsPostsPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={ThemeClassNames.page.blogAuthorsPostsPage}>
      <Metadata {...props} />
      <Content {...props} />
    </HtmlClassNameProvider>
  );
}
