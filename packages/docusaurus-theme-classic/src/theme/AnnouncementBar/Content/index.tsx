/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import type {Props} from '@theme/AnnouncementBar/Content';
import styles from './styles.module.css';

export default function AnnouncementBarContent(props: Props): ReactNode {
  const {announcementBar} = useThemeConfig();
  const {content} = announcementBar!;
  return (
    <div
      {...props}
      className={clsx(styles.content, props.className)}
      // Developer provided the HTML, so assume it's safe.
      dangerouslySetInnerHTML={{__html: content}}
    />
  );
}
