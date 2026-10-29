/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Playground from '@theme/Playground';
import ReactLiveScope from '@theme/ReactLiveScope';
import type {Props} from '@theme/LiveCodeBlock';

export default function LiveCodeBlock(props: Props): ReactNode {
  return <Playground scope={ReactLiveScope} {...props} />;
}
