/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect} from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {watch, type WatchOptions} from '../watchUtils';

// Test utils to assert the events emitted by watch() on the real file system.
//
// The watch() tests document the behavior of all the path patterns that
// Docusaurus core and the ecosystem pass to it: plugins getPathsToWatch() of
// the top 150 npm Docusaurus packages (September 2026).
// Plugin paths are normalized by core before calling watch(), see
// packages/docusaurus/src/commands/start/__tests__/watcher.test.ts
// The goal is to detect behavior changes when upgrading or swapping the
// underlying watcher lib (Chokidar).
//
// Events are asserted as a sorted, deduplicated list of "<event> <path>"
// strings. In practice, Docusaurus reloads on any event, so what matters most
// is which file system changes trigger at least one event.
// Creating a file may randomly emit "add" + "change" (FSEvents, Windows...),
// so we ignore "change" events of files that were added during the same step.
// Dir events ("addDir", "unlinkDir") are ignored: they are not consistently
// emitted across platforms, and dir changes always come with file events.

/**
 * The Chokidar v3 backend used, they don't behave exactly the same:
 * - fsevents: macOS FSEvents, default on macOS (removed in Chokidar v4+)
 * - linux: Node.js fs.watch() (inotify)
 * - windows: Node.js fs.watch() (ReadDirectoryChangesW)
 * - polling: Node.js fs.watchFile(), with "docusaurus start --poll"
 * - windows-polling: same as polling, but on Windows
 */
type WatchBackend =
  | 'fsevents'
  | 'linux'
  | 'windows'
  | 'polling'
  | 'windows-polling';

type WatchMode = {
  name: string;
  options: WatchOptions;
  backend: WatchBackend;
};

const isWindows = process.platform === 'win32';

function getNativeBackend(): WatchBackend {
  if (process.platform === 'darwin') {
    return 'fsevents';
  }
  return isWindows ? 'windows' : 'linux';
}

const WatchModes: WatchMode[] = [
  {
    name: 'native',
    options: {},
    backend: getNativeBackend(),
  },
  {
    name: 'polling',
    // Same options as "docusaurus start --poll 50"
    options: {usePolling: true, interval: 50},
    backend: isWindows ? 'windows-polling' : 'polling',
  },
];

/**
 * Expected events, either the same for all backends, or per backend.
 * "windows-polling" falls back to "polling" when not provided.
 */
type EventsByBackend = {[backend in WatchBackend]?: string[]};
type ExpectedEvents = string[] | (EventsByBackend & {default: string[]});
type OptionalEvents = string[] | EventsByBackend;

function resolveEvents(
  events: ExpectedEvents | OptionalEvents,
  backend: WatchBackend,
): string[] {
  if (Array.isArray(events)) {
    return events;
  }
  return (
    events[backend] ??
    (backend === 'windows-polling' ? events.polling : undefined) ??
    ('default' in events ? events.default : undefined) ??
    []
  );
}

// TODO Chokidar v3 race: a file written right after its parent dir is created
//  may be missed (seen on Windows CI in polling mode), so we retry there
const retry = isWindows ? 2 : 0;

// Time to wait for extra/unexpected events once expected events are received
const QuietDelay = 500;
// Max time to wait for expected events
const EventsTimeout = 5000;
// Let the FS settle, FSEvents may report changes that happened before watching
const SettleDelay = 300;

export function posixPath(p: string): string {
  return p.replaceAll('\\', '/');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeFiles(dir: string, files: string[]): Promise<void> {
  for (const file of files) {
    const filePath = path.join(dir, file);
    await fs.mkdir(path.dirname(filePath), {recursive: true});
    await fs.writeFile(filePath, `content of ${file}`);
  }
}

type TestDirs = {
  /** Temp dir, parent of siteDir, to test paths outside of the site */
  rootDir: string;
  /** Site dir, used as the watcher "cwd" by default */
  siteDir: string;
};

/**
 * A file system operation, that only runs when calling emits()
 */
type Step = {
  /**
   * Run the file system operation, wait for the expected events, and assert
   * that they are the only events emitted.
   * Optional events may or may not be emitted (non-deterministic behavior).
   */
  emits: (
    expected: ExpectedEvents,
    options?: {optional?: OptionalEvents},
  ) => Promise<void>;
};

/**
 * All file paths are relative to siteDir.
 * Use "../" for file paths outside siteDir.
 */
type TestWatcher = TestDirs & {
  /** Events emitted before any file system operation */
  initialEvents: string[];
  /** Create files, and their parent dirs if needed */
  add: (...files: string[]) => Step;
  /** Update existing files */
  change: (...files: string[]) => Step;
  /**
   * Update a file with an "atomic write", like many editors do: write a temp
   * file and then rename it to replace the original file.
   */
  atomicChange: (file: string) => Step;
  /** Remove files or dirs */
  remove: (...files: string[]) => Step;
  /** Rename or move a file or dir */
  rename: (from: string, to: string) => Step;
} & AsyncDisposable;

type TestWatcherParams = {
  /** Files to create before watching */
  files?: string[];
  /** Paths to watch, use a function for absolute paths */
  paths: string | string[] | ((dirs: TestDirs) => string | string[]);
  options?: (dirs: TestDirs) => WatchOptions;
};

async function createTestWatcher(
  {backend, options: modeOptions}: WatchMode,
  {files = [], paths, options}: TestWatcherParams,
): Promise<TestWatcher> {
  const tmp = await fs.mkdtempDisposable(
    path.join(await fs.realpath(tmpdir()), 'docusaurus-watch-'),
  );
  const rootDir = tmp.path;
  const siteDir = path.join(rootDir, 'site');
  const dirs = {rootDir, siteDir};
  await fs.mkdir(siteDir);
  await writeFiles(siteDir, files);
  await sleep(SettleDelay);

  const events: string[] = [];
  const watcher = watch(typeof paths === 'function' ? paths(dirs) : paths, {
    cwd: siteDir,
    ...modeOptions,
    ...options?.(dirs),
  });
  watcher.on('all', (name, eventPath) => {
    events.push(`${name} ${posixPath(eventPath)}`);
  });
  await new Promise((resolve) => watcher.on('ready', resolve));
  await sleep(SettleDelay);
  const initialEvents = [...events];

  async function waitForEvents(expected: string[]): Promise<string[]> {
    const start = Date.now();
    while (
      !expected.every((e) => events.includes(e)) &&
      Date.now() - start < EventsTimeout
    ) {
      await sleep(50);
    }
    await sleep(QuietDelay);
    return [...new Set(events)]
      .filter((event) => !/^(?:addDir|unlinkDir) /.test(event))
      .filter(
        (event) =>
          !event.startsWith('change ') ||
          !events.includes(event.replace(/^change /, 'add ')),
      )
      .sort();
  }

  function step(action: () => Promise<void>): Step {
    return {
      async emits(expectedEvents, {optional: optionalEvents = []} = {}) {
        const expected = resolveEvents(expectedEvents, backend);
        const optional = resolveEvents(optionalEvents, backend);
        events.length = 0;
        await action();
        const received = await waitForEvents(expected);
        expect(
          received.filter(
            (event) => expected.includes(event) || !optional.includes(event),
          ),
        ).toEqual([...expected].sort());
      },
    };
  }

  const resolve = (file: string) => path.join(siteDir, file);
  const rename = (from: string, to: string) =>
    fs.rename(resolve(from), resolve(to));

  return {
    ...dirs,
    initialEvents,
    add: (...addedFiles) => step(() => writeFiles(siteDir, addedFiles)),
    change: (...changedFiles) =>
      step(async () => {
        for (const file of changedFiles) {
          await fs.writeFile(resolve(file), `updated content of ${file}`);
        }
      }),
    atomicChange: (file) =>
      step(async () => {
        const tempFile = `${file}.tmp`;
        await fs.writeFile(resolve(tempFile), `atomic content of ${file}`);
        await rename(tempFile, file);
      }),
    remove: (...removedFiles) =>
      step(async () => {
        for (const file of removedFiles) {
          await fs.rm(resolve(file), {recursive: true});
        }
      }),
    rename: (from, to) => step(() => rename(from, to)),
    async [Symbol.asyncDispose]() {
      await watcher.close();
      await tmp[Symbol.asyncDispose]();
    },
  };
}

/**
 * Runs the tests concurrently, with native and polling watch modes.
 */
export function describeWatchModes(
  fn: (
    createWatcher: (params: TestWatcherParams) => Promise<TestWatcher>,
  ) => void,
): void {
  describe.concurrent.each(WatchModes)('$name', {retry}, (mode) => {
    fn((params) => createTestWatcher(mode, params));
  });
}
