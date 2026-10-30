/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {Outlet} from '@docusaurus/router';
import Layout from '@theme/Layout';

export default function DocsRoot(): ReactNode {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
