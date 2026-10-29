/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Chokidar is the lib we use in Docusaurus to watch files

import * as Chokidar from 'chokidar';

/**
 * Our own watch options: we only expose the options we actually use, so that
 * we can upgrade or swap the underlying lib.
 */
export type WatchOptions = Pick<
  Chokidar.WatchOptions,
  'cwd' | 'usePolling' | 'interval'
>;

/** Our own file watcher handle, exposing only the APIs we actually use. */
export type Watcher = Pick<Chokidar.FSWatcher, 'on' | 'close'>;

/**
 * Watches file system paths for changes.
 * Only emits events for changes happening after the watcher is created.
 */
export function watch(
  paths: string | string[],
  options?: WatchOptions,
): Watcher {
  return Chokidar.watch(paths, {
    // Other lib options are still forwarded at runtime for retro-compatibility
    ...options,
    ignoreInitial: true,
  });
}
