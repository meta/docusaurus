/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/Icon/Edit';

import styles from './styles.module.css';

export default function IconEdit({className, ...restProps}: Props): ReactNode {
  return (
    <svg
      fill="currentColor"
      height="20"
      width="20"
      viewBox="0 0 40 40"
      className={clsx(styles.iconEdit, className)}
      aria-hidden="true"
      {...restProps}>
      <g>
        <path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z" />
      </g>
    </svg>
  );
}
