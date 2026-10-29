/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type ReactNode, useState} from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import ChangelogItemHeaderAuthor from '@theme/ChangelogItem/Header/Author';
import IconExpand from '@theme/Icon/Expand';
import type {Props} from '@theme/BlogPostItem/Header/Authors';

import styles from './styles.module.css';

// Component responsible for the authors layout
export default function BlogPostAuthors({className}: Props): ReactNode {
  const {
    metadata: {authors},
    assets,
  } = useBlogPost();
  const [expanded, setExpanded] = useState(false);
  const authorsCount = authors.length;
  if (authorsCount === 0) {
    return null;
  }
  const filteredAuthors = authors.slice(0, expanded ? authors.length : 10);
  return (
    <div
      className={clsx(
        'margin-top--md margin-bottom--sm',
        styles.imageOnlyAuthorRow,
        className,
      )}>
      {filteredAuthors.map((author, idx) => (
        <div className={styles.imageOnlyAuthorCol} key={idx}>
          <ChangelogItemHeaderAuthor
            author={{
              ...author,
              // Handle author images using relative paths
              imageURL: assets.authorsImageUrls[idx] ?? author.imageURL,
            }}
          />
        </div>
      ))}
      {authors.length > 10 && (
        <button
          className={clsx('clean-btn', styles.toggleButton)}
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label="expand">
          <IconExpand expanded={expanded} />
        </button>
      )}
    </div>
  );
}
