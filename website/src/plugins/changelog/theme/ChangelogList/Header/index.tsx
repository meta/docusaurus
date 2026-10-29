/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

function XLink() {
  return (
    <Link href="https://x.com/docusaurus" className={styles.x}>
      <b>X</b>
      <svg
        style={{
          fill: '#1da1f2',
          position: 'relative',
          left: 4,
          top: 1,
          marginRight: 8,
        }}
        width="16"
        height="16"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512">
        <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
      </svg>
    </Link>
  );
}

function RssLink() {
  return (
    <Link href="pathname:///changelog/rss.xml" className={styles.rss}>
      <b>
        <Translate id="changelog.description.rssLink">RSS feeds</Translate>
      </b>
      <svg
        style={{
          fill: '#f26522',
          position: 'relative',
          left: 4,
          top: 1,
          marginRight: 8,
        }}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24">
        <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z" />
      </svg>
    </Link>
  );
}

export default function ChangelogListHeader({
  blogTitle,
}: {
  blogTitle: string;
}): ReactNode {
  return (
    <header className="margin-bottom--lg">
      <Heading as="h1" style={{fontSize: '3rem'}}>
        {blogTitle}
      </Heading>
      <p>
        <Translate
          id="changelog.description"
          values={{
            xLink: <XLink />,
            rssLink: <RssLink />,
          }}>
          {
            'Subscribe through {rssLink} or follow us on {xLink} to stay up-to-date with new releases!'
          }
        </Translate>
      </p>
    </header>
  );
}
