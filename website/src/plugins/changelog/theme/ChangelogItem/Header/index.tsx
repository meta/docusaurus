/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';

import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import ChangelogItemHeaderAuthors from '@theme/ChangelogItem/Header/Authors';

import styles from './styles.module.css';

// Reduce changelog title size, but only on list view
function ChangelogTitle() {
  const {isBlogPostPage} = useBlogPost();
  return (
    <BlogPostItemHeaderTitle
      className={isBlogPostPage ? undefined : styles.changelogItemTitleList}
    />
  );
}

export default function ChangelogItemHeader(): ReactNode {
  return (
    <header>
      <ChangelogTitle />
      <BlogPostItemHeaderInfo />
      <ChangelogItemHeaderAuthors />
    </header>
  );
}
