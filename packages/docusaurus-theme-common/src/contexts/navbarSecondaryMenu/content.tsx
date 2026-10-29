/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useState,
  useContext,
  useEffect,
  type ReactNode,
  type ComponentType,
} from 'react';
import {ReactContextError, useShallowMemoObject} from '../../utils/reactUtils';

// This context represents a "global layout store". A component (usually a
// layout component) can request filling this store through
// `NavbarSecondaryMenuFiller`. It doesn't actually control rendering by itself,
// and this context should be considered internal implementation. The user-
// facing value comes from `display.tsx`, which takes the `component` and
// `props` stored here and renders the actual element.

export type NavbarSecondaryMenuComponent<Props> = ComponentType<Props>;

/** @internal */
export type Content =
  | {
      component: NavbarSecondaryMenuComponent<object>;
      props: object;
    }
  | {component: null; props: null};

type ContextValue = [
  content: Content,
  setContent: React.Dispatch<React.SetStateAction<Content>>,
];

const Context = React.createContext<ContextValue | null>(null);

/** @internal */
export function NavbarSecondaryMenuContentProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const value = useState({component: null, props: null});
  return (
    // @ts-expect-error: this context is hard to type
    <Context value={value}>{children}</Context>
  );
}

/** @internal */
export function useNavbarSecondaryMenuContent(): Content {
  const value = useContext(Context);
  if (!value) {
    throw new ReactContextError('NavbarSecondaryMenuContentProvider');
  }
  return value[0];
}

/**
 * This component renders nothing by itself, but it fills the placeholder in the
 * generic secondary menu layout. This reduces coupling between the main layout
 * and the specific page.
 *
 * This kind of feature is often called portal/teleport/gateway/outlet...
 * Various unmaintained React libs exist. Most up-to-date one:
 * https://github.com/gregberge/react-teleporter
 * Not sure any of those is safe regarding concurrent mode.
 */
export function NavbarSecondaryMenuFiller<P extends object>({
  component,
  props,
}: {
  component: NavbarSecondaryMenuComponent<P>;
  props: P;
}): ReactNode {
  const context = useContext(Context);
  if (!context) {
    throw new ReactContextError('NavbarSecondaryMenuContentProvider');
  }
  const [, setContent] = context;

  // To avoid useless context re-renders, props are memoized shallowly
  const memoizedProps = useShallowMemoObject(props);

  useEffect(() => {
    // @ts-expect-error: this context is hard to type
    setContent({component, props: memoizedProps});
  }, [setContent, component, memoizedProps]);

  useEffect(
    () => () => setContent({component: null, props: null}),
    [setContent],
  );

  return null;
}
