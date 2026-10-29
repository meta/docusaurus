/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

export default function HackerNewsIcon({
  size = 54,
}: {
  size?: number;
}): ReactNode {
  return (
    <Link
      to="https://news.ycombinator.com/item?id=32303052"
      style={{display: 'block', width: size, height: size}}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width={size}
        height={size}>
        <path fill="#FF6D00" d="M42 42H6V6h36v36z" />
        <path fill="#FFF" d="M8 8v32h32V8H8zm30 30H10V10h28v28z" />
        <path
          fill="#FFF"
          d="M23 32h2v-6l5.5-10h-2.1L24 24.1 19.6 16h-2.1L23 26z"
        />
      </svg>
    </Link>
  );
}
