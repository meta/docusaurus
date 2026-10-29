/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useAllDocsData,
  useActivePluginAndVersion,
} from '@docusaurus/plugin-content-docs/client';
import {useDocsPreferredVersionByPluginId} from './docsPreferredVersion';

/** The search tag to append as each doc's metadata. */
export function getDocsVersionSearchTag(
  pluginId: string,
  versionName: string,
): string {
  return `docs-${pluginId}-${versionName}`;
}

/**
 * Gets the relevant docs tags to search.
 * This is the logic that powers the contextual search feature.
 *
 * If user is browsing Android 1.4 docs, he'll get presented with:
 * - Android '1.4' docs
 * - iOS 'preferred | latest' docs
 *
 * The result is generic and not coupled to Algolia/DocSearch on purpose.
 */
export function useDocsContextualSearchTags(): string[] {
  const allDocsData = useAllDocsData();
  const activePluginAndVersion = useActivePluginAndVersion();
  const docsPreferredVersionByPluginId = useDocsPreferredVersionByPluginId();

  // This can't use more specialized hooks because we are mapping over all
  // plugin instances.
  function getDocPluginTags(pluginId: string) {
    const activeVersion =
      activePluginAndVersion?.activePlugin.pluginId === pluginId
        ? activePluginAndVersion.activeVersion
        : undefined;

    const preferredVersion = docsPreferredVersionByPluginId[pluginId];

    const latestVersion = allDocsData[pluginId]!.versions.find(
      (v) => v.isLast,
    )!;

    const version = activeVersion ?? preferredVersion ?? latestVersion;

    return getDocsVersionSearchTag(pluginId, version.name);
  }

  return [...Object.keys(allDocsData).map(getDocPluginTags)];
}
