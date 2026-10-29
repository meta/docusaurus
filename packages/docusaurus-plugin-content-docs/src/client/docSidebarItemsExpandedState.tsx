/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode, useMemo, useState, useContext} from 'react';
import {ReactContextError} from '@docusaurus/theme-common';

type ContextValue = {
  /**
   * The item that the user last opened, `null` when there's none open. On
   * initial render, it will always be `null`, which doesn't necessarily mean
   * there's no category open (can have 0, 1, or many being initially open).
   */
  expandedItem: number | null;
  /**
   * Set the currently expanded item, when the user opens one. Set the value to
   * `null` when the user closes an open category.
   */
  setExpandedItem: (a: number | null) => void;
};

const EmptyContext: unique symbol = Symbol('EmptyContext');
const Context = React.createContext<ContextValue | typeof EmptyContext>(
  EmptyContext,
);

/**
 * Should be used to wrap one sidebar category level. This provider syncs the
 * expanded states of all sibling categories, and categories can choose to
 * collapse itself if another one is expanded.
 */
export function DocSidebarItemsExpandedStateProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const contextValue = useMemo(
    () => ({expandedItem, setExpandedItem}),
    [expandedItem],
  );

  return <Context value={contextValue}>{children}</Context>;
}

export function useDocSidebarItemsExpandedState(): ContextValue {
  const value = useContext(Context);
  if (value === EmptyContext) {
    throw new ReactContextError('DocSidebarItemsExpandedStateProvider');
  }
  return value;
}
