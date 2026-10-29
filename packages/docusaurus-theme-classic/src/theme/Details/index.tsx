/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import {Details as DetailsGeneric} from '@docusaurus/theme-common/Details';
import type {Props} from '@theme/Details';

import styles from './styles.module.css';

// Should we have a custom details/summary comp in Infima instead of reusing
// alert classes?
const InfimaClasses = 'alert alert--info';

export default function Details({...props}: Props): ReactNode {
  return (
    <DetailsGeneric
      {...props}
      className={clsx(InfimaClasses, styles.details, props.className)}
    />
  );
}
