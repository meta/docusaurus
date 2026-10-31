/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createContext, useContext, type ReactNode} from 'react';
import type {DataRouter} from 'react-router';

const Context = createContext<DataRouter | null>(null);

export function RouterContextProvider({
  router,
  children,
}: {
  router: DataRouter;
  children: ReactNode;
}): ReactNode {
  return <Context value={router}>{children}</Context>;
}

/**
 * Returns the router instance. Unlike `useLocation()`, it doesn't re-render
 * on navigations: subscribe to the slices you need with `router.subscribe()`.
 */
export function useRouter(): DataRouter {
  const router = useContext(Context);
  if (!router) {
    throw new Error('useRouter() must be used inside the Docusaurus app');
  }
  return router;
}
