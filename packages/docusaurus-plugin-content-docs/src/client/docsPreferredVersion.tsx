/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  useAllDocsData,
  useDocsData,
  type GlobalPluginData,
  type GlobalVersion,
} from '@docusaurus/plugin-content-docs/client';
import {DEFAULT_PLUGIN_ID} from '@docusaurus/constants';
import {useThemeConfig, type ThemeConfig} from '@docusaurus/theme-common';
import {ReactContextError, createStorageSlot} from '@docusaurus/theme-common';

type DocsVersionPersistence = ThemeConfig['docs']['versionPersistence'];

const storageKey = (pluginId: string) => `docs-preferred-version-${pluginId}`;

const DocsPreferredVersionStorage = {
  save: (
    pluginId: string,
    persistence: DocsVersionPersistence,
    versionName: string,
  ): void => {
    createStorageSlot(storageKey(pluginId), {persistence}).set(versionName);
  },

  read: (
    pluginId: string,
    persistence: DocsVersionPersistence,
  ): string | null =>
    createStorageSlot(storageKey(pluginId), {persistence}).get(),

  clear: (pluginId: string, persistence: DocsVersionPersistence): void => {
    createStorageSlot(storageKey(pluginId), {persistence}).del();
  },
};

type DocsPreferredVersionName = string | null;

/** State for a single docs plugin instance */
type DocsPreferredVersionPluginState = {
  preferredVersionName: DocsPreferredVersionName;
};

/**
 * We need to store the state in storage globally, with one preferred version
 * per docs plugin instance.
 */
type DocsPreferredVersionState = {
  [pluginId: string]: DocsPreferredVersionPluginState;
};

/**
 * Initial state is always null as we can't read local storage from node SSR
 */
const getInitialState = (pluginIds: string[]): DocsPreferredVersionState =>
  Object.fromEntries(pluginIds.map((id) => [id, {preferredVersionName: null}]));

/**
 * Read storage for all docs plugins, assigning each doc plugin a preferred
 * version (if found)
 */
function readStorageState({
  pluginIds,
  versionPersistence,
  allDocsData,
}: {
  pluginIds: string[];
  versionPersistence: DocsVersionPersistence;
  allDocsData: {[pluginId: string]: GlobalPluginData};
}): DocsPreferredVersionState {
  /**
   * The storage value we read might be stale, and belong to a version that does
   * not exist in the site anymore. In such case, we remove the storage value to
   * avoid downstream errors.
   */
  function restorePluginState(
    pluginId: string,
  ): DocsPreferredVersionPluginState {
    const preferredVersionNameUnsafe = DocsPreferredVersionStorage.read(
      pluginId,
      versionPersistence,
    );
    const pluginData = allDocsData[pluginId]!;
    const versionExists = pluginData.versions.some(
      (version) => version.name === preferredVersionNameUnsafe,
    );
    if (versionExists) {
      return {preferredVersionName: preferredVersionNameUnsafe};
    }
    DocsPreferredVersionStorage.clear(pluginId, versionPersistence);
    return {preferredVersionName: null};
  }
  return Object.fromEntries(
    pluginIds.map((id) => [id, restorePluginState(id)]),
  );
}

function useVersionPersistence(): DocsVersionPersistence {
  return useThemeConfig().docs.versionPersistence;
}

type ContextValue = [
  state: DocsPreferredVersionState,
  api: {
    savePreferredVersion: (pluginId: string, versionName: string) => void;
  },
];

const Context = React.createContext<ContextValue | null>(null);

function useContextValue(): ContextValue {
  const allDocsData = useAllDocsData();
  const versionPersistence = useVersionPersistence();
  const pluginIds = useMemo(() => Object.keys(allDocsData), [allDocsData]);

  // Initial state is empty, as we can't read browser storage in node/SSR
  const [state, setState] = useState(() => getInitialState(pluginIds));

  // On mount, we set the state read from browser storage
  useEffect(() => {
    setState(readStorageState({allDocsData, versionPersistence, pluginIds}));
  }, [allDocsData, versionPersistence, pluginIds]);

  // The API that we expose to consumer hooks (memo for constant object)
  const api = useMemo(() => {
    function savePreferredVersion(pluginId: string, versionName: string) {
      DocsPreferredVersionStorage.save(
        pluginId,
        versionPersistence,
        versionName,
      );
      setState((s) => ({
        ...s,
        [pluginId]: {preferredVersionName: versionName},
      }));
    }

    return {
      savePreferredVersion,
    };
  }, [versionPersistence]);

  return [state, api];
}

function DocsPreferredVersionContextProviderUnsafe({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const value = useContextValue();
  return <Context value={value}>{children}</Context>;
}

/**
 * This is a maybe-layer. If the docs plugin is not enabled, this provider is a
 * simple pass-through.
 */
export function DocsPreferredVersionContextProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <DocsPreferredVersionContextProviderUnsafe>
      {children}
    </DocsPreferredVersionContextProviderUnsafe>
  );
}

function useDocsPreferredVersionContext(): ContextValue {
  const value = useContext(Context);
  if (!value) {
    throw new ReactContextError('DocsPreferredVersionContextProvider');
  }
  return value;
}

/**
 * Returns a read-write interface to a plugin's preferred version. The
 * "preferred version" is defined as the last version that the user visited.
 * For example, if a user is using v3, even when v4 is later published, the user
 * would still be browsing v3 docs when she opens the website next time. Note,
 * the `preferredVersion` attribute will always be `null` before mount.
 */
export function useDocsPreferredVersion(
  pluginId: string | undefined = DEFAULT_PLUGIN_ID,
): {
  preferredVersion: GlobalVersion | null;
  savePreferredVersionName: (versionName: string) => void;
} {
  const docsData = useDocsData(pluginId);
  const [state, api] = useDocsPreferredVersionContext();

  const {preferredVersionName} = state[pluginId]!;

  const preferredVersion =
    docsData.versions.find(
      (version) => version.name === preferredVersionName,
    ) ?? null;

  const savePreferredVersionName = useCallback(
    (versionName: string) => {
      api.savePreferredVersion(pluginId, versionName);
    },
    [api, pluginId],
  );

  return {preferredVersion, savePreferredVersionName};
}

export function useDocsPreferredVersionByPluginId(): {
  [pluginId: string]: GlobalVersion | null;
} {
  const allDocsData = useAllDocsData();
  const [state] = useDocsPreferredVersionContext();

  function getPluginIdPreferredVersion(pluginId: string) {
    const docsData = allDocsData[pluginId]!;
    const {preferredVersionName} = state[pluginId]!;

    return (
      docsData.versions.find(
        (version) => version.name === preferredVersionName,
      ) ?? null
    );
  }
  const pluginIds = Object.keys(allDocsData);
  return Object.fromEntries(
    pluginIds.map((id) => [id, getPluginIdPreferredVersion(id)]),
  );
}
