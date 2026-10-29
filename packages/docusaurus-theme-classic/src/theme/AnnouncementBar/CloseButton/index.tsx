/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import IconClose from '@theme/Icon/Close';
import type {Props} from '@theme/AnnouncementBar/CloseButton';
import styles from './styles.module.css';

export default function AnnouncementBarCloseButton(props: Props): ReactNode {
  return (
    <button
      type="button"
      aria-label={translate({
        id: 'theme.AnnouncementBar.closeButtonAriaLabel',
        message: 'Close',
        description: 'The ARIA label for close button of announcement bar',
      })}
      {...props}
      className={clsx('clean-btn close', styles.closeButton, props.className)}>
      <IconClose width={14} height={14} strokeWidth={3.1} />
    </button>
  );
}
