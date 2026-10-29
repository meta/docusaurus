/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import {HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import {
  BlogPostProvider,
  useBlogPost,
} from '@docusaurus/plugin-content-blog/client';
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata';
import BlogLayout from '@theme/BlogLayout';
import ChangelogItem from '@theme/ChangelogItem';
import ChangelogPaginator from '@theme/ChangelogPaginator';
import TOC from '@theme/TOC';
import type {Props} from '@theme/BlogPostPage';
import type {BlogSidebar} from '@docusaurus/plugin-content-blog';

function BackToIndexLink() {
  const {metadata} = useBlogPost();
  // @ts-expect-error: we injected this
  const {listPageLink} = metadata;
  return (
    <Link to={listPageLink}>
      <Translate id="changelog.backLink">← Back to index page</Translate>
    </Link>
  );
}

function ChangelogPageContent({
  sidebar,
  children,
}: {
  sidebar: BlogSidebar;
  children: ReactNode;
}): ReactNode {
  const {metadata, toc} = useBlogPost();
  const {nextItem, prevItem, frontMatter} = metadata;
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;
  return (
    <BlogLayout
      sidebar={sidebar}
      toc={
        !hideTableOfContents && toc.length > 0 ? (
          <TOC
            toc={toc}
            minHeadingLevel={tocMinHeadingLevel}
            maxHeadingLevel={tocMaxHeadingLevel}
          />
        ) : undefined
      }>
      <BackToIndexLink />

      <ChangelogItem>{children}</ChangelogItem>

      {(nextItem || prevItem) && (
        <ChangelogPaginator nextItem={nextItem} prevItem={prevItem} />
      )}
    </BlogLayout>
  );
}

// This page doesn't change anything. It's just swapping BlogPostItem with our
// own ChangelogItem. We don't want to apply the swizzled item to the actual
// blog.
export default function ChangelogPage(props: Props): ReactNode {
  const ChangelogContent = props.content;
  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider className={ThemeClassNames.page.blogPostPage}>
        <BlogPostPageMetadata />
        <ChangelogPageContent sidebar={props.sidebar}>
          <ChangelogContent />
        </ChangelogPageContent>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
