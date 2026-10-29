/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module '@theme/ChangelogPaginator';

declare module '@theme/ChangelogItem';
declare module '@theme/ChangelogItem/Header';
declare module '@theme/ChangelogItem/Header/Author';
declare module '@theme/ChangelogItem/Header/Authors';

declare module '@theme/ChangelogList';
declare module '@theme/ChangelogList/Header';

declare module '@theme/Icon/Expand' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {
    expanded?: boolean;
  }

  export default function IconExpand(props: Props): ReactNode;
}
