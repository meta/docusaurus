/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/CodeBlock/Buttons/Button';

export default function CodeBlockButton({
  className,
  ...props
}: Props): ReactNode {
  return (
    <button type="button" {...props} className={clsx('clean-btn', className)} />
  );
}
