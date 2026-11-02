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
import {isSamePath} from './routesUtils';
import {isRegexpStringMatch} from './regexpUtils';
import type {Location} from 'history';

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

export type NavItemActiveConfig = {
  readonly to?: string;
  readonly exact?: boolean;
  readonly activeBasePath?: string;
  readonly activeBaseRegex?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly isActive?: (match: any, location: any) => boolean;
  readonly items?: readonly NavItemActiveConfig[];
};

export function isItemActive(
  item: NavItemActiveConfig,
  localPathname: string,
  location?: Location | {pathname: string; [key: string]: unknown},
): boolean {
  if (item.isActive) {
    return item.isActive(null, location ?? {pathname: localPathname});
  }
  if (isSamePath(item.to, localPathname)) {
    return true;
  }
  if (isRegexpStringMatch(item.activeBaseRegex, localPathname)) {
    return true;
  }
  if (item.activeBasePath && localPathname.startsWith(item.activeBasePath)) {
    return true;
  }
  if (item.items && containsActiveItems(item.items, localPathname, location)) {
    return true;
  }
  return false;
}

export function containsActiveItems(
  items: readonly NavItemActiveConfig[],
  localPathname: string,
  location?: Location | {pathname: string; [key: string]: unknown},
): boolean {
  return items.some((item) => isItemActive(item, localPathname, location));
}
