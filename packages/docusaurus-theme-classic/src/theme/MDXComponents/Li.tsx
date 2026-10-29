/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {useAnchorTargetClassName} from '@docusaurus/theme-common';
import type {Props} from '@theme/MDXComponents/Li';

export default function MDXLi(props: Props): ReactNode | undefined {
  // MDX Footnotes have ids such as <li id="user-content-fn-1-953011">
  useBrokenLinks().collectAnchor(props.id);
  const anchorTargetClassName = useAnchorTargetClassName(props.id);

  return (
    <li className={clsx(anchorTargetClassName, props.className)} {...props} />
  );
}
