/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import EditThisPage from '@theme/EditThisPage';
import type {Props} from '@theme/EditMetaRow';

import LastUpdated from '@theme/LastUpdated';
import styles from './styles.module.css';

export default function EditMetaRow({
  className,
  editUrl,
  lastUpdatedAt,
  lastUpdatedBy,
}: Props): ReactNode {
  return (
    <div className={clsx('row', className)}>
      <div className={clsx('col', styles.noPrint)}>
        {editUrl && <EditThisPage editUrl={editUrl} />}
      </div>
      <div className={clsx('col', styles.lastUpdated)}>
        {(lastUpdatedAt || lastUpdatedBy) && (
          <LastUpdated
            lastUpdatedAt={lastUpdatedAt}
            lastUpdatedBy={lastUpdatedBy}
          />
        )}
      </div>
    </div>
  );
}
