/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {startTransition} from 'react';
import ReactDOM, {type ErrorInfo} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import {RouterProvider} from 'react-router';
import ExecutionEnvironment from './exports/ExecutionEnvironment';
import {createAppRouter, waitForInitialization} from './appRouter';
import {RouterContextProvider} from './routerContext';
import {dispatchRouteUpdates} from './ClientLifecyclesDispatcher';
import docusaurus from './docusaurus';

const hydrate = Boolean(process.env.HYDRATE_CLIENT_ENTRY);

// Client-side render (e.g: running in browser) to become single-page
// application (SPA).
if (ExecutionEnvironment.canUseDOM) {
  window.docusaurus = docusaurus;
  const container = document.getElementById('__docusaurus')!;
  const router = createAppRouter();

  const app = (
    <HelmetProvider>
      <RouterContextProvider router={router}>
        {/* Navigation lifecycles expect synchronous location updates */}
        <RouterProvider router={router} useTransitions={false} />
      </RouterContextProvider>
    </HelmetProvider>
  );

  const onRecoverableError = (error: unknown, errorInfo: ErrorInfo): void => {
    console.error(
      'Docusaurus React Root onRecoverableError:',
      error,
      errorInfo,
    );
  };

  const renderApp = () => {
    if (window.docusaurusRoot) {
      window.docusaurusRoot.render(app);
      return;
    }
    if (hydrate) {
      window.docusaurusRoot = ReactDOM.hydrateRoot(container, app, {
        onRecoverableError,
      });
    } else {
      const root = ReactDOM.createRoot(container, {onRecoverableError});
      root.render(app);
      window.docusaurusRoot = root;
    }
  };

  // Hydrating before the page chunks are loaded would render a mismatch
  waitForInitialization(router).then(() => {
    dispatchRouteUpdates(router);
    startTransition(renderApp);
  });

  // Webpack Hot Module Replacement API
  if (module.hot) {
    // The next module execution creates a new router
    module.hot.dispose(() => router.dispose());
    // Self-accepting method/ trick
    // (https://github.com/webpack/webpack-dev-server/issues/100#issuecomment-290911036)
    module.hot.accept();
  }
}
