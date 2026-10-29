/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {matchRoutes} from 'react-router-config';
import routesChunkNames from '@generated/routesChunkNames';
import routes from '@generated/routes';
import prefetchHelper from './prefetch';
import preloadHelper from './preload';
import flat from './flat';

const fetched = new Set<string>();
const loaded = new Set<string>();

declare global {
  // See https://github.com/microsoft/TypeScript/issues/56962
  interface Navigator {
    connection?: {effectiveType: string; saveData: boolean};
  }
}

// If user is on slow or constrained connection.
const isSlowConnection = () =>
  navigator.connection?.effectiveType.includes('2g') ||
  navigator.connection?.saveData;

const canPrefetch = (routePath: string) =>
  !isSlowConnection() && !loaded.has(routePath) && !fetched.has(routePath);

const canPreload = (routePath: string) =>
  !isSlowConnection() && !loaded.has(routePath);

const getChunkNamesToLoad = (path: string): string[] =>
  Object.entries(routesChunkNames)
    .filter(
      // Remove the last part containing the route hash
      // input: /blog/2018/12/14/Happy-First-Birthday-Slash-fe9
      // output: /blog/2018/12/14/Happy-First-Birthday-Slash
      ([routeNameWithHash]) =>
        routeNameWithHash.replace(/-[^-]+$/, '') === path,
    )
    .flatMap(([, routeChunks]) => Object.values(flat(routeChunks)));

type Docusaurus = Window['docusaurus'];

const prefetch: Docusaurus['prefetch'] = (
  routePath: string,
): false | Promise<void[]> => {
  if (!canPrefetch(routePath)) {
    return false;
  }
  fetched.add(routePath);

  // Find all webpack chunk names needed.
  const matches = matchRoutes(routes, routePath);

  const chunkNamesNeeded = matches.flatMap((match) =>
    getChunkNamesToLoad(match.route.path),
  );

  // Prefetch all webpack chunk assets file needed.
  return Promise.all(
    chunkNamesNeeded.map((chunkName) => {
      // "__webpack_require__.gca" is injected by ChunkAssetPlugin. Pass it
      // the name of the chunk you want to load and it will return its URL.
      // eslint-disable-next-line camelcase
      const chunkAsset = __webpack_require__.gca(chunkName);

      // In some cases, webpack might decide to optimize further, leading to
      // the chunk assets being merged to another chunk. In this case, we can
      // safely filter it out and don't need to load it.
      if (chunkAsset && !chunkAsset.includes('undefined')) {
        return prefetchHelper(chunkAsset);
      }
      return Promise.resolve();
    }),
  );
};

const preload: Docusaurus['preload'] = (
  routePath: string,
): false | Promise<void[]> => {
  if (!canPreload(routePath)) {
    return false;
  }
  loaded.add(routePath);
  return preloadHelper(routePath);
};

const docusaurus: Window['docusaurus'] = {
  prefetch,
  preload,
};

// This object is directly mounted onto window, better freeze it
export default Object.freeze(docusaurus);
