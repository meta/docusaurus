/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {NavbarMobileSidebarProvider} from '../contexts/navbarMobileSidebar';
import {NavbarSecondaryMenuContentProvider} from '../contexts/navbarSecondaryMenu/content';
import {NavbarSecondaryMenuDisplayProvider} from '../contexts/navbarSecondaryMenu/display';

const DefaultNavItemPosition = 'right';

/**
 * Split links by left/right. If position is unspecified, fallback to right.
 */
export function splitNavbarItems<T extends {position?: 'left' | 'right'}>(
  items: T[],
): [leftItems: T[], rightItems: T[]] {
  function isLeft(item: T): boolean {
    return (item.position ?? DefaultNavItemPosition) === 'left';
  }

  const leftItems = items.filter(isLeft);
  const rightItems = items.filter((item) => !isLeft(item));

  return [leftItems, rightItems];
}

/**
 * Composes multiple navbar state providers that are mutually dependent and
 * hence can't be re-ordered.
 */
export function NavbarProvider({children}: {children: ReactNode}): ReactNode {
  return (
    <NavbarSecondaryMenuContentProvider>
      <NavbarMobileSidebarProvider>
        <NavbarSecondaryMenuDisplayProvider>
          {children}
        </NavbarSecondaryMenuDisplayProvider>
      </NavbarMobileSidebarProvider>
    </NavbarSecondaryMenuContentProvider>
  );
}
