/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {useWindowSize} from '@docusaurus/theme-common';
import BlogSidebarDesktop from '@theme/BlogSidebar/Desktop';
import BlogSidebarMobile from '@theme/BlogSidebar/Mobile';
import type {Props} from '@theme/BlogSidebar';

export default function BlogSidebar({sidebar}: Props): ReactNode {
  const windowSize = useWindowSize();
  if (!sidebar?.items.length) {
    return null;
  }
  // Mobile sidebar doesn't need to be server-rendered
  if (windowSize === 'mobile') {
    return <BlogSidebarMobile sidebar={sidebar} />;
  }
  return <BlogSidebarDesktop sidebar={sidebar} />;
}
