/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import PlaygroundProvider from '@theme/Playground/Provider';
import PlaygroundContainer from '@theme/Playground/Container';
import PlaygroundLayout from '@theme/Playground/Layout';

import type {Props} from '@theme/Playground';

export default function Playground({
  children,
  transformCode,
  position,
  ...props
}: Props): ReactNode {
  return (
    <PlaygroundContainer>
      <PlaygroundProvider code={children} {...props}>
        <PlaygroundLayout position={position} />
      </PlaygroundProvider>
    </PlaygroundContainer>
  );
}
