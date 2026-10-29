/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';

import type {Props} from '@theme/NavbarItem/HtmlNavbarItem';

export default function HtmlNavbarItem({
  value,
  className,
  mobile = false,
  isDropdownItem = false,
}: Props): ReactNode {
  const Comp = isDropdownItem ? 'li' : 'div';
  return (
    <Comp
      className={clsx(
        {
          navbar__item: !mobile && !isDropdownItem,
          'menu__list-item': mobile,
        },
        className,
      )}
      dangerouslySetInnerHTML={{__html: value}}
    />
  );
}
