/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode, Suspense} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const HeavyComponentLazy = React.lazy(
  () => import('./_components/heavyComponent'),
);

export default function SuspenseTests(): ReactNode {
  return (
    <Layout>
      <main style={{padding: 30}}>
        <Heading as="h1">Suspense tests</Heading>
        <p>
          Lazy components should render on the server when possible, and display
          the closest fallback while loading on the client.
        </p>

        <hr />

        <Heading as="h2">{'Suspense > HeavyComponent'}</Heading>
        <p>HeavyComponent should be server-side rendered.</p>
        <Suspense fallback="[Suspense fallback] - Suspense > HeavyComponent">
          <HeavyComponentLazy />
        </Suspense>

        <hr />

        <Heading as="h2">{'BrowserOnly > Suspense > HeavyComponent'}</Heading>
        <p>
          HeavyComponent should only be rendered on the client, inside the
          nested Suspense boundary.
        </p>
        <BrowserOnly>
          {() => (
            <Suspense fallback="[Suspense fallback] - BrowserOnly > Suspense > HeavyComponent">
              <HeavyComponentLazy />
            </Suspense>
          )}
        </BrowserOnly>

        <hr />

        <Heading as="h2">{'Suspense > BrowserOnly > HeavyComponent'}</Heading>
        <p>
          BrowserOnly has its own Suspense boundary: the parent Suspense
          fallback should never be displayed.
        </p>
        <Suspense fallback="[Suspense fallback] - Suspense > BrowserOnly > HeavyComponent">
          <BrowserOnly fallback="[BrowserOnly fallback] - Suspense > BrowserOnly > HeavyComponent">
            {() => <HeavyComponentLazy />}
          </BrowserOnly>
        </Suspense>
      </main>
    </Layout>
  );
}
