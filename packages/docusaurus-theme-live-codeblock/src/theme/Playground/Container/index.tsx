/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';

import type {Props} from '@theme/Playground/Container';

import styles from './styles.module.css';

export default function PlaygroundContainer({children}: Props): ReactNode {
  return <div className={styles.playgroundContainer}>{children}</div>;
}
