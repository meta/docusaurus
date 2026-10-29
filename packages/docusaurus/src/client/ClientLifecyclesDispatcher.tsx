/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useLayoutEffect, type ReactElement, type ReactNode} from 'react';
import clientModules from '@generated/client-modules';
import type {ClientModule} from '@docusaurus/types';
import type {Location} from 'history';

export function dispatchLifecycleAction<K extends keyof ClientModule>(
  lifecycleAction: K,
  ...args: Parameters<NonNullable<ClientModule[K]>>
): () => void {
  const callbacks = clientModules.map((clientModule) => {
    const lifecycleFunction = (clientModule.default?.[lifecycleAction] ??
      clientModule[lifecycleAction]) as
      | ((
          ...a: Parameters<NonNullable<ClientModule[K]>>
        ) => (() => void) | void)
      | undefined;

    return lifecycleFunction?.(...args);
  });
  return () => callbacks.forEach((cb) => cb?.());
}

function scrollAfterNavigation({
  location,
  previousLocation,
}: {
  location: Location;
  previousLocation: Location | null;
}) {
  if (!previousLocation) {
    return; // no-op: use native browser feature
  }

  const samePathname = location.pathname === previousLocation.pathname;
  const sameHash = location.hash === previousLocation.hash;
  const sameSearch = location.search === previousLocation.search;

  // Query-string changes: do not scroll to top/hash
  if (samePathname && sameHash && !sameSearch) {
    return;
  }

  const {hash} = location;
  if (!hash) {
    window.scrollTo(0, 0);
  } else {
    const id = decodeURIComponent(hash.substring(1));
    const element = document.getElementById(id);
    element?.scrollIntoView();
  }
}

function ClientLifecyclesDispatcher({
  children,
  location,
  previousLocation,
}: {
  children: ReactElement;
  location: Location;
  previousLocation: Location | null;
}): ReactNode {
  useLayoutEffect(() => {
    if (previousLocation !== location) {
      scrollAfterNavigation({location, previousLocation});
      dispatchLifecycleAction('onRouteDidUpdate', {previousLocation, location});
    }
  }, [previousLocation, location]);
  return children;
}

export default ClientLifecyclesDispatcher;
