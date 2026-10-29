/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import type {Props} from '@theme/ThemeProvider';

// Wrapper component expected to be implemented by a theme
// Unlike <Layout>, it applies to all sites routes and never unmounts
//
// Unlike <Root>, the theme is expected to provide an implementation
// <Root> is empty and the implementation is expected to be provided by the user
//
// Tree order: Root > ThemeProvider > Layout
export default function ThemeProvider({children}: Props): ReactNode {
  return <>{children}</>;
}
