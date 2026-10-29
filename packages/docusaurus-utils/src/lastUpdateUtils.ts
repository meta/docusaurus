/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import {getVcsPreset} from './vcs/vcs';

import type {PluginOptions, VcsConfig} from '@docusaurus/types';

export type LastUpdateData = {
  /**
   * A timestamp in **milliseconds**, usually read from `git log`
   * `undefined`: not read
   * `null`: no value to read (usual for untracked files)
   */
  lastUpdatedAt: number | undefined | null;
  /**
   * The author's name, usually coming from `git log`
   * `undefined`: not read
   * `null`: no value to read (usual for untracked files)
   */
  lastUpdatedBy: string | undefined | null;
};

type LastUpdateOptions = Pick<
  PluginOptions,
  'showLastUpdateAuthor' | 'showLastUpdateTime'
>;

export type FrontMatterLastUpdate = {
  author?: string;
  /**
   * Date can be any
   * [parsable date string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
   */
  date?: Date | string;
};

// TODO Docusaurus v4: refactor/rename, make it clear this fn is only
//  for Markdown files with front matter shared by content plugin
export async function readLastUpdateData(
  filePath: string,
  options: LastUpdateOptions,
  lastUpdateFrontMatter: FrontMatterLastUpdate | undefined,
  vcsParam: Pick<VcsConfig, 'getFileLastUpdateInfo'>,
): Promise<LastUpdateData> {
  // We fallback to the default VSC config at runtime on purpose
  // It preserves retro-compatibility if a third-party plugin imports it
  // This also ensures unit tests keep working without extra setup
  // We still want to ensure type safety by requiring the VCS param
  // TODO Docusaurus v4: refactor all these Git read APIs
  const vcs = vcsParam ?? getVcsPreset('default-v3');

  const {showLastUpdateAuthor, showLastUpdateTime} = options;

  if (!showLastUpdateAuthor && !showLastUpdateTime) {
    return {lastUpdatedBy: undefined, lastUpdatedAt: undefined};
  }

  const frontMatterAuthor = lastUpdateFrontMatter?.author;
  const frontMatterTimestamp = lastUpdateFrontMatter?.date
    ? new Date(lastUpdateFrontMatter.date).getTime()
    : undefined;

  // We try to minimize git last update calls
  // We call it at most once
  // If all the data is provided as front matter, we do not call it
  const getLastUpdateMemoized = _.memoize(() =>
    vcs.getFileLastUpdateInfo(filePath),
  );
  const getLastUpdateBy = () =>
    getLastUpdateMemoized().then((update) => {
      // Important, see https://github.com/facebook/docusaurus/pull/11211
      if (update === null) {
        return null;
      }
      return update?.author;
    });
  const getLastUpdateAt = () =>
    getLastUpdateMemoized().then((update) => {
      // Important, see https://github.com/facebook/docusaurus/pull/11211
      if (update === null) {
        return null;
      }
      return update?.timestamp;
    });

  const lastUpdatedBy = showLastUpdateAuthor
    ? (frontMatterAuthor ?? (await getLastUpdateBy()))
    : undefined;

  const lastUpdatedAt = showLastUpdateTime
    ? (frontMatterTimestamp ?? (await getLastUpdateAt()))
    : undefined;

  return {
    lastUpdatedBy,
    lastUpdatedAt,
  };
}
