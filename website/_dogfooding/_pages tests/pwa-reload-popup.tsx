/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ComponentType, ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

// The PWA plugin is disabled in dev builds (Argos uses one): no @theme alias
// Its types need the WebWorker lib (Workbox), the website doesn't load them
const PwaReloadPopup: ComponentType<{onReload: () => void}> =
  require('@docusaurus/plugin-pwa/lib/theme/PwaReloadPopup').default;

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
