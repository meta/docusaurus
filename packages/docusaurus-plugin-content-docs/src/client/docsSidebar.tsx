/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useMemo, useContext, type ReactNode} from 'react';
import {ReactContextError} from '@docusaurus/theme-common';
import type {PropSidebar} from '@docusaurus/plugin-content-docs';

// Using a Symbol because null is a valid context value (a doc with no sidebar)
// Inspired by https://github.com/jamiebuilds/unstated-next/blob/master/src/unstated-next.tsx
const EmptyContext: unique symbol = Symbol('EmptyContext');

type ContextValue = {name: string; items: PropSidebar};

const Context = React.createContext<ContextValue | null | typeof EmptyContext>(
  EmptyContext,
);

/**
 * Provide the current sidebar to your children.
 */
export function DocsSidebarProvider({
  children,
  name,
  items,
}: {
  children: ReactNode;
  name: string | undefined;
  items: PropSidebar | undefined;
}): ReactNode {
  const stableValue: ContextValue | null = useMemo(
    () => (name && items ? {name, items} : null),
    [name, items],
  );
  return <Context value={stableValue}>{children}</Context>;
}

/**
 * Gets the sidebar that's currently displayed, or `null` if there isn't one
 */
export function useDocsSidebar(): ContextValue | null {
  const value = useContext(Context);
  if (value === EmptyContext) {
    throw new ReactContextError('DocsSidebarProvider');
  }
  return value;
}
