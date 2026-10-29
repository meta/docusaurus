/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import type {Props} from '@theme/CodeBlock/Line/Token';

// Pass-through components that users can swizzle and customize
export default function CodeBlockLineToken({
  line,
  token,
  ...props
}: Props): ReactNode {
  return <span {...props} />;
}
