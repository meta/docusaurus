/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import TitleFormatterProvider from '@theme/ThemeProvider/TitleFormatter';
import type {Props} from '@theme/ThemeProvider';

export default function ThemeProvider({children}: Props): ReactNode {
  return <TitleFormatterProvider>{children}</TitleFormatterProvider>;
}
