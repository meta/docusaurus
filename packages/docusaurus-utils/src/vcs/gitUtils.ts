/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import os from 'node:os';
import _ from 'lodash';
import {execa, execaSync} from 'execa';
import PQueue from 'p-queue';
import logger from '@docusaurus/logger';
import {fs, pathExists} from '@docusaurus/fs';

// Quite high/conservative concurrency value (it was previously "Infinity")
// See https://github.com/facebook/docusaurus/pull/10915
const DefaultGitCommandConcurrency = os.availableParallelism() * 4;

const GitCommandConcurrencyEnv = process.env.DOCUSAURUS_GIT_COMMAND_CONCURRENCY
  ? parseInt(process.env.DOCUSAURUS_GIT_COMMAND_CONCURRENCY, 10)
  : undefined;

const GitCommandConcurrency =
  GitCommandConcurrencyEnv && GitCommandConcurrencyEnv > 0
    ? GitCommandConcurrencyEnv
    : DefaultGitCommandConcurrency;

// We use a queue to avoid running too many concurrent Git commands at once
// See https://github.com/facebook/docusaurus/issues/10348
const GitCommandQueue = new PQueue({
  concurrency: GitCommandConcurrency,
});

const realHasGitFn = () => {
  try {
    return execaSync('git', ['--version']).exitCode === 0;
  } catch {
    return false;
  }
};

// The hasGit call is synchronous IO so we memoize it
// The user won't install Git in the middle of a build anyway...
const hasGit =
  process.env.NODE_ENV === 'test' ? realHasGitFn : _.memoize(realHasGitFn);

/**
 * Fetches the git history of a file and returns a relevant commit date.
 * It gets the commit date instead of author date so that amended commits
 * can have their dates updated.
 *
 * Returns `null` if the file is not tracked by git.
 *
 * @throws If git is not found in `PATH`, if the file does not exist, if
 * `git log` exited with non-zero, or if it outputs unexpected text.
 */
export async function getFileCommitDate(
  /** Absolute path to the file. */
  file: string,
  args: {
    /**
     * `"oldest"` is the commit that added the file, following renames;
     * `"newest"` is the last commit that edited the file.
     */
    age?: 'oldest' | 'newest';
    /** Use `includeAuthor: true` to get the author information as well. */
    includeAuthor?: false;
  },
): Promise<{
  /** Relevant commit date. */
  date: Date; // TODO duplicate data, not really useful?
  /** Timestamp returned from git, converted to **milliseconds**. */
  timestamp: number;
} | null>;
/**
 * Fetches the git history of a file and returns a relevant commit date.
 * It gets the commit date instead of author date so that amended commits
 * can have their dates updated.
 *
 * Returns `null` if the file is not tracked by git.
 *
 * @throws If git is not found in `PATH`, if the file does not exist, if
 * `git log` exited with non-zero, or if it outputs unexpected text.
 */
export async function getFileCommitDate(
  /** Absolute path to the file. */
  file: string,
  args: {
    /**
     * `"oldest"` is the commit that added the file, following renames;
     * `"newest"` is the last commit that edited the file.
     */
    age?: 'oldest' | 'newest';
    includeAuthor: true;
  },
): Promise<{
  /** Relevant commit date. */
  date: Date;
  /** Timestamp returned from git, converted to **milliseconds**. */
  timestamp: number;
  /** The author's name, as returned from git. */
  author: string;
} | null>;

export async function getFileCommitDate(
  file: string,
  {
    age = 'oldest',
    includeAuthor = false,
  }: {
    age?: 'oldest' | 'newest';
    includeAuthor?: boolean;
  },
): Promise<{
  date: Date;
  timestamp: number;
  author?: string;
} | null> {
  if (!hasGit()) {
    throw new Error(
      `Failed to retrieve git history for "${file}" because git is not installed.`,
    );
  }

  if (!(await pathExists(file))) {
    throw new Error(
      `Failed to retrieve git history for "${file}" because the file does not exist.`,
    );
  }

  // We add a "RESULT:" prefix to make parsing easier
  // See why: https://github.com/facebook/docusaurus/pull/10022
  const resultFormat = includeAuthor ? 'RESULT:%ct,%an' : 'RESULT:%ct';

  const result = await GitCommandQueue.add(() => {
    return execa(
      'git',
      [
        // Do not include GPG signature in the log output
        // See https://github.com/facebook/docusaurus/pull/10022
        '-c',
        'log.showSignature=false',
        'log',
        `--format=${resultFormat}`,
        '--max-count=1',
        ...(age === 'oldest' ? ['--follow', '--diff-filter=A'] : []),
        '--',
        path.basename(file),
      ],
      {
        cwd: path.dirname(file),
      },
    );
  });

  // We only parse the output line starting with our "RESULT:" prefix
  // See why https://github.com/facebook/docusaurus/pull/10022
  const regex = includeAuthor
    ? /(?:^|\n)RESULT:(?<timestamp>\d+),(?<author>.+)(?:$|\n)/
    : /(?:^|\n)RESULT:(?<timestamp>\d+)(?:$|\n)/;

  const output = result.stdout.trim();

  // No output: the file is not tracked by git
  if (!output) {
    return null;
  }

  const match = output.match(regex);

  if (!match) {
    throw new Error(
      `Failed to retrieve the git history for file "${file}" with unexpected output: ${output}`,
    );
  }

  const timestampInSeconds = Number(match.groups!.timestamp);
  const timestamp = timestampInSeconds * 1_000;
  const date = new Date(timestamp);

  if (includeAuthor) {
    return {date, timestamp, author: match.groups!.author!};
  }
  return {date, timestamp};
}

let showedGitRequirementWarning = false;
let showedFileNotTrackedWarning = false;

type GitCommitInfo = {timestamp: number; author: string};

async function getGitCommitInfo(
  filePath: string,
  age: 'oldest' | 'newest',
): Promise<GitCommitInfo | null> {
  if (!filePath) {
    return null;
  }
  if (!hasGit()) {
    if (!showedGitRequirementWarning) {
      logger.warn('Sorry, the last update options require Git.');
      showedGitRequirementWarning = true;
    }
    return null;
  }
  const result = await getFileCommitDate(filePath, {
    age,
    includeAuthor: true,
  }).catch((err) => {
    throw new Error(
      `An error occurred when trying to get the file ${
        age === 'oldest' ? 'creation' : 'last update'
      } date from Git`,
      {cause: err},
    );
  });
  if (!result) {
    if (!showedFileNotTrackedWarning) {
      logger.warn(
        'Cannot infer the update date for some files, as they are not tracked by git.',
      );
      showedFileNotTrackedWarning = true;
    }
    return null;
  }
  return {timestamp: result.timestamp, author: result.author};
}

export async function getGitLastUpdate(
  filePath: string,
): Promise<GitCommitInfo | null> {
  return getGitCommitInfo(filePath, 'newest');
}

export async function getGitCreation(
  filePath: string,
): Promise<GitCommitInfo | null> {
  return getGitCommitInfo(filePath, 'oldest');
}

export async function isGitInsideWorktree(cwd: string): Promise<boolean> {
  try {
    const result = await execa('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd,
      reject: false,
    });
    return result.exitCode === 0;
  } catch (error) {
    throw new Error(
      `Couldn't check if this directory is within a Git worktree: ${cwd}`,
      {cause: error},
    );
  }
}

export async function getGitRepoRoot(cwd: string): Promise<string> {
  const result = await execa('git', ['rev-parse', '--show-toplevel'], {
    cwd,
  }).catch((error) => {
    // We enter this rejection when cwd is not a dir for example
    throw new Error(
      `Couldn't find the git repository root directory
Failure while running ${logger.code(
        'git rev-parse --show-toplevel',
      )} from cwd=${logger.path(cwd)}
The command executed throws an error: ${error.message}`,
      {cause: error},
    );
  });

  return fs.realpath(result.stdout.trim());
}

// A Git "superproject" is a Git repository that contains submodules
// See https://git-scm.com/docs/git-rev-parse#Documentation/git-rev-parse.txt---show-superproject-working-tree
// See https://git-scm.com/book/en/v2/Git-Tools-Submodules
export async function getGitSuperProjectRoot(
  cwd: string,
): Promise<string | null> {
  const result = await execa(
    'git',
    ['rev-parse', '--show-superproject-working-tree'],
    {
      cwd,
    },
  ).catch((error) => {
    // We enter this rejection when cwd is not a dir for example
    throw new Error(
      `Couldn't find the git superproject root directory
Failure while running ${logger.code(
        'git rev-parse --show-superproject-working-tree',
      )} from cwd=${logger.path(cwd)}
The command executed throws an error: ${error.message}`,
      {cause: error},
    );
  });

  const output = result.stdout.trim();
  // this command only works when inside submodules
  // otherwise it doesn't return anything when we are inside the main repo
  if (output) {
    return fs.realpath(output);
  }
  return getGitRepoRoot(cwd);
}

// See https://git-scm.com/book/en/v2/Git-Tools-Submodules
export async function getGitSubmodulePaths(cwd: string): Promise<string[]> {
  const result = await execa('git', ['submodule', 'status'], {
    cwd,
  }).catch((error) => {
    // We enter this rejection when cwd is not a dir for example
    throw new Error(
      `Couldn't read the list of git submodules
Failure while running ${logger.code(
        'git submodule status',
      )} from cwd=${logger.path(cwd)}
The command executed throws an error: ${error.message}`,
      {cause: error},
    );
  });

  const output = result.stdout.trim();

  if (!output) {
    return [];
  }

  /* The output may contain a space/-/+/U prefix, for example
     1234567e3e35d1f5b submodules/foo (heads/main)
    -9ab1f1d3a2d77b0a4 submodules/bar (heads/dev)
    +f00ba42e1b3ddead submodules/baz (remotes/origin/main)
    Udeadbeefcafe1234 submodules/qux
   */
  const getSubmodulePath = async (line: string) => {
    const submodulePath = line.substring(1).split(' ')[1];
    if (!submodulePath) {
      throw new Error(`Failed to parse git submodule line: ${line}`);
    }
    return submodulePath;
  };

  return Promise.all(output.split('\n').map(getSubmodulePath));
}

// Find the root git repository alongside all its submodules, if any
export async function getGitAllRepoRoots(cwd: string): Promise<string[]> {
  try {
    const superProjectRoot = await getGitSuperProjectRoot(cwd);
    if (!superProjectRoot) {
      return [];
    }
    let submodulePaths = await getGitSubmodulePaths(superProjectRoot);
    submodulePaths = await Promise.all(
      submodulePaths.map((submodulePath) =>
        fs.realpath(path.resolve(superProjectRoot, submodulePath)),
      ),
    );
    return [superProjectRoot, ...submodulePaths];
  } catch (error) {
    throw new Error(
      `Could not get all the git repository root paths (superproject + submodules) from cwd=${cwd}`,
      {cause: error},
    );
  }
}

// Useful information about a file tracked in a Git repository
export type GitFileInfo = {
  creation: GitCommitInfo;
  lastUpdate: GitCommitInfo;
};

// A map of all the files tracked in a Git repository
export type GitFileInfoMap = Map<string, GitFileInfo>;

// Logic inspired from Astro Starlight:
// See https://bsky.app/profile/bluwy.me/post/3lyihod6qos2a
// See https://github.com/withastro/starlight/blob/c417f1efd463be63b7230617d72b120caed098cd/packages/starlight/utils/git.ts#L58
export async function getGitRepositoryFilesInfo(
  cwd: string,
): Promise<GitFileInfoMap> {
  // git --no-pager -c log.showSignature=false log --format=t:%ct,a:%an --name-status
  const result = await execa(
    'git',
    [
      '--no-pager',
      // Do not include GPG signature in the log output
      // See https://github.com/facebook/docusaurus/pull/10022
      '-c',
      'log.showSignature=false',
      // The git command we want to run
      'log',
      // Format each history entry as t:<seconds since epoch>
      '--format=t:%ct,a:%an',
      // In each entry include the name and status for each modified file
      '--name-status',

      // For creation info, should we use --follow --find-renames=100% ???
    ],
    {
      cwd,
      // TODO use streaming to avoid a large buffer
      // See https://github.com/withastro/starlight/issues/3154
      maxBuffer: 20 * 1024 * 1024,
    },
  );

  const logLines = result.stdout.split('\n');

  const now = Date.now();

  // TODO not fail-fast
  let runningDate = now;
  let runningAuthor = 'N/A';
  const runningMap: GitFileInfoMap = new Map();

  for (const logLine of logLines) {
    if (logLine.startsWith('t:')) {
      // t:<timestamp>,a:<author name>
      // We can't use split(',') because author names may contain commas
      // Example: "t:123456,a:John Doe, Jr."
      const [timestampStr, author] = logLine.slice(2).split(',a:') as [
        string,
        string,
      ];
      runningDate = Number.parseInt(timestampStr, 10) * 1000;
      runningAuthor = author;
    }

    // TODO the code below doesn't handle delete/move/rename operations properly
    //  it returns files that no longer exist in the repo (deleted/moved)

    // - Added files take the format `A\t<file>`
    // - Modified files take the format `M\t<file>`
    // - Deleted files take the format `D\t<file>`
    // - Renamed files take the format `R<count>\t<old>\t<new>`
    // - Copied files take the format `C<count>\t<old>\t<new>`
    // The name of the file as of the commit being processed is always
    // the last part of the log line.
    const tabSplit = logLine.lastIndexOf('\t');
    if (tabSplit === -1) {
      continue;
    }
    const relativeFile = logLine.slice(tabSplit + 1);

    const currentFileInfo = runningMap.get(relativeFile);

    const currentCreationTime = currentFileInfo?.creation.timestamp || now;
    const newCreationTime = Math.min(currentCreationTime, runningDate);
    const newCreation: GitCommitInfo =
      !currentFileInfo || newCreationTime !== currentCreationTime
        ? {timestamp: newCreationTime, author: runningAuthor}
        : currentFileInfo.creation;

    const currentLastUpdateTime = currentFileInfo?.lastUpdate.timestamp || 0;
    const newLastUpdateTime = Math.max(currentLastUpdateTime, runningDate);
    const newLastUpdate: GitCommitInfo =
      !currentFileInfo || newLastUpdateTime !== currentLastUpdateTime
        ? {timestamp: newLastUpdateTime, author: runningAuthor}
        : currentFileInfo.lastUpdate;

    runningMap.set(relativeFile, {
      creation: newCreation,
      lastUpdate: newLastUpdate,
    });
  }

  return runningMap;
}
