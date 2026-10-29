/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import type {Props} from '@theme/DocCard/Description';

import styles from './styles.module.css';

export default function DocCardDescription({description}: Props): ReactNode {
  return (
    <p
      className={clsx(
        'text--truncate',
        ThemeClassNames.docs.docCard.description,
        styles.cardDescription,
      )}
      title={description}>
      {description}
    </p>
  );
}
