/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import '@generated/client-modules';

import {useRoutes, type Location} from 'react-router';
import {Outlet, useLocation} from '@docusaurus/router';
import Root from '@theme/Root';
import ThemeProvider from '@theme/ThemeProvider';
import SiteMetadata from '@theme/SiteMetadata';
import normalizeLocation from './normalizeLocation';
import {routeObjects} from './routeObjects';
import {DocusaurusContextProvider} from './docusaurusContext';
import ClientLifecyclesDispatcher from './ClientLifecyclesDispatcher';
import BaseUrlIssueBanner from './BaseUrlIssueBanner';
import SiteMetadataDefaults from './SiteMetadataDefaults';

// TODO, quick fix for CSS insertion order
// eslint-disable-next-line import/order
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import HasHydratedDataAttribute from './hasHydratedDataAttribute';

function NormalizedRoutes({location}: {location: Location}): ReactNode {
  return useRoutes(routeObjects, location);
}

function AppNavigation() {
  const location = useLocation();
  const normalizedLocation = normalizeLocation(location);
  return (
    <ClientLifecyclesDispatcher location={location}>
      {normalizedLocation.pathname === location.pathname ? (
        <Outlet />
      ) : (
        // The router only renders the URL location: route components must
        // read the normalized location, like /page for /page.html
        <NormalizedRoutes location={normalizedLocation} />
      )}
    </ClientLifecyclesDispatcher>
  );
}

export default function App(): ReactNode {
  return (
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
  );
}
