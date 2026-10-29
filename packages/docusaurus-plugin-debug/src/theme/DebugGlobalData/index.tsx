/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import useGlobalData from '@docusaurus/useGlobalData';
import DebugLayout from '@theme/DebugLayout';
import DebugJsonView from '@theme/DebugJsonView';

export default function DebugMetadata(): ReactNode {
  const globalData = useGlobalData();
  return (
    <DebugLayout>
      <h2>Global data</h2>
      <DebugJsonView src={globalData} collapseDepth={3} />
    </DebugLayout>
  );
}
