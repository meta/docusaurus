/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import LinkItem from '@theme/Footer/LinkItem';
import type {Props} from '@theme/Footer/Links/Simple';

function Separator() {
  return <span className="footer__link-separator">·</span>;
}

function SimpleLinkItem({item}: {item: Props['links'][number]}) {
  return item.html ? (
    <span
      className={clsx('footer__link-item', item.className)}
      // Developer provided the HTML, so assume it's safe.
      dangerouslySetInnerHTML={{__html: item.html}}
    />
  ) : (
    <LinkItem item={item} />
  );
}

export default function FooterLinksSimple({links}: Props): ReactNode {
  return (
    <div className="footer__links text--center">
      <div className="footer__links">
        {links.map((item, i) => (
          <React.Fragment key={i}>
            <SimpleLinkItem item={item} />
            {links.length !== i + 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
