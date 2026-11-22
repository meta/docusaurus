/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {translate} from '@docusaurus/Translate';
import IconArrow from '@theme/Icon/Arrow';
import type {Props} from '@theme/DocRoot/Layout/Sidebar/ExpandButton';

import styles from './styles.module.css';

export default function DocRootLayoutSidebarExpandButton({
  toggleSidebar,
}: Props): ReactNode {
  return (
    <div
      className={styles.expandButton}
      title={translate({
        id: 'theme.docs.sidebar.expandButtonTitle',
        message: 'Expand sidebar',
        description:
          'The ARIA label and title attribute for expand button of doc sidebar',
      })}
      aria-label={translate({
        id: 'theme.docs.sidebar.expandButtonAriaLabel',
        message: 'Expand sidebar',
        description:
          'The ARIA label and title attribute for expand button of doc sidebar',
      })}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSidebar();
        }
      }}
      onClick={toggleSidebar}>
      <IconArrow className={styles.expandButtonIcon} />
    </div>
  );
}
