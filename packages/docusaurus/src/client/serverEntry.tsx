/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router';
import {HelmetProvider, type FilledContext} from 'react-helmet-async';
import Loadable from 'react-loadable';
import siteConfig from '@generated/docusaurus.config';
import {renderToHtml} from './renderToHtml';
import {appRoutes} from './appRouter';
import {RouterContextProvider} from './routerContext';
import {
  createStatefulBrokenLinks,
  BrokenLinksProvider,
} from './BrokenLinksContext';
import {toPageCollectedMetadataInternal} from './serverHelmetUtils';
import type {AppRenderer, PageCollectedDataInternal} from '../common';

const staticHandler = createStaticHandler(appRoutes);

const render: AppRenderer['render'] = async ({pathname}) => {
  // Runs the route loaders, which preload the page chunks
  const routerContext = await staticHandler.query(
    new Request(new URL(pathname, siteConfig.url)),
  );
  if (routerContext instanceof Response) {
    throw new Error(`Unexpected router response for ${pathname}`);
  }
  const router = createStaticRouter(staticHandler.dataRoutes, routerContext);

  const modules = new Set<string>();
  const helmetContext = {};
  const statefulBrokenLinks = createStatefulBrokenLinks();

  const app = (
    // @ts-expect-error: we are migrating away from react-loadable anyways
    <Loadable.Capture report={(moduleName) => modules.add(moduleName)}>
      <HelmetProvider context={helmetContext}>
        <RouterContextProvider router={router}>
          <BrokenLinksProvider brokenLinks={statefulBrokenLinks}>
            <StaticRouterProvider
              router={router}
              context={routerContext}
              hydrate={false}
            />
          </BrokenLinksProvider>
        </RouterContextProvider>
      </HelmetProvider>
    </Loadable.Capture>
  );

  const html = await renderToHtml(app);

  const {helmet} = helmetContext as FilledContext;

  const metadata = toPageCollectedMetadataInternal({helmet});

  const collectedData: PageCollectedDataInternal = {
    metadata,
    anchors: statefulBrokenLinks.getCollectedAnchors(),
    links: statefulBrokenLinks.getCollectedLinks(),
    modules: Array.from(modules),
  };

  return {html, collectedData};
};

export default render;
