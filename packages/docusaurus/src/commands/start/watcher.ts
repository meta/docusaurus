/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {watch} from '@docusaurus/glob';
import {posixPath} from '@docusaurus/utils';
import type {StartCLIOptions} from './start';
import type {LoadedPlugin, Props} from '@docusaurus/types';

type PollingOptions = {
  usePolling: boolean;
  interval: number | undefined;
};

export function createPollingOptions(
  cliOptions: StartCLIOptions,
): PollingOptions {
  return {
    usePolling: !!cliOptions.poll,
    interval: Number.isInteger(cliOptions.poll)
      ? (cliOptions.poll as number)
      : undefined,
  };
}

type FileWatchEventName = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';

export type FileWatchEvent = {
  name: FileWatchEventName;
  path: string;
};

type WatchParams = {
  pathsToWatch: string[];
  siteDir: string;
} & PollingOptions;

/**
 * Watch file system paths for changes and emit events
 * Returns an async handle to stop watching
 */
function watchPaths(
  params: WatchParams,
  callback: (event: FileWatchEvent) => void,
): () => Promise<void> {
  const {pathsToWatch, siteDir, ...options} = params;

  const watcher = watch(pathsToWatch, {
    cwd: siteDir,
    ...options,
  });

  watcher.on('all', (name, eventPath) => callback({name, path: eventPath}));

  return () => watcher.close();
}

function getSitePathsToWatch({props}: {props: Props}): string[] {
  return [
    // TODO we should also watch all imported modules!
    //  Use https://github.com/vercel/nft ?
    props.siteConfigPath,
    props.localizationDir,
  ];
}

export function getPluginPathsToWatch({
  siteDir,
  plugin,
}: {
  siteDir: string;
  plugin: LoadedPlugin;
}): string[] {
  const normalizeToSiteDir = (filepath: string) => {
    if (filepath && path.isAbsolute(filepath)) {
      return posixPath(path.relative(siteDir, filepath));
    }
    return posixPath(filepath);
  };

  return (plugin.getPathsToWatch?.() ?? [])
    .filter(Boolean)
    .map(normalizeToSiteDir);
}

export function setupSiteFileWatchers(
  {
    props,
    cliOptions,
  }: {
    props: Props;
    cliOptions: StartCLIOptions;
  },
  callback: (params: {
    plugin: LoadedPlugin | null;
    event: FileWatchEvent;
  }) => void,
): void {
  const {siteDir} = props;
  const pollingOptions = createPollingOptions(cliOptions);

  // TODO on config / or local plugin updates,
  //  the getFilePathsToWatch lifecycle code might get updated
  //  so we should probably reset the watchers?

  watchPaths(
    {
      pathsToWatch: getSitePathsToWatch({props}),
      siteDir: props.siteDir,
      ...pollingOptions,
    },
    (event) => callback({plugin: null, event}),
  );

  props.plugins.forEach((plugin) => {
    watchPaths(
      {
        pathsToWatch: getPluginPathsToWatch({plugin, siteDir}),
        siteDir,
        ...pollingOptions,
      },
      (event) => callback({plugin, event}),
    );
  });
}
