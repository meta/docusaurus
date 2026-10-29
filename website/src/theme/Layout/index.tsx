/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Layout from '@theme-original/Layout';
import type {Props} from '@theme/Layout';

// This component is only used to test for CSS insertion order
import './styles.module.css';

export default function LayoutWrapper(props: Props): ReactNode {
  return <Layout {...props} />;
}
