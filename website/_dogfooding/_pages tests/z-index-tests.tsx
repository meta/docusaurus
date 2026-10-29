/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Layout from '@theme/Layout';

export default function zIndexTest(): ReactNode {
  return (
    <Layout>
      <p id="z-index-test">This should have a z-index of 100</p>
    </Layout>
  );
}
