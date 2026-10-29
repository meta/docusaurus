/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import type {Props} from '@theme/MDXComponents/Pre';

export default function MDXPre(props: Props): ReactNode | undefined {
  // With MDX 2, this element is only used for fenced code blocks
  // It always receives a MDXComponents/Code as children
  return <>{props.children}</>;
}
