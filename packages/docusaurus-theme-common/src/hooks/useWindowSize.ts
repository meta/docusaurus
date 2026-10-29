/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useSyncExternalStore} from 'react';

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const windowSizes = {
  desktop: 'desktop',
  mobile: 'mobile',
  ssr: 'ssr',
} as const;

type WindowSize = keyof typeof windowSizes;

// Note: this value is also hardcoded in Infima
// Both JS and CSS must have the same value
// Updating this JS value alone is not enough
// See https://github.com/facebook/docusaurus/issues/9603
const DesktopBreakpoint = 996;

function getWindowSize(desktopBreakpoint: number): WindowSize {
  if (!ExecutionEnvironment.canUseDOM) {
    throw new Error(
      'getWindowSize() should only be called after React hydration',
    );
  }

  return window.innerWidth > desktopBreakpoint
    ? windowSizes.desktop
    : windowSizes.mobile;
}

function subscribeToWindowResize(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('resize', onChange);
  };
}

/**
 * Gets the current window size as an enum value. We don't want it to return the
 * actual width value, so that it only re-renders once a breakpoint is crossed.
 *
 * It may return `"ssr"`, which is very important to handle hydration FOUC or
 * layout shifts. You have to handle it explicitly upfront. On the server, you
 * may need to render BOTH the mobile/desktop elements (and hide one of them
 * with mediaquery). We don't return `undefined` on purpose, to make it more
 * explicit.
 */
export function useWindowSize({
  desktopBreakpoint = DesktopBreakpoint,
}: {
  desktopBreakpoint?: number;
} = {}): WindowSize {
  return useSyncExternalStore(
    subscribeToWindowResize,
    () => getWindowSize(desktopBreakpoint),
    // super important to return a constant value to avoid hydration mismatch
    // see https://github.com/facebook/docusaurus/issues/9379
    () => windowSizes.ssr,
  );
}
