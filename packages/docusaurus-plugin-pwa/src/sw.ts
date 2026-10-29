/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {PrecacheController, type PrecacheEntry} from 'workbox-precaching';

function parseSwParams() {
  const params = JSON.parse(
    new URLSearchParams(self.location.search).get('params')!,
  );
  if (params.debug) {
    console.log('[Docusaurus-PWA][SW]: Service Worker params:', params);
  }
  return params;
}

// Doc advises against dynamic imports in SW
// https://developers.google.com/web/tools/workbox/guides/using-bundlers#code_splitting_and_dynamic_imports
// https://x.com/sebastienlorber/status/1280155204575518720
// but looks it's working fine as it's inlined by webpack, need to double check
async function runSWCustomCode(params: {offlineMode: boolean; debug: boolean}) {
  if (process.env.PWA_SW_CUSTOM) {
    const customSW = await import(process.env.PWA_SW_CUSTOM);
    if (typeof customSW.default === 'function') {
      customSW.default(params);
    } else if (params.debug) {
      console.warn(
        '[Docusaurus-PWA][SW]: swCustom should have a default export function',
      );
    }
  }
}

/**
 * Gets different possible variations for a request URL. Similar to
 * https://git.io/JvixK
 */
function getPossibleURLs(url: string) {
  const urlObject = new URL(url, self.location.href);

  if (urlObject.origin !== self.location.origin) {
    return [];
  }

  // Ignore search params and hash
  urlObject.search = '';
  urlObject.hash = '';

  return [
    // /blog.html
    urlObject.href,
    // /blog/ => /blog/index.html
    // /blog => /blog/index.html
    `${urlObject.href}${urlObject.pathname.endsWith('/') ? '' : '/'}index.html`,
  ];
}

(async () => {
  const params = parseSwParams();

  const precacheManifest = (
    self as typeof globalThis & {__WB_MANIFEST: (string | PrecacheEntry)[]}
  ).__WB_MANIFEST;
  const controller = new PrecacheController({
    // Safer to turn this true?
    fallbackToNetwork: true,
  });

  if (params.offlineMode) {
    controller.addToCacheList(precacheManifest);
    if (params.debug) {
      console.log('[Docusaurus-PWA][SW]: addToCacheList', {precacheManifest});
    }
  }

  await runSWCustomCode(params);

  self.addEventListener('install', (event) => {
    if (params.debug) {
      console.log('[Docusaurus-PWA][SW]: install event', {event});
    }
    (event as ExtendableEvent).waitUntil(
      controller.install(event as ExtendableEvent),
    );
  });

  self.addEventListener('activate', (event) => {
    if (params.debug) {
      console.log('[Docusaurus-PWA][SW]: activate event', {event});
    }
    (event as ExtendableEvent).waitUntil(
      controller.activate(event as ExtendableEvent),
    );
  });

  self.addEventListener('fetch', async (event) => {
    if (params.offlineMode) {
      const requestURL = (event as FetchEvent).request.url;
      const possibleURLs = getPossibleURLs(requestURL);
      for (const possibleURL of possibleURLs) {
        const cacheKey = controller.getCacheKeyForURL(possibleURL);
        if (cacheKey) {
          const cachedResponse = caches.match(cacheKey) as Promise<Response>;
          if (params.debug) {
            console.log('[Docusaurus-PWA][SW]: serving cached asset', {
              requestURL,
              possibleURL,
              possibleURLs,
              cacheKey,
              cachedResponse,
            });
          }
          (event as FetchEvent).respondWith(cachedResponse);
          break;
        }
      }
    }
  });

  self.addEventListener('message', async (event) => {
    if (params.debug) {
      console.log('[Docusaurus-PWA][SW]: message event', {event});
    }

    const type = (event as MessageEvent).data?.type;

    if (type === 'SKIP_WAITING') {
      // lib def bug, see https://github.com/microsoft/TypeScript/issues/14877
      (self as typeof globalThis & ServiceWorkerGlobalScope).skipWaiting();
    }
  });
})();
