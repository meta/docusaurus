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
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import {ReactContextError, usePrevious} from '../../utils/reactUtils';
import {useNavbarMobileSidebar} from '../navbarMobileSidebar';
import {useNavbarSecondaryMenuContent, type Content} from './content';

type ContextValue = [
  shown: boolean,
  setShown: React.Dispatch<React.SetStateAction<boolean>>,
];

const Context = React.createContext<ContextValue | null>(null);

function useContextValue(): ContextValue {
  const mobileSidebar = useNavbarMobileSidebar();
  const content = useNavbarSecondaryMenuContent();

  const [shown, setShown] = useState(false);

  const hasContent = content.component !== null;
  const previousHasContent = usePrevious(hasContent);

  // When content is become available for the first time (set in useEffect)
  // we set this content to be shown!
  useEffect(() => {
    const contentBecameAvailable = hasContent && !previousHasContent;
    if (contentBecameAvailable) {
      setShown(true);
    }
  }, [hasContent, previousHasContent]);

  // On sidebar close, secondary menu is set to be shown on next re-opening
  // (if any secondary menu content available)
  useEffect(() => {
    if (!hasContent) {
      setShown(false);
      return;
    }
    if (!mobileSidebar.shown) {
      setShown(true);
    }
  }, [mobileSidebar.shown, hasContent]);

  return useMemo(() => [shown, setShown], [shown]);
}

/** @internal */
export function NavbarSecondaryMenuDisplayProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const value = useContextValue();
  return <Context value={value}>{children}</Context>;
}

function renderElement(content: Content): ReactNode {
  if (content.component) {
    const Comp = content.component;
    return <Comp {...content.props} />;
  }
  return undefined;
}

/** Wires the logic for rendering the mobile navbar secondary menu. */
export function useNavbarSecondaryMenu(): {
  /** Whether secondary menu is displayed. */
  shown: boolean;
  /**
   * Hide the secondary menu; fired either when hiding the entire sidebar, or
   * when going back to the primary menu.
   */
  hide: () => void;
  /** The content returned from the current secondary menu filler. */
  content: ReactNode;
} {
  const value = useContext(Context);
  if (!value) {
    throw new ReactContextError('NavbarSecondaryMenuDisplayProvider');
  }
  const [shown, setShown] = value;
  const hide = useCallback(() => setShown(false), [setShown]);
  const content = useNavbarSecondaryMenuContent();

  return useMemo(
    () => ({shown, hide, content: renderElement(content)}),
    [hide, content, shown],
  );
}
