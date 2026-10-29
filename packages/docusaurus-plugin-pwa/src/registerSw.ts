/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {createStorageSlot} from '@docusaurus/theme-common';

// First: read the env variables (provided by Webpack)

const PWA_SERVICE_WORKER_URL = process.env.PWA_SERVICE_WORKER_URL!;
const PWA_OFFLINE_MODE_ACTIVATION_STRATEGIES = process.env
  .PWA_OFFLINE_MODE_ACTIVATION_STRATEGIES as unknown as (keyof typeof OfflineModeActivationStrategiesImplementations)[];
const PWA_DEBUG = process.env.PWA_DEBUG;

const MAX_MOBILE_WIDTH = 996;

const AppInstalledEventFiredStorage = createStorageSlot(
  'docusaurus.pwa.event.appInstalled.fired',
);

declare global {
  interface Navigator {
    getInstalledRelatedApps: () => Promise<{platform: string}[]>;
    connection?: {effectiveType: string; saveData: boolean};
  }
}

function debugLog(msg: string, obj?: unknown) {
  if (PWA_DEBUG) {
    if (typeof obj === 'undefined') {
      console.log(`[Docusaurus-PWA][registerSw]: ${msg}`);
    } else {
      console.log(`[Docusaurus-PWA][registerSw]: ${msg}`, obj);
    }
  }
}

async function clearRegistrations() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  debugLog('will unregister all service workers', {registrations});
  await Promise.all(
    registrations.map((registration) =>
      registration
        .unregister()
        .then((result) =>
          debugLog('unregister service worker', {registration, result}),
        ),
    ),
  );
  debugLog('unregistered all service workers', {registrations});
  window.location.reload();
}

/*
As of 2021:
It is complicated and not very reliable to detect an app is actually installed.
https://stackoverflow.com/questions/51735869/check-if-user-has-already-installed-pwa-to-homescreen-on-chrome

- appinstalled event is not in the spec anymore and seems to not fire? https://firt.dev/pwa-2021#less-capabilities-%E2%98%B9%EF%B8%8F
- getInstalledRelatedApps() is only supported in recent Chrome and does not seem to reliable either https://github.com/WICG/get-installed-related-apps
- display-mode: standalone is not exactly the same concept, but looks like a decent fallback https://petelepage.com/blog/2019/07/is-my-pwa-installed/
 */
function getIsAppInstalledEventFired() {
  return AppInstalledEventFiredStorage.get() === 'true';
}

async function getIsAppInstalledRelatedApps() {
  if (!('getInstalledRelatedApps' in window.navigator)) {
    return false;
  }
  try {
    const relatedApps = await navigator.getInstalledRelatedApps();
    return relatedApps.some((app) => app.platform === 'webapp');
  } catch {
    // Error might be thrown when Docusaurus is embedded in an iframe:
    // registerSW failed DOMException: Failed to execute 'getInstalledRelatedApps' on 'Navigator': getInstalledRelatedApps() is only supported in top-level browsing contexts.
    return false;
  }
}
function isStandaloneDisplayMode() {
  return window.matchMedia('(display-mode: standalone)').matches;
}

const OfflineModeActivationStrategiesImplementations = {
  always: () => true,
  mobile: () => window.innerWidth <= MAX_MOBILE_WIDTH,
  saveData: () => !!navigator.connection?.saveData,
  appInstalled: () =>
    getIsAppInstalledEventFired() || getIsAppInstalledRelatedApps(),
  standalone: () => isStandaloneDisplayMode(),
  queryString: () =>
    new URLSearchParams(window.location.search).get('offlineMode') === 'true',
};

async function getActiveStrategies() {
  const activeStrategies = await Promise.all(
    PWA_OFFLINE_MODE_ACTIVATION_STRATEGIES.map((strategyName) =>
      Promise.resolve(
        OfflineModeActivationStrategiesImplementations[strategyName](),
      ).then((isActive) => (isActive ? strategyName : undefined)),
    ),
  );
  return activeStrategies.filter(Boolean);
}

async function getIsOfflineModeEnabled() {
  const activeStrategies = await getActiveStrategies();
  const enabled = activeStrategies.length > 0;
  debugLog(
    enabled
      ? 'offline mode enabled, because of activation strategies'
      : 'offline mode disabled, because none of the offlineModeActivationStrategies could be used',
    {
      activeStrategies,
      availableStrategies: PWA_OFFLINE_MODE_ACTIVATION_STRATEGIES,
    },
  );
  return enabled;
}

function createServiceWorkerUrl(params: object) {
  const paramsQueryString = JSON.stringify(params);
  const url = `${PWA_SERVICE_WORKER_URL}?params=${encodeURIComponent(
    paramsQueryString,
  )}`;
  debugLog('service worker url', {url, params});
  return url;
}

async function registerSW() {
  const [{Workbox}, offlineMode] = await Promise.all([
    import('workbox-window'),
    getIsOfflineModeEnabled(),
  ]);
  const url = createServiceWorkerUrl({offlineMode, debug: PWA_DEBUG});
  const wb = new Workbox(url);
  const sendSkipWaiting = () => wb.messageSW({type: 'SKIP_WAITING'});
  const handleServiceWorkerWaiting = () => {
    debugLog('handleServiceWorkerWaiting');
    // Immediately load new service worker when files aren't cached
    if (!offlineMode) {
      return sendSkipWaiting();
    }
    return import('./renderReloadPopup.js').then(({renderReloadPopup}) =>
      renderReloadPopup({
        onReload() {
          wb.addEventListener('controlling', () => {
            window.location.reload();
          });
          sendSkipWaiting();
        },
      }),
    );
  };
  // Update the current service worker when the next one has finished
  // installing and transitions to waiting state.
  wb.addEventListener('waiting', (event) => {
    debugLog('event waiting', {event});
    void handleServiceWorkerWaiting();
  });
  // Update current service worker if the next one finishes installing and
  // moves to waiting state in another tab.
  // @ts-expect-error: not present in the API typings anymore
  wb.addEventListener('externalwaiting', (event) => {
    debugLog('event externalwaiting', {event});
    void handleServiceWorkerWaiting();
  });
  const registration = await wb.register();
  if (registration) {
    if (registration.active) {
      debugLog('registration.active', {registration});
    }
    if (registration.installing) {
      debugLog('registration.installing', {registration});
    }
    if (registration.waiting) {
      debugLog('registration.waiting', {registration});
      // Update service worker if the next one is already in the waiting
      // state. This happens when the user doesn't click on `reload` in
      // the popup.
      await handleServiceWorkerWaiting();
    }
  }
}

// TODO these events still works in chrome but have been removed from the spec
// in 2019! See https://github.com/w3c/manifest/pull/836
function addLegacyAppInstalledEventsListeners() {
  debugLog('addLegacyAppInstalledEventsListeners');

  window.addEventListener('appinstalled', (event) => {
    debugLog('event appinstalled', {event});
    AppInstalledEventFiredStorage.set('true');
    debugLog("AppInstalledEventFiredStorage.set('true')");
    // After the app is installed, we register a service worker with the path
    // `/sw?enabled`. Since the previous service worker was `/sw`, it'll be
    // treated as a new one. The previous registration will need to be
    // cleared, otherwise the reload popup will show.
    void clearRegistrations();
  });

  // TODO this event still works in chrome but has been removed from the spec
  // in 2019!!!
  window.addEventListener('beforeinstallprompt', (event) => {
    debugLog('event beforeinstallprompt', {event});
    // TODO instead of default browser install UI, show custom docusaurus
    // prompt?
    // event.preventDefault();
    const appInstalledEventFired = AppInstalledEventFiredStorage.get();
    debugLog('AppInstalledEventFiredStorage.get()', {appInstalledEventFired});
    if (appInstalledEventFired) {
      AppInstalledEventFiredStorage.del();
      debugLog('AppInstalledEventFiredStorage.del()');
      // After uninstalling the app, if the user doesn't clear all data, then
      // the previous service worker will continue serving cached files. We
      // need to clear registrations and reload, otherwise the popup shows.
      void clearRegistrations();
    }
  });

  debugLog(
    'legacy appinstalled and beforeinstallprompt event listeners installed',
  );
}

/*
Init code to run on the client!
 */
if (ExecutionEnvironment.canUseDOM) {
  debugLog('debug mode enabled');

  if ('serviceWorker' in navigator) {
    // First: add the listeners asap/synchronously
    addLegacyAppInstalledEventsListeners();

    // Then try to register the SW using lazy/dynamic imports
    registerSW().catch((e: unknown) => console.error('registerSW failed', e));
  }
}
