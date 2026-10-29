/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import type {Props} from '@theme/CodeBlock';

// This component does nothing on purpose
// Dogfood: wrapping a theme component already enhanced by another theme
// See https://github.com/facebook/docusaurus/pull/5983
export default function CodeBlockWrapper(props: Props): ReactNode {
  return <CodeBlock {...props} />;
}
