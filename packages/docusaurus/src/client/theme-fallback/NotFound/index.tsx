/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Should we translate theme-fallback?
/* eslint-disable @docusaurus/no-untranslated-text */

import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

export default function NotFound(): ReactNode {
  return (
    <>
      <Head>
        <title>Page Not Found</title>
      </Head>
      <Layout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '20px',
          }}>
          <h1>Oops, page not found </h1>
        </div>
      </Layout>
    </>
  );
}
