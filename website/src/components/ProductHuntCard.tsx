/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ComponentProps, ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

export default function ProductHuntCard({
  className,
  style,
}: {
  className?: string;
  style?: ComponentProps<'a'>['style'];
}): ReactNode {
  return (
    <Link
      to="https://www.producthunt.com/posts/docusaurus-2-0?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-docusaurus-2-0"
      className={clsx('producthunt-badge-widget', className)}
      style={{display: 'block', width: 250, height: 54, ...style}}>
      <img
        className="producthunt-badge-widget"
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=353916&theme=light"
        alt="Docusaurus 2.0 - Build optimized websites quickly, focus on your content. | Product Hunt"
        style={{width: 250, height: 54, maxWidth: 'initial'}}
        width={250}
        height={54}
      />
    </Link>
  );
}
