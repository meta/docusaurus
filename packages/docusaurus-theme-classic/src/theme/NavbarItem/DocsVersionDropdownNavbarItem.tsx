/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {
  useVersions,
  useActiveDocContext,
  useDocsVersionCandidates,
  useDocsPreferredVersion,
} from '@docusaurus/plugin-content-docs/client';
import {translate} from '@docusaurus/Translate';
import {useHistorySelector} from '@docusaurus/theme-common';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import type {
  Props,
  PropVersions,
  PropVersionItem,
} from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
import type {LinkLikeNavbarItemProps} from '@theme/NavbarItem';
import type {
  GlobalVersion,
  GlobalDoc,
  ActiveDocContext,
} from '@docusaurus/plugin-content-docs/client';

type VersionItem = {
  version: GlobalVersion;
  label: string;
};

function getVersionItems(
  versions: GlobalVersion[],
  configs?: PropVersions,
): VersionItem[] {
  if (configs) {
    // Collect all the versions we have
    const versionMap = new Map<string, GlobalVersion>(
      versions.map((version) => [version.name, version]),
    );

    const toVersionItem = (
      name: string,
      config?: PropVersionItem,
    ): VersionItem => {
      const version = versionMap.get(name);
      if (!version) {
        throw new Error(`No docs version exist for name '${name}', please verify your 'docsVersionDropdown' navbar item versions config.
Available version names:\n- ${versions.map((v) => `${v.name}`).join('\n- ')}`);
      }
      return {version, label: config?.label ?? version.label};
    };

    if (Array.isArray(configs)) {
      return configs.map((name) => toVersionItem(name, undefined));
    } else {
      return Object.entries(configs).map(([name, config]) =>
        toVersionItem(name, config),
      );
    }
  } else {
    return versions.map((version) => ({version, label: version.label}));
  }
}

function useVersionItems({
  docsPluginId,
  configs,
}: {
  docsPluginId: Props['docsPluginId'];
  configs: Props['versions'];
}): VersionItem[] {
  const versions = useVersions(docsPluginId);
  return getVersionItems(versions, configs);
}

function getVersionMainDoc(version: GlobalVersion): GlobalDoc {
  return version.docs.find((doc) => doc.id === version.mainDocId)!;
}

function getVersionTargetDoc(
  version: GlobalVersion,
  activeDocContext: ActiveDocContext,
): GlobalDoc {
  // We try to link to the same doc, in another version
  // When not possible, fallback to the "main doc" of the version
  return (
    activeDocContext.alternateDocVersions[version.name] ??
    getVersionMainDoc(version)
  );
}

// The version item to use for the "dropdown button"
function useDisplayedVersionItem({
  docsPluginId,
  versionItems,
}: {
  docsPluginId: Props['docsPluginId'];
  versionItems: VersionItem[];
}): VersionItem {
  // The order of the candidates matters!
  const candidates = useDocsVersionCandidates(docsPluginId);
  const candidateItems = candidates
    .map((candidate) => versionItems.find((vi) => vi.version === candidate))
    .filter((vi) => vi !== undefined);
  return candidateItems[0] ?? versionItems[0]!;
}

export default function DocsVersionDropdownNavbarItem({
  mobile,
  docsPluginId,
  dropdownActiveClassDisabled,
  dropdownItemsBefore,
  dropdownItemsAfter,
  versions: configs,
  ...props
}: Props): ReactNode {
  const search = useHistorySelector((history) => history.location.search);
  const hash = useHistorySelector((history) => history.location.hash);
  const activeDocContext = useActiveDocContext(docsPluginId);
  const {savePreferredVersionName} = useDocsPreferredVersion(docsPluginId);
  const versionItems = useVersionItems({docsPluginId, configs});
  const displayedVersionItem = useDisplayedVersionItem({
    docsPluginId,
    versionItems,
  });

  function versionItemToLink({
    version,
    label,
  }: VersionItem): LinkLikeNavbarItemProps {
    const targetDoc = getVersionTargetDoc(version, activeDocContext);
    return {
      label,
      // preserve ?search#hash suffix on version switches
      to: `${targetDoc.path}${search}${hash}`,
      isActive: () => version === activeDocContext.activeVersion,
      onClick: () => savePreferredVersionName(version.name),
    };
  }

  const items: LinkLikeNavbarItemProps[] = [
    ...dropdownItemsBefore,
    ...versionItems.map(versionItemToLink),
    ...dropdownItemsAfter,
  ];

  // Mobile dropdown is handled a bit differently
  const dropdownLabel =
    mobile && items.length > 1
      ? translate({
          id: 'theme.navbar.mobileVersionsDropdown.label',
          message: 'Versions',
          description:
            'The label for the navbar versions dropdown on mobile view',
        })
      : displayedVersionItem.label;

  const dropdownTo =
    mobile && items.length > 1
      ? undefined
      : getVersionTargetDoc(displayedVersionItem.version, activeDocContext)
          .path;

  // We don't want to render a version dropdown with 0 or 1 item. If we build
  // the site with a single docs version (onlyIncludeVersions: ['1.0.0']),
  // We'd rather render a button instead of a dropdown
  if (items.length <= 1) {
    return (
      <DefaultNavbarItem
        {...props}
        mobile={mobile}
        label={dropdownLabel}
        to={dropdownTo}
        isActive={dropdownActiveClassDisabled ? () => false : undefined}
      />
    );
  }

  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      label={dropdownLabel}
      to={dropdownTo}
      items={items}
      isActive={dropdownActiveClassDisabled ? () => false : undefined}
    />
  );
}
