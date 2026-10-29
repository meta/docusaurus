/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useSyncExternalStore} from 'react';

// The "browser" state never changes, there's nothing to subscribe to
const subscribe = () => () => {};

// On first client-side render, we need to render exactly as the server rendered
// See https://www.joshwcomeau.com/react/the-perils-of-rehydration/
// React uses getServerSnapshot during SSR and hydration, and re-renders with
// getSnapshot right after hydration. Components mounted after hydration
// directly get the client value, without an extra re-render.
export default function useIsBrowser(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
