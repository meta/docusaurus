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
  content: ReactNode;
  date: string;
  githubUsername: string;
}

export default function Tweet({
  url,
  handle,
  name,
  content,
  date,
  githubUsername,
}: Props): ReactNode {
  return (
    <div className={clsx('card', styles.tweet)}>
      <div className="card__header">
        <div className="avatar">
          <img
            alt={name}
            className="avatar__photo"
            src={`https://unavatar.io/x/${handle}?fallback=https://github.com/${githubUsername}.png`}
            width="48"
            height="48"
            loading="lazy"
          />
          <div className={clsx('avatar__intro', styles.tweetMeta)}>
            <strong className="avatar__name">{name}</strong>
            <span>@{handle}</span>
          </div>
        </div>
      </div>

      <div className={clsx('card__body', styles.tweet)}>{content}</div>

      <div className="card__footer">
        <Link className={clsx(styles.tweetMeta, styles.tweetDate)} to={url}>
          {date}
        </Link>
      </div>
    </div>
  );
}
