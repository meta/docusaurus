/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {matchPath} from '@docusaurus/router';

import type {
  GlobalPluginData,
  GlobalVersion,
  GlobalDoc,
  ActivePlugin,
  ActiveDocContext,
  DocVersionSuggestions,
} from '@docusaurus/plugin-content-docs/client';
import type {UseDataOptions} from '@docusaurus/types';

// This code is not part of the api surface, not in ./theme on purpose

// get the data of the plugin that is currently "active"
// ie the docs of that plugin are currently browsed
// it is useful to support multiple docs plugin instances
export function getActivePlugin(
  allPluginData: {[pluginId: string]: GlobalPluginData},
  pathname: string,
  options: UseDataOptions = {},
): ActivePlugin | undefined {
  const activeEntry = Object.entries(allPluginData)
    // Route sorting: '/android/foo' should match '/android' instead of '/'
    .sort((a, b) => b[1].path.localeCompare(a[1].path))
    .find(
      ([, pluginData]) =>
        !!matchPath(pathname, {
          path: pluginData.path,
          exact: false,
          strict: false,
        }),
    );

  const activePlugin: ActivePlugin | undefined = activeEntry
    ? {pluginId: activeEntry[0], pluginData: activeEntry[1]}
    : undefined;

  if (!activePlugin && options.failfast) {
    throw new Error(
      `Can't find active docs plugin for "${pathname}" pathname, while it was expected to be found. Maybe you tried to use a docs feature that can only be used on a docs-related page? Existing docs plugin paths are: ${Object.values(
        allPluginData,
      )
        .map((plugin) => plugin.path)
        .join(', ')}`,
    );
  }

  return activePlugin;
}

export const getLatestVersion = (data: GlobalPluginData): GlobalVersion =>
  data.versions.find((version) => version.isLast)!;

export function getActiveVersion(
  data: GlobalPluginData,
  pathname: string,
): GlobalVersion | undefined {
  // Sort paths so that a match-all version like /docs/* is matched last
  // Otherwise /docs/* would match /docs/1.0.0/* routes
  // This is simplified but similar to the core sortRoutes() logic
  const sortedVersions = [...data.versions].sort((a, b) => {
    if (a.path === b.path) {
      return 0;
    }
    if (a.path.includes(b.path)) {
      return -1;
    }
    if (b.path.includes(a.path)) {
      return 1;
    }
    return 0;
  });

  return sortedVersions.find(
    (version) =>
      !!matchPath(pathname, {
        path: version.path,
        exact: false,
        strict: false,
      }),
  );
}

export function getActiveDocContext(
  data: GlobalPluginData,
  pathname: string,
): ActiveDocContext {
  const activeVersion = getActiveVersion(data, pathname);
  const activeDoc = activeVersion?.docs.find(
    (doc) =>
      !!matchPath(pathname, {
        path: doc.path,
        exact: true,
        strict: false,
      }),
  );

  function getAlternateVersionDocs(
    docId: string,
  ): ActiveDocContext['alternateDocVersions'] {
    const result: ActiveDocContext['alternateDocVersions'] = {};
    data.versions.forEach((version) => {
      version.docs.forEach((doc) => {
        if (doc.id === docId) {
          result[version.name] = doc;
        }
      });
    });
    return result;
  }

  const alternateVersionDocs = activeDoc
    ? getAlternateVersionDocs(activeDoc.id)
    : {};

  return {
    activeVersion,
    activeDoc,
    alternateDocVersions: alternateVersionDocs,
  };
}

export function getDocVersionSuggestions(
  data: GlobalPluginData,
  pathname: string,
): DocVersionSuggestions {
  const latestVersion = getLatestVersion(data);
  const activeDocContext = getActiveDocContext(data, pathname);
  const latestDocSuggestion: GlobalDoc | undefined =
    activeDocContext.alternateDocVersions[latestVersion.name];
  return {latestDocSuggestion, latestVersionSuggestion: latestVersion};
}
