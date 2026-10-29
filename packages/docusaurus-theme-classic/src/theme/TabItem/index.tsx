/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import {useTabs} from '@docusaurus/theme-common/internal';
import type {Props} from '@theme/TabItem';

import styles from './styles.module.css';

function TabItemPanel({
  children,
  className,
  hidden,
}: {
  children: ReactNode;
  className?: string;
  hidden?: boolean;
}) {
  return (
    <div
      role="tabpanel"
      className={clsx(styles.tabItem, className)}
      {...{hidden}}>
      {children}
    </div>
  );
}

export default function TabItem({
  children,
  className,
  value,
}: Props): ReactNode {
  const {selectedValue, lazy} = useTabs();
  const isSelected = value === selectedValue;

  // TODO Docusaurus v4: use <Activity> ?
  if (!isSelected && lazy) {
    return null;
  }

  return (
    <TabItemPanel className={className} hidden={!isSelected}>
      {children}
    </TabItemPanel>
  );
}
