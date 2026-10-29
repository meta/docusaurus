/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import NavbarNavLink from '@theme/NavbarItem/NavbarNavLink';
import type {Props} from '@theme/NavbarItem/DefaultNavbarItem/Mobile';

export default function DefaultNavbarItemMobile({
  className,
  isDropdownItem,
  ...props
}: Props): ReactNode {
  return (
    <li className="menu__list-item">
      <NavbarNavLink className={clsx('menu__link', className)} {...props} />
    </li>
  );
}
