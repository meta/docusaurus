/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Suspense, type ReactNode} from 'react';
import '@generated/client-modules';

import routes from '@generated/routes';
import {useLocation} from '@docusaurus/router';
import renderRoutes from '@docusaurus/renderRoutes';
import Root from '@theme/Root';
import ThemeProvider from '@theme/ThemeProvider';
import SiteMetadata from '@theme/SiteMetadata';
import normalizeLocation from './normalizeLocation';
import {DocusaurusContextProvider} from './docusaurusContext';
import PendingNavigation from './PendingNavigation';
import BaseUrlIssueBanner from './BaseUrlIssueBanner';
import SiteMetadataDefaults from './SiteMetadataDefaults';

// TODO, quick fix for CSS insertion order
// eslint-disable-next-line import/order
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import HasHydratedDataAttribute from './hasHydratedDataAttribute';

const routesElement = renderRoutes(routes);

function AppNavigation() {
  const location = useLocation();
  const normalizedLocation = normalizeLocation(location);
  return (
    <PendingNavigation location={normalizedLocation}>
      {routesElement}
    </PendingNavigation>
  );
}

export default function App(): ReactNode {
  // React keeps leftover server nodes at the root, but not inside a Suspense
  // boundary: https://github.com/facebook/docusaurus/pull/10059
  return (
    <Suspense>
      <ErrorBoundary>
        <DocusaurusContextProvider>
          <Root>
            <ThemeProvider>
              <SiteMetadataDefaults />
              <SiteMetadata />
              <BaseUrlIssueBanner />
              <AppNavigation />
            </ThemeProvider>
          </Root>
          <HasHydratedDataAttribute />
        </DocusaurusContextProvider>
      </ErrorBoundary>
    </Suspense>
  );
}
