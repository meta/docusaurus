/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  type ReactNode,
} from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {createStorageSlot} from '../utils/storageUtils';
import {ReactContextError} from '../utils/reactUtils';
import {useThemeConfig} from '../utils/useThemeConfig';

// Keep these keys in sync with the inlined script
// See packages/docusaurus-theme-classic/src/inlineScripts.ts
const AnnouncementBarDismissStorage = createStorageSlot(
  'docusaurus.announcement.dismiss',
);
const IdStorage = createStorageSlot('docusaurus.announcement.id');

const isDismissedInStorage = () =>
  AnnouncementBarDismissStorage.get() === 'true';
const setDismissedInStorage = (bool: boolean) =>
  AnnouncementBarDismissStorage.set(String(bool));

type ContextValue = {
  /** Whether the announcement bar should be displayed. */
  readonly isActive: boolean;
  /**
   * Callback fired when the user closes the announcement. Will be saved.
   */
  readonly close: () => void;
};

const Context = React.createContext<ContextValue | null>(null);

function useContextValue(): ContextValue {
  const {announcementBar} = useThemeConfig();
  const isBrowser = useIsBrowser();

  const [isClosed, setClosed] = useState(() =>
    isBrowser
      ? // On client navigation: init with local storage value
        isDismissedInStorage()
      : // On server/hydration: always visible to prevent layout shifts (will be hidden with css if needed)
        false,
  );
  // Update state after hydration
  useEffect(() => {
    setClosed(isDismissedInStorage());
  }, []);

  const handleClose = useCallback(() => {
    setDismissedInStorage(true);
    setClosed(true);
  }, []);

  useEffect(() => {
    if (!announcementBar) {
      return;
    }
    const {id} = announcementBar;

    const viewedId = IdStorage.get();
    const isNewAnnouncement = id !== viewedId;

    IdStorage.set(id);

    if (isNewAnnouncement) {
      setDismissedInStorage(false);
    }

    if (isNewAnnouncement || !isDismissedInStorage()) {
      setClosed(false);
    }
  }, [announcementBar]);

  return useMemo(
    () => ({
      isActive: !!announcementBar && !isClosed,
      close: handleClose,
    }),
    [announcementBar, isClosed, handleClose],
  );
}

export function AnnouncementBarProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const value = useContextValue();
  return <Context value={value}>{children}</Context>;
}

export function useAnnouncementBar(): ContextValue {
  const api = useContext(Context);
  if (!api) {
    throw new ReactContextError('AnnouncementBarProvider');
  }
  return api;
}
