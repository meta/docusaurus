/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {ThemeClassNames} from '@docusaurus/theme-common';
import Heading from '@theme/DocCard/Heading';
import Description from '@theme/DocCard/Description';
import type {Props} from '@theme/DocCard/Layout';

import styles from './styles.module.css';

function Container({
  className,
  href,
  children,
}: {
  className?: string;
  href: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Link
      href={href}
      className={clsx(
        'card padding--lg',
        ThemeClassNames.docs.docCard.container,
        styles.cardContainer,
        className,
      )}>
      {children}
    </Link>
  );
}

export default function DocCardLayout({
  item,
  className,
  href,
  icon,
  title,
  description,
}: Props): ReactNode {
  return (
    <Container href={href} className={className}>
      <Heading item={item} icon={icon} title={title} />
      {description && <Description item={item} description={description} />}
    </Container>
  );
}
