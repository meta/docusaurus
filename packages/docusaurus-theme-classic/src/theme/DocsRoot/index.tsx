/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import renderRoutes from '@docusaurus/renderRoutes';
import Layout from '@theme/Layout';

import type {Props} from '@theme/DocsRoot';

export default function DocsRoot(props: Props): ReactNode {
  return <Layout>{renderRoutes(props.route.routes!)}</Layout>;
}
