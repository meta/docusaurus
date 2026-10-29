/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Layout from '@theme/Layout';

// See https://github.com/facebook/docusaurus/issues/6337#issuecomment-1012913647
export default function LayoutNoChildren(): ReactNode {
  return <Layout />;
}
