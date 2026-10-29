/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useLocation} from '@docusaurus/router';
import {
  useAllPluginInstancesData,
  usePluginData,
} from '@docusaurus/useGlobalData';

import {
  getActivePlugin,
  getLatestVersion,
  getActiveVersion,
  getActiveDocContext,
  getDocVersionSuggestions,
} from './docsClientUtils';
import type {UseDataOptions} from '@docusaurus/types';

export {
  useDocById,
  findSidebarCategory,
  findFirstSidebarItemLink,
  isActiveSidebarItem,
  isVisibleSidebarItem,
  useVisibleSidebarItems,
  useSidebarBreadcrumbs,
  useDocsVersionCandidates,
  useLayoutDoc,
  useLayoutDocsSidebar,
  useDocRootMetadata,
  useCurrentSidebarCategory,
  useCurrentSidebarSiblings,
  filterDocCardListItems,
} from './docsUtils';

export {useDocsPreferredVersion} from './docsPreferredVersion';

export {
  DocSidebarItemsExpandedStateProvider,
  useDocSidebarItemsExpandedState,
} from './docSidebarItemsExpandedState';

export {useDocsVersion} from './docsVersion';

export {DocsSidebarProvider, useDocsSidebar} from './docsSidebar';

export {DocProvider, useDoc, type DocContextValue} from './doc';

export {
  useDocsPreferredVersionByPluginId,
  DocsPreferredVersionContextProvider,
} from './docsPreferredVersion';

export {
  useDocsContextualSearchTags,
  getDocsVersionSearchTag,
} from './docsSearch';

export {useBreadcrumbsStructuredData} from './structuredDataUtils';

export {useDocCardDescriptionCategoryItemsPlural} from './docsTranslations';

export type ActivePlugin = {
  pluginId: string;
  pluginData: GlobalPluginData;
};
export type ActiveDocContext = {
  activeVersion?: GlobalVersion;
  activeDoc?: GlobalDoc;
  alternateDocVersions: {[versionName: string]: GlobalDoc};
};
export type GlobalDoc = {
  /**
   * For generated index pages, this is the `slug`, **not** `permalink`
   * (without base URL). Because slugs have leading slashes but IDs don't,
   * there won't be clashes.
   */
  id: string;
  path: string;
  sidebar?: string;
  unlisted?: boolean;
};

export type GlobalVersion = {
  name: string;
  label: string;
  isLast: boolean;
  path: string;
  /** The doc with `slug: /`, or first doc in first sidebar */
  mainDocId: string;
  docs: GlobalDoc[];
  /** Unversioned IDs. In development, this list is empty. */
  draftIds: string[];
  sidebars?: {[sidebarId: string]: GlobalSidebar};
};

export type GlobalSidebar = {
  link?: {
    label: string;
    path: string;
  };
  // ... we may add other things here later
};
export type GlobalPluginData = {
  path: string;
  versions: GlobalVersion[];
  breadcrumbs: boolean;
};
export type DocVersionSuggestions = {
  /** Suggest the latest version */
  latestVersionSuggestion: GlobalVersion;
  /** Suggest the same doc, in latest version (if one exists) */
  latestDocSuggestion?: GlobalDoc;
};

// Important to use a constant object to avoid React useEffect executions etc.
// see https://github.com/facebook/docusaurus/issues/5089
const StableEmptyObject = {};

// In blog-only mode, docs hooks are still used by the theme. We need a fail-
// safe fallback when the docs plugin is not in use
export const useAllDocsData = (): {[pluginId: string]: GlobalPluginData} =>
  (useAllPluginInstancesData('docusaurus-plugin-content-docs') as
    | {
        [pluginId: string]: GlobalPluginData;
      }
    | undefined) ?? StableEmptyObject;

export const useDocsData = (pluginId: string | undefined): GlobalPluginData => {
  try {
    return usePluginData('docusaurus-plugin-content-docs', pluginId, {
      failfast: true,
    }) as GlobalPluginData;
  } catch (error) {
    throw new Error(
      `You are using a feature of the Docusaurus docs plugin, but this plugin does not seem to be enabled${
        pluginId === 'Default' ? '' : ` (pluginId=${pluginId}`
      }`,
      {cause: error},
    );
  }
};

// TODO this feature should be provided by docusaurus core
export function useActivePlugin(
  options: UseDataOptions = {},
): ActivePlugin | undefined {
  const data = useAllDocsData();
  const {pathname} = useLocation();
  return getActivePlugin(data, pathname, options);
}

export function useActivePluginAndVersion(
  options: UseDataOptions = {},
):
  | {activePlugin: ActivePlugin; activeVersion: GlobalVersion | undefined}
  | undefined {
  const activePlugin = useActivePlugin(options);
  const {pathname} = useLocation();
  if (!activePlugin) {
    return undefined;
  }
  const activeVersion = getActiveVersion(activePlugin.pluginData, pathname);
  return {
    activePlugin,
    activeVersion,
  };
}

/** Versions are returned ordered (most recent first). */
export function useVersions(pluginId: string | undefined): GlobalVersion[] {
  const data = useDocsData(pluginId);
  return data.versions;
}

export function useLatestVersion(pluginId: string | undefined): GlobalVersion {
  const data = useDocsData(pluginId);
  return getLatestVersion(data);
}

/**
 * Returns `undefined` on doc-unrelated pages, because there's no version
 * currently considered as active.
 */
export function useActiveVersion(
  pluginId: string | undefined,
): GlobalVersion | undefined {
  const data = useDocsData(pluginId);
  const {pathname} = useLocation();
  return getActiveVersion(data, pathname);
}

export function useActiveDocContext(
  pluginId: string | undefined,
): ActiveDocContext {
  const data = useDocsData(pluginId);
  const {pathname} = useLocation();
  return getActiveDocContext(data, pathname);
}
/**
 * Useful to say "hey, you are not on the latest docs version, please switch"
 */
export function useDocVersionSuggestions(
  pluginId: string | undefined,
): DocVersionSuggestions {
  const data = useDocsData(pluginId);
  const {pathname} = useLocation();
  return getDocVersionSuggestions(data, pathname);
}
