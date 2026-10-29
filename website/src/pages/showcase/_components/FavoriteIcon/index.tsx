/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type React from 'react';
import type {ComponentProps} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

interface Props {
  className?: string;
  style?: ComponentProps<'svg'>['style'];
  size: 'small' | 'medium' | 'large';
}

export default function FavoriteIcon({
  size,
  className,
  style,
}: Props): React.ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx(styles.svg, styles[size], className)}
      style={style}>
      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
    </svg>
  );
}
