/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import type {Props as CodeBlockProps} from '@theme/CodeBlock';
import OriginalCodeBlock from '@theme-init/CodeBlock';
import LiveCodeBlock from '@theme/LiveCodeBlock';

function isLiveCodeBlock(
  props: CodeBlockProps,
): props is CodeBlockProps & {children: string | undefined} {
  return (
    !!props.metastring?.split(/\s+/).includes('live') &&
    (typeof props.children === 'undefined' ||
      typeof props.children === 'string')
  );
}

export default function CodeBlockEnhancer(props: CodeBlockProps): ReactNode {
  return isLiveCodeBlock(props) ? (
    <LiveCodeBlock {...props} />
  ) : (
    <OriginalCodeBlock {...props} />
  );
}
