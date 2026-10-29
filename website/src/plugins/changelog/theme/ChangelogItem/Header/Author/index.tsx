/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import type {Props} from '@theme/Blog/Components/Author';

import styles from './styles.module.css';

export default function ChangelogAuthor({author, className}: Props): ReactNode {
  const {name, url, imageURL} = author;
  return (
    <div className={clsx('avatar margin-bottom--sm', className)}>
      {imageURL && (
        <Link className="avatar__photo-link avatar__photo" href={url}>
          <img
            className={styles.image}
            src={imageURL}
            alt={name}
            onError={(e) => {
              // Image returns 404 if the user's handle changes. We display a
              // fallback instead.
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" fill="none" stroke="%2325c2a0" stroke-width="30" version="1.1"><circle cx="300" cy="230" r="115"/><path stroke-linecap="butt" d="M106.81863443903,481.4 a205,205 1 0,1 386.36273112194,0"/></svg>';
            }}
          />
        </Link>
      )}
    </div>
  );
}
