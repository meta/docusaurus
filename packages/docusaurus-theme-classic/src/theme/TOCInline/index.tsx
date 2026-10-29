/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import TOCItems from '@theme/TOCItems';
import type {Props} from '@theme/TOCInline';

import styles from './styles.module.css';

export default function TOCInline({
  toc,
  minHeadingLevel,
  maxHeadingLevel,
}: Props): ReactNode {
  return (
    <div className={styles.tableOfContentsInline}>
      <TOCItems
        toc={toc}
        minHeadingLevel={minHeadingLevel}
        maxHeadingLevel={maxHeadingLevel}
        className="table-of-contents"
        linkClassName={null}
      />
    </div>
  );
}
