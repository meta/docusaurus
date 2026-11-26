/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
// The website doesn't reference the PWA plugin types: Workbox ones need the
// WebWorker lib
// @ts-expect-error: missing PWA plugin types
import PwaReloadPopup from '@theme/PwaReloadPopup';

export default function PwaReloadPopupTests(): ReactNode {
  return (
    <Layout>
      <main className="container margin-vert--xl">
        <Heading as="h1">PWA reload popup tests</Heading>
        <p>
          The PWA plugin shows this popup when a new service worker is waiting.
          It should be visible in the bottom right corner.
        </p>
        <PwaReloadPopup onReload={() => {}} />
      </main>
    </Layout>
  );
}
