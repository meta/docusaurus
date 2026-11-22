/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {SkipToContentLink} from '@docusaurus/theme-common';
import styles from './styles.module.css';

export default function SkipToContent({title}: {title?: string}): ReactNode {
  return <SkipToContentLink className={styles.skipToContent} title={title} />;
}
