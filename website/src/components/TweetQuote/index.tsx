/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';

import clsx from 'clsx';

import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export interface Props {
  url: string;
  handle: string;
  name: string;
  job: string;
  children: ReactNode;
}

export default function TweetQuote({
  url,
  handle,
  name,
  job,
  children,
}: Props): ReactNode {
  const avatar = `https://unavatar.io/x/${handle}`;
  const profileUrl = `https://x.com/${handle}`;
  return (
    <figure className={styles.tweetQuote}>
      <blockquote>
        <Link to={url}>{children}</Link>
      </blockquote>
      <figcaption>
        <Link to={profileUrl} rel="nofollow">
          <div className="avatar">
            <img
              alt={name}
              className={clsx('avatar__photo', styles.avatarImg)}
              src={avatar}
              // loading="lazy"
            />
            <div className={clsx('avatar__intro')}>
              <strong className="avatar__name">
                <cite>{name}</cite>
              </strong>
              <small className="avatar__subtitle" itemProp="description">
                {job}
              </small>
            </div>
          </div>
        </Link>
      </figcaption>
    </figure>
  );
}
