/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {getContentPathList, normalizeUrl, posixPath} from '@docusaurus/utils';
import {CURRENT_VERSION_NAME} from '../constants';
import {validateVersionsOptions} from './validation';
import {
  getDocsDirPathLocalized,
  getVersionMetadataPaths,
  readVersionNames,
} from './files';
import {createSidebarsUtils} from '../sidebars/utils';
import {getCategoryGeneratedIndexMetadataList} from '../categoryGeneratedIndex';
import {addDocNavigation} from '../docs';
import type {FullVersion} from '../types';
import type {LoadContext} from '@docusaurus/types';
import type {
  LoadedVersion,
  PluginOptions,
  VersionBanner,
  VersionMetadata,
} from '@docusaurus/plugin-content-docs';

export type VersionContext = {
  /** The version name to get banner of. */
  versionName: string;
  /** All versions, ordered from newest to oldest. */
  versionNames: string[];
  lastVersionName: string;
  context: LoadContext;
  options: PluginOptions;
};

function getVersionEditUrls({
  contentPath,
  contentPathLocalized,
  context,
  options,
}: Pick<VersionMetadata, 'contentPath' | 'contentPathLocalized'> & {
  context: LoadContext;
  options: PluginOptions;
}): Pick<VersionMetadata, 'editUrl' | 'editUrlLocalized'> {
  // If the user is using the functional form of editUrl,
  // she has total freedom and we can't compute a "version edit url"
  if (!options.editUrl || typeof options.editUrl === 'function') {
    return {editUrl: undefined, editUrlLocalized: undefined};
  }

  // Intermediate var just to please TS not narrowing to "string"
  const editUrlOption = options.editUrl;

  const getEditUrl = () => {
    const editDirPath = options.editCurrentVersion ? options.path : contentPath;

    return normalizeUrl([
      editUrlOption,
      posixPath(
        path.relative(
          context.siteDir,
          path.resolve(context.siteDir, editDirPath),
        ),
      ),
    ]);
  };

  const getEditUrlLocalized = () => {
    if (!contentPathLocalized) {
      return undefined;
    }
    const editDirPathLocalized = options.editCurrentVersion
      ? getDocsDirPathLocalized({
          localizationDir: context.localizationDir,
          versionName: CURRENT_VERSION_NAME,
          pluginId: options.id,
        })
      : contentPathLocalized;

    return normalizeUrl([
      editUrlOption,
      posixPath(
        path.relative(
          context.siteDir,
          path.resolve(context.siteDir, editDirPathLocalized),
        ),
      ),
    ]);
  };

  return {editUrl: getEditUrl(), editUrlLocalized: getEditUrlLocalized()};
}

/**
 * The default version banner depends on the version's relative position to the
 * latest version. More recent ones are "unreleased", and older ones are
 * "unmaintained".
 */
export function getDefaultVersionBanner({
  versionName,
  versionNames,
  lastVersionName,
}: VersionContext): VersionBanner | null {
  // Current version: good, no banner
  if (versionName === lastVersionName) {
    return null;
  }
  // Upcoming versions: unreleased banner
  if (
    versionNames.indexOf(versionName) < versionNames.indexOf(lastVersionName)
  ) {
    return 'unreleased';
  }
  // Older versions: display unmaintained banner
  return 'unmaintained';
}

export function getVersionBanner(
  context: VersionContext,
): VersionMetadata['banner'] {
  const {versionName, options} = context;
  const versionBannerOption = options.versions[versionName]?.banner;
  if (versionBannerOption) {
    return versionBannerOption === 'none' ? null : versionBannerOption;
  }
  return getDefaultVersionBanner(context);
}

export function getVersionBadge({
  versionName,
  versionNames,
  options,
}: VersionContext): VersionMetadata['badge'] {
  // If site is not versioned or only one version is included
  // we don't show the version badge by default
  // See https://github.com/facebook/docusaurus/issues/3362
  const defaultVersionBadge = versionNames.length !== 1;
  return options.versions[versionName]?.badge ?? defaultVersionBadge;
}

export function getVersionNoIndex({
  versionName,
  options,
}: VersionContext): VersionMetadata['noIndex'] {
  return options.versions[versionName]?.noIndex ?? false;
}

function getVersionClassName({
  versionName,
  options,
}: VersionContext): VersionMetadata['className'] {
  const defaultVersionClassName = `docs-version-${versionName}`;
  return options.versions[versionName]?.className ?? defaultVersionClassName;
}

function getVersionLabel({
  versionName,
  options,
}: VersionContext): VersionMetadata['label'] {
  const defaultVersionLabel =
    versionName === CURRENT_VERSION_NAME ? 'Next' : versionName;
  return options.versions[versionName]?.label ?? defaultVersionLabel;
}

function getVersionPathPart({
  versionName,
  options,
  lastVersionName,
}: VersionContext): string {
  function getDefaultVersionPathPart() {
    if (versionName === lastVersionName) {
      return '';
    }
    return versionName === CURRENT_VERSION_NAME ? 'next' : versionName;
  }
  return options.versions[versionName]?.path ?? getDefaultVersionPathPart();
}

async function createVersionMetadata(
  context: VersionContext,
): Promise<VersionMetadata> {
  const {versionName, lastVersionName, options, context: loadContext} = context;
  const {sidebarFilePath, contentPath, contentPathLocalized} =
    await getVersionMetadataPaths(context);
  const versionPathPart = getVersionPathPart(context);

  const routePath = normalizeUrl([
    loadContext.baseUrl,
    options.routeBasePath,
    versionPathPart,
  ]);

  const versionEditUrls = getVersionEditUrls({
    contentPath,
    contentPathLocalized,
    context: loadContext,
    options,
  });

  return {
    versionName,
    label: getVersionLabel(context),
    banner: getVersionBanner(context),
    badge: getVersionBadge(context),
    noIndex: getVersionNoIndex(context),
    className: getVersionClassName(context),
    path: routePath,
    tagsPath: normalizeUrl([routePath, options.tagsBasePath]),
    ...versionEditUrls,
    isLast: versionName === lastVersionName,
    routePriority: versionPathPart === '' ? -1 : undefined,
    sidebarFilePath,
    contentPath,
    contentPathLocalized,
  };
}

/**
 * Filter versions according to provided options (i.e. `onlyIncludeVersions`).
 *
 * Note: we preserve the order in which versions are provided; the order of the
 * `onlyIncludeVersions` array does not matter
 */
export function filterVersions(
  versionNamesUnfiltered: string[],
  options: PluginOptions,
): string[] {
  if (options.onlyIncludeVersions) {
    return versionNamesUnfiltered.filter((name) =>
      options.onlyIncludeVersions!.includes(name),
    );
  }
  return versionNamesUnfiltered;
}

function getLastVersionName({
  versionNames,
  options,
}: Pick<VersionContext, 'versionNames' | 'options'>) {
  return (
    options.lastVersion ??
    versionNames.find((name) => name !== CURRENT_VERSION_NAME) ??
    CURRENT_VERSION_NAME
  );
}

export async function readVersionsMetadata({
  context,
  options,
}: {
  context: LoadContext;
  options: PluginOptions;
}): Promise<VersionMetadata[]> {
  const allVersionNames = await readVersionNames(context.siteDir, options);
  validateVersionsOptions(allVersionNames, options);
  const versionNames = filterVersions(allVersionNames, options);
  const lastVersionName = getLastVersionName({versionNames, options});
  return Promise.all(
    versionNames.map((versionName) =>
      createVersionMetadata({
        versionName,
        versionNames,
        lastVersionName,
        context,
        options,
      }),
    ),
  );
}

export function toFullVersion(version: LoadedVersion): FullVersion {
  const sidebarsUtils = createSidebarsUtils(version.sidebars);
  return {
    ...version,
    // Computed after translateContent, from the translated sidebar labels
    docs: addDocNavigation({docs: version.docs, sidebarsUtils}),
    sidebarsUtils,
    categoryGeneratedIndices: getCategoryGeneratedIndexMetadataList({
      docs: version.docs,
      sidebarsUtils,
    }),
  };
}

export function getVersionFromSourceFilePath(
  filePath: string,
  versionsMetadata: VersionMetadata[],
): VersionMetadata {
  const versionFound = versionsMetadata.find((version) =>
    getContentPathList(version).some((docsDirPath) =>
      filePath.startsWith(docsDirPath),
    ),
  );
  if (!versionFound) {
    throw new Error(
      `Unexpected error: file at "${filePath}" does not belong to any docs version!`,
    );
  }
  return versionFound;
}
