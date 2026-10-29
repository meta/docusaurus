/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import ChangelogItemHeader from '@theme/ChangelogItem/Header';
import type {Props} from '@theme/BlogPostItem';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemContent from '@theme/BlogPostItem/Content';

import styles from './styles.module.css';

export default function ChangelogItem({children}: Props): ReactNode {
  return (
    <BlogPostItemContainer className={styles.changelogItemContainer}>
      <ChangelogItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
    </BlogPostItemContainer>
  );
}
