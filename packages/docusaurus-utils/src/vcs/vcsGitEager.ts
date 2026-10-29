/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import logger, {PerfLogger} from '@docusaurus/logger';
import {
  getGitAllRepoRoots,
  getGitRepositoryFilesInfo,
  isGitInsideWorktree,
} from './gitUtils';
import type {GitFileInfo, GitFileInfoMap} from './gitUtils';
import type {VcsConfig} from '@docusaurus/types';

// The Map keys should be absolute file paths, not relative Git paths
function resolveFileInfoMapPaths(
  repoRoot: string,
  filesInfo: GitFileInfoMap,
): GitFileInfoMap {
  function transformMapEntry(
    entry: [string, GitFileInfo],
  ): [string, GitFileInfo] {
    // We just resolve the Git paths that are relative to the repo root
    return [path.resolve(repoRoot, entry[0]), entry[1]];
  }

  return new Map(Array.from(filesInfo.entries()).map(transformMapEntry));
}

function mergeFileMaps(fileMaps: GitFileInfoMap[]): GitFileInfoMap {
  return new Map(fileMaps.flatMap((m) => [...m]));
}

async function loadAllGitFilesInfoMap(cwd: string): Promise<GitFileInfoMap> {
  const roots = await PerfLogger.async('Reading Git root dirs', () =>
    getGitAllRepoRoots(cwd),
  );

  const allMaps: GitFileInfoMap[] = await Promise.all(
    roots.map(async (root) => {
      const map = await PerfLogger.async(
        `Reading Git history for repo ${logger.path(path.basename(root))}`,
        () => getGitRepositoryFilesInfo(root),
      );
      return resolveFileInfoMapPaths(root, map);
    }),
  );

  return mergeFileMaps(allMaps);
}

type InitializeResult =
  | {
      type: 'success';
      filesMap: GitFileInfoMap;
      siteDir: string;
    }
  | {
      type: 'error';
      reason: 'not-in-worktree' | 'unknown';
      cause?: Error;
    };

async function initialize({
  siteDir,
}: {
  siteDir: string;
}): Promise<InitializeResult> {
  try {
    const isInWorktree = await isGitInsideWorktree(siteDir);
    if (!isInWorktree) {
      return {type: 'error', reason: 'not-in-worktree'};
    }
    const filesMap = await loadAllGitFilesInfoMap(siteDir);
    return {type: 'success', filesMap, siteDir};
  } catch (error) {
    return {type: 'error', reason: 'unknown', cause: error as Error};
  }
}

export function createVcsGitEagerConfig(): VcsConfig {
  let initPromise: Promise<InitializeResult> | null = null;

  async function getGitFileInfo(filePath: string): Promise<GitFileInfo | null> {
    const init = (await initPromise)!;
    if (init.type === 'success') {
      const key = path.resolve(init.siteDir, filePath);
      return init.filesMap.get(key) ?? null;
    } else if (init.reason === 'not-in-worktree') {
      throw new Error(
        `This Docusaurus site is outside any Git worktree.
Unable to read Git info for file ${logger.path(filePath)} `,
      );
    } else {
      throw init.cause;
    }
  }

  return {
    initialize: ({siteDir}) => {
      if (initPromise) {
        // We only initialize this VCS once!
        // For i18n sites, this permits reading ahead of time for all locales
        // so that it only slows down the first locale
        // I assume this logic is fine, but we'll see if it causes trouble

        // Note: we could also only call "initialize()" once from the outside,
        // But maybe it could be useful for custom VCS implementations to be
        // able to initialize once per locale?
        PerfLogger.log(
          'Git Eager VCS strategy already initialized, skipping re-initialization',
        );
        return;
      }

      initPromise = PerfLogger.async('Git Eager VCS init', () =>
        initialize({siteDir}),
      );
    },

    getFileCreationInfo: async (filePath: string) => {
      const fileInfo = await getGitFileInfo(filePath);
      return fileInfo?.creation ?? null;
    },

    getFileLastUpdateInfo: async (filePath: string) => {
      const fileInfo = await getGitFileInfo(filePath);
      return fileInfo?.lastUpdate ?? null;
    },
  };
}

// TODO it probably shouldn't be a singleton, but good enough for now
export const VscGitEager: VcsConfig = createVcsGitEagerConfig();
