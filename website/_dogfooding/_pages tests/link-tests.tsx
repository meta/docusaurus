/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type ReactNode, useRef} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function LinkTest(): ReactNode {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  return (
    <Layout>
      <main className="container margin-vert--xl">
        <Link ref={anchorRef} to="/">
          A little link
        </Link>
        <button
          type="button"
          onClick={() => {
            anchorRef.current!.style.backgroundColor = 'red';
          }}>
          Change the link
        </button>
      </main>
    </Layout>
  );
}
