/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execa, type Options, type Result} from 'execa';

import {
  getFileCommitDate,
  getGitLastUpdate,
  getGitCreation,
  getGitRepoRoot,
  getGitSuperProjectRoot,
  getGitSubmodulePaths,
  getGitAllRepoRoots,
  getGitRepositoryFilesInfo,
} from '../gitUtils';
import {createVcsGitEagerConfig} from '../vcsGitEager';

class Git {
  private dir: string;

  private constructor(dir: string) {
    this.dir = dir;
  }

  private static async runOptimisticGitCommand({
    cwd,
    cmd,
    args,
    options,
  }: {
    cwd: string;
    args: string[];
    cmd: string;
    options?: Options;
  }): Promise<Result> {
    return execa(cmd, args, {
      cwd,
      shell: true,
      ...options,
    });
  }

  static async initializeRepo(dir: string): Promise<Git> {
    await Git.runOptimisticGitCommand({
      cmd: 'git',
      args: ['init'],
      cwd: dir,
    });
    await Git.runOptimisticGitCommand({
      cmd: 'git',
      args: ['config', 'user.email', '"test@example.com"'],
      cwd: dir,
    });
    await Git.runOptimisticGitCommand({
      cmd: 'git',
      args: ['config', 'user.name', '"Test"'],
      cwd: dir,
    });
    await Git.runOptimisticGitCommand({
      cmd: 'git',
      args: ['commit', '--allow-empty', '-m "First commit"'],
      cwd: dir,
    });
    return new Git(dir);
  }

  async runOptimisticGitCommand(
    cmd: string,
    args: string[],
    options?: Options,
  ): Promise<Result> {
    return Git.runOptimisticGitCommand({cwd: this.dir, cmd, args, options});
  }

  async add(filePath: string): Promise<void> {
    await this.runOptimisticGitCommand('git', ['add', filePath]);
  }
  async addAll(): Promise<void> {
    await this.runOptimisticGitCommand('git', ['add', '.']);
  }

  async commit(msg: string, date: string, author: string): Promise<void> {
    await this.runOptimisticGitCommand(
      `git`,
      [
        'commit',
        `-m "${msg}"`,
        `--date "${date}T00:00:00Z"`,
        `--author "${author}"`,
      ],
      {env: {GIT_COMMITTER_DATE: `${date}T00:00:00Z`}},
    );
  }

  async commitFile(
    filePath: string,
    {
      fileContent,
      commitMessage,
      commitDate,
      commitAuthor,
    }: {
      fileContent?: string;
      commitMessage?: string;
      commitDate?: string;
      commitAuthor?: string;
    } = {},
  ): Promise<void> {
    await fs.mkdir(path.join(this.dir, path.dirname(filePath)), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(this.dir, filePath),
      fileContent ?? `Content of ${filePath}`,
    );
    await this.add(filePath);
    await this.commit(
      commitMessage ?? `Create ${filePath}`,
      commitDate ?? '2020-06-19',
      commitAuthor ?? 'Seb <seb@example.com>',
    );
  }

  async addSubmodule(name: string, repoPath: string): Promise<void> {
    await this.runOptimisticGitCommand('git', [
      '-c protocol.file.allow=always',
      'submodule',
      'add',
      repoPath,
      name,
    ]);
  }

  async defineSubmodules(submodules: {[name: string]: string}): Promise<void> {
    for (const entry of Object.entries(submodules)) {
      await this.addSubmodule(entry[0], entry[1]);
    }
    await this.runOptimisticGitCommand('git', [
      'submodule',
      'update',
      '--init',
      '--recursive',
    ]);
  }
}

async function createTempDir(): Promise<string> {
  let repoDir = await fs.mkdtemp(
    // Note, the <MKDTEMP_DIR> is useful for stabilizing Jest snapshots paths
    // This way, snapshot paths don't contain random temp dir names.
    // See our ./test/snapshotPathNormalizer.ts
    path.join(os.tmpdir(), 'git-test-repo___MKDTEMP_DIR___'),
  );
  repoDir = await fs.realpath(repoDir);
  return repoDir;
}

async function createGitRepoEmpty(): Promise<{repoDir: string; git: Git}> {
  const repoDir = await createTempDir();
  const git = await Git.initializeRepo(repoDir);
  return {repoDir, git};
}

describe('commit info APIs', () => {
  async function createGitRepoTestFixture() {
    const {repoDir, git} = await createGitRepoEmpty();

    await git.commitFile('test.txt', {
      fileContent: 'Some content',
      commitMessage: 'Create test.txt',
      commitDate: '2020-06-19',
      commitAuthor: 'Caroline <caroline@example.com>',
    });

    await git.commitFile('test.txt', {
      fileContent: 'Updated content',
      commitMessage: 'Update test.txt',
      commitDate: '2020-06-20',
      commitAuthor: 'Josh-Cena <josh-cena@example.com>',
    });

    await fs.writeFile(path.join(repoDir, 'test.txt'), 'Updated content (2)');
    await fs.writeFile(path.join(repoDir, 'moved.txt'), 'This file is moved');
    await git.addAll();
    await git.commit(
      'Update test.txt again, create moved.txt',
      '2020-09-13',
      'Robert <robert@example.com>',
    );

    await fs.rename(
      path.join(repoDir, 'moved.txt'),
      path.join(repoDir, 'dest.txt'),
    );
    await git.addAll();
    await git.commit(
      'Rename moved.txt to dest.txt',
      '2020-11-13',
      'Seb <seb@example.com>',
    );

    await fs.writeFile(path.join(repoDir, 'untracked.txt'), "I'm untracked");

    return repoDir;
  }

  // Create the repo only once for all tests => faster tests
  const repoDirPromise = createGitRepoTestFixture();

  describe('getFileCommitDate', () => {
    it('returns latest commit date with author', async () => {
      const repoDir = await repoDirPromise;

      await expect(
        getFileCommitDate(path.join(repoDir, 'test.txt'), {
          age: 'oldest',
          includeAuthor: true,
        }),
      ).resolves.toEqual({
        date: new Date('2020-06-19'),
        timestamp: new Date('2020-06-19').getTime(),
        author: 'Caroline',
      });
      await expect(
        getFileCommitDate(path.join(repoDir, 'dest.txt'), {
          age: 'oldest',
          includeAuthor: true,
        }),
      ).resolves.toEqual({
        date: new Date('2020-09-13'),
        timestamp: new Date('2020-09-13').getTime(),
        author: 'Robert',
      });
    });

    it('returns earliest commit date with author', async () => {
      const repoDir = await repoDirPromise;

      await expect(
        getFileCommitDate(path.join(repoDir, 'test.txt'), {
          age: 'newest',
          includeAuthor: true,
        }),
      ).resolves.toEqual({
        date: new Date('2020-09-13'),
        timestamp: new Date('2020-09-13').getTime(),
        author: 'Robert',
      });
      await expect(
        getFileCommitDate(path.join(repoDir, 'dest.txt'), {
          age: 'newest',
          includeAuthor: true,
        }),
      ).resolves.toEqual({
        date: new Date('2020-11-13'),
        timestamp: new Date('2020-11-13').getTime(),
        author: 'Seb',
      });
    });

    it('returns null when file is not tracked', async () => {
      const repoDir = await repoDirPromise;

      await expect(
        getFileCommitDate(path.join(repoDir, 'untracked.txt'), {
          age: 'newest',
          includeAuthor: true,
        }),
      ).resolves.toBeNull();
    });

    it('throws when file not found', async () => {
      const repoDir = await createGitRepoTestFixture();

      await expect(() =>
        getFileCommitDate(path.join(repoDir, 'nonexistent.txt'), {
          age: 'newest',
          includeAuthor: true,
        }),
      ).rejects.toThrow(
        /Failed to retrieve git history for ".*nonexistent.txt" because the file does not exist./,
      );
    });
  });

  describe('commit info APIs', () => {
    it('returns creation info for test.txt', async () => {
      const repoDir = await repoDirPromise;

      const filePath = path.join(repoDir, 'test.txt');
      await expect(getGitCreation(filePath)).resolves.toEqual({
        author: 'Caroline',
        timestamp: new Date('2020-06-19').getTime(),
      });

      await expect(getGitLastUpdate(filePath)).resolves.toEqual({
        author: 'Robert',
        timestamp: new Date('2020-09-13').getTime(),
      });
    });

    it('returns creation info for dest.txt', async () => {
      const repoDir = await repoDirPromise;

      const filePath = path.join(repoDir, 'dest.txt');
      await expect(getGitCreation(filePath)).resolves.toEqual({
        author: 'Robert',
        timestamp: new Date('2020-09-13').getTime(),
      });
      await expect(getGitLastUpdate(filePath)).resolves.toEqual({
        author: 'Seb',
        timestamp: new Date('2020-11-13').getTime(),
      });
    });

    it('returns creation info for untracked.txt', async () => {
      const repoDir = await repoDirPromise;

      const filePath = path.join(repoDir, 'untracked.txt');
      await expect(getGitCreation(filePath)).resolves.toEqual(null);
      await expect(getGitLastUpdate(filePath)).resolves.toEqual(null);
    });

    it('returns creation info for non-existing.txt', async () => {
      const repoDir = await repoDirPromise;

      const filePath = path.join(repoDir, 'non-existing.txt');
      await expect(
        getGitCreation(filePath),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [Error: An error occurred when trying to get the file creation date from Git]
        Cause: [Error: Failed to retrieve git history for "<TEMP_DIR>/git-test-repo<MKDTEMP_DIR_STABLE>/non-existing.txt" because the file does not exist.]
      `,
      );
      await expect(
        getGitLastUpdate(filePath),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [Error: An error occurred when trying to get the file last update date from Git]
        Cause: [Error: Failed to retrieve git history for "<TEMP_DIR>/git-test-repo<MKDTEMP_DIR_STABLE>/non-existing.txt" because the file does not exist.]
      `,
      );
    });

    it('returns files info', async () => {
      const repoDir = await repoDirPromise;

      await expect(getGitRepositoryFilesInfo(repoDir)).resolves
        .toMatchInlineSnapshot(`
        Map {
          "dest.txt" => {
            "creation": {
              "author": "Seb",
              "timestamp": 1605225600000,
            },
            "lastUpdate": {
              "author": "Seb",
              "timestamp": 1605225600000,
            },
          },
          "moved.txt" => {
            "creation": {
              "author": "Robert",
              "timestamp": 1599955200000,
            },
            "lastUpdate": {
              "author": "Robert",
              "timestamp": 1599955200000,
            },
          },
          "test.txt" => {
            "creation": {
              "author": "Caroline",
              "timestamp": 1592524800000,
            },
            "lastUpdate": {
              "author": "Robert",
              "timestamp": 1599955200000,
            },
          },
        }
      `);
    });

    it('preserves author names containing commas', async () => {
      const {repoDir, git} = await createGitRepoEmpty();

      await git.commitFile('comma-author.txt', {
        fileContent: 'content',
        commitMessage: 'Commit by author with comma in name',
        commitDate: '2024-01-15',
        commitAuthor: 'Doe, Jane <jane@example.com>',
      });

      const filesInfo = await getGitRepositoryFilesInfo(repoDir);
      const fileInfo = filesInfo.get('comma-author.txt');

      expect(fileInfo).toBeDefined();
      expect(fileInfo!.creation.author).toBe('Doe, Jane');
      expect(fileInfo!.lastUpdate.author).toBe('Doe, Jane');
    });
  });
});

describe('getGitRepoRoot', () => {
  async function initTestRepo() {
    const {repoDir, git} = await createGitRepoEmpty();
    await git.commitFile('subDir/test.txt');
    return repoDir;
  }

  // Create the repo only once for all tests => faster tests
  const repoDirPromise = initTestRepo();

  it('returns repoDir for cwd=repoDir', async () => {
    const repoDir = await repoDirPromise;
    const cwd = repoDir;
    await expect(getGitRepoRoot(cwd)).resolves.toEqual(repoDir);
  });

  it('returns repoDir for cwd=repoDir/subDir', async () => {
    const repoDir = await repoDirPromise;
    const cwd = path.join(repoDir, 'subDir');
    await expect(getGitRepoRoot(cwd)).resolves.toEqual(repoDir);
  });

  it('returns Docusaurus repo for cwd=__dirname', async () => {
    const cwd = __dirname;
    const repoRoot = path.resolve(cwd, '..', '..', '..', '..', '..');
    await expect(getGitRepoRoot(cwd)).resolves.toEqual(repoRoot);
  });

  it('rejects for cwd=repoDir/doesNotExist', async () => {
    const repoDir = await repoDirPromise;
    const cwd = path.join(repoDir, 'doesNotExist');
    await expect(getGitRepoRoot(cwd)).rejects.toThrow(
      /Couldn't find the git repository root directory/,
    );
  });
});

describe('submodules APIs', () => {
  async function initTestRepo() {
    const superproject = await createGitRepoEmpty();
    await superproject.git.commitFile('README.md');
    await superproject.git.commitFile('website/docs/myDoc.md');

    const submodule1 = await createGitRepoEmpty();
    await submodule1.git.commitFile('file1.txt');

    const submodule2 = await createGitRepoEmpty();
    await submodule2.git.commitFile('subDir/file2.txt');

    await superproject.git.defineSubmodules({
      'submodules/submodule1': submodule1.repoDir,
      'submodules/submodule2': submodule2.repoDir,
    });

    return {superproject, submodule1, submodule2};
  }

  // Create the repo only once for all tests => faster tests
  const repoPromise = initTestRepo();

  describe('getGitSuperProjectRoot', () => {
    it('returns superproject dir for cwd=superproject', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir);
      await expect(getGitSuperProjectRoot(cwd)).resolves.toEqual(
        repo.superproject.repoDir,
      );
    });

    it('returns superproject dir for cwd=superproject/submodules', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'submodules');
      await expect(getGitSuperProjectRoot(cwd)).resolves.toEqual(
        repo.superproject.repoDir,
      );
    });

    it('returns superproject dir for cwd=superproject/website/docs', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'website/docs');
      await expect(getGitSuperProjectRoot(cwd)).resolves.toEqual(
        repo.superproject.repoDir,
      );
    });

    it('returns superproject dir for cwd=submodule1', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'submodules/submodule1');
      await expect(getGitSuperProjectRoot(cwd)).resolves.toEqual(
        repo.superproject.repoDir,
      );
    });

    it('returns superproject dir for cwd=submodule2', async () => {
      const repo = await initTestRepo();
      const cwd = path.join(repo.superproject.repoDir, 'submodules/submodule2');
      await expect(getGitSuperProjectRoot(cwd)).resolves.toEqual(
        repo.superproject.repoDir,
      );
    });

    it('returns superproject dir for cwd=submodule2/subDir', async () => {
      const repo = await repoPromise;
      const cwd = path.join(
        repo.superproject.repoDir,
        'submodules/submodule2/subDir',
      );
      await expect(getGitSuperProjectRoot(cwd)).resolves.toEqual(
        repo.superproject.repoDir,
      );
    });

    it('rejects for cwd of untracked dir', async () => {
      const cwd = await os.homedir();
      // Do we really want this to throw?
      // Not sure, and Git doesn't help us failsafe and return null...
      await expect(getGitSuperProjectRoot(cwd)).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [Error: Couldn't find the git superproject root directory
        Failure while running \`git rev-parse --show-superproject-working-tree\` from cwd="<HOME_DIR>"
        The command executed throws an error: Command failed with exit code 128: git rev-parse --show-superproject-working-tree

        fatal: not a git repository (or any of the parent directories): .git]
        Cause: [ExecaError: Command failed with exit code 128: git rev-parse --show-superproject-working-tree

        fatal: not a git repository (or any of the parent directories): .git]
      `);
    });
  });

  describe('getGitSubmodulePaths', () => {
    it('returns submodules for cwd=superproject', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir);
      await expect(getGitSubmodulePaths(cwd)).resolves.toEqual([
        'submodules/submodule1',
        'submodules/submodule2',
      ]);
    });

    it('returns submodules for cwd=superproject/website/docs', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'website', 'docs');
      await expect(getGitSubmodulePaths(cwd)).resolves.toEqual([
        // The returned paths are relative to CWD,
        // Not sure if it's the best behavior.
        // But you'd rather call this with the superproject root as CWD anyway!
        '../../submodules/submodule1',
        '../../submodules/submodule2',
      ]);
    });

    it('returns [] for cwd=submodules/submodule1', async () => {
      const repo = await repoPromise;
      const cwd = path.join(
        repo.superproject.repoDir,
        'submodules',
        'submodule1',
      );
      await expect(getGitSubmodulePaths(cwd)).resolves.toEqual([]);
    });

    it('returns [] for cwd=submodules/submodule2/subDir', async () => {
      const repo = await repoPromise;
      const cwd = path.join(
        repo.superproject.repoDir,
        'submodules',
        'submodule2',
        'subDir',
      );
      await expect(getGitSubmodulePaths(cwd)).resolves.toEqual([]);
    });

    it('rejects for cwd=doesNotExist', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'doesNotExist');
      await expect(getGitSubmodulePaths(cwd)).rejects.toThrow(
        /Couldn't read the list of git submodules/,
      );
    });

    it('rejects for cwd=notTracked', async () => {
      const cwd = await os.tmpdir();
      await expect(getGitSubmodulePaths(cwd)).rejects.toThrow(
        /Couldn't read the list of git submodules/,
      );
    });
  });

  describe('getGitAllRepoRoots', () => {
    it('returns root paths for cwd=superproject', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir);
      await expect(getGitAllRepoRoots(cwd)).resolves.toEqual([
        repo.superproject.repoDir,
        path.join(repo.superproject.repoDir, 'submodules', 'submodule1'),
        path.join(repo.superproject.repoDir, 'submodules', 'submodule2'),
      ]);
    });

    it('returns root paths for cwd=superproject/website/docs', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'website', 'docs');
      await expect(getGitAllRepoRoots(cwd)).resolves.toEqual([
        repo.superproject.repoDir,
        path.join(repo.superproject.repoDir, 'submodules', 'submodule1'),
        path.join(repo.superproject.repoDir, 'submodules', 'submodule2'),
      ]);
    });

    it('returns root paths for cwd=superproject/submodules', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'submodules');
      await expect(getGitAllRepoRoots(cwd)).resolves.toEqual([
        repo.superproject.repoDir,
        path.join(repo.superproject.repoDir, 'submodules', 'submodule1'),
        path.join(repo.superproject.repoDir, 'submodules', 'submodule2'),
      ]);
    });

    it('returns root paths for cwd=superproject/submodules/submodule1', async () => {
      const repo = await repoPromise;
      const cwd = path.join(
        repo.superproject.repoDir,
        'submodules',
        'submodule1',
      );
      await expect(getGitAllRepoRoots(cwd)).resolves.toEqual([
        repo.superproject.repoDir,
        path.join(repo.superproject.repoDir, 'submodules', 'submodule1'),
        path.join(repo.superproject.repoDir, 'submodules', 'submodule2'),
      ]);
    });

    it('returns root paths for cwd=superproject/submodules/submodule2/subDir', async () => {
      const repo = await repoPromise;
      const cwd = path.join(
        repo.superproject.repoDir,
        'submodules',
        'submodule2',
        'subDir',
      );
      await expect(getGitAllRepoRoots(cwd)).resolves.toEqual([
        repo.superproject.repoDir,
        path.join(repo.superproject.repoDir, 'submodules', 'submodule1'),
        path.join(repo.superproject.repoDir, 'submodules', 'submodule2'),
      ]);
    });

    it('rejects for cwd=doesNotExist', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir, 'doesNotExist');
      await expect(getGitAllRepoRoots(cwd)).rejects.toThrow(
        /Could not get all the git repository root paths/,
      );
    });

    it('rejects for cwd=notTracked', async () => {
      const cwd = await os.tmpdir();
      await expect(getGitAllRepoRoots(cwd)).rejects.toThrow(
        /Could not get all the git repository root paths/,
      );
    });
  });

  describe('getGitRepositoryFilesInfo', () => {
    it('for superproject', async () => {
      const repo = await repoPromise;
      const cwd = path.join(repo.superproject.repoDir);
      await expect(getGitRepositoryFilesInfo(cwd)).resolves
        .toMatchInlineSnapshot(`
        Map {
          "website/docs/myDoc.md" => {
            "creation": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
            "lastUpdate": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
          },
          "README.md" => {
            "creation": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
            "lastUpdate": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
          },
        }
      `);
    });

    it('for submodule1', async () => {
      const repo = await repoPromise;
      const cwd = path.join(
        repo.superproject.repoDir,
        'submodules',
        'submodule1',
      );
      await expect(getGitRepositoryFilesInfo(cwd)).resolves
        .toMatchInlineSnapshot(`
        Map {
          "file1.txt" => {
            "creation": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
            "lastUpdate": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
          },
        }
      `);
    });

    it('for submodule2', async () => {
      const repo = await repoPromise;
      const cwd = path.join(
        repo.superproject.repoDir,
        'submodules',
        'submodule2',
      );
      await expect(getGitRepositoryFilesInfo(cwd)).resolves
        .toMatchInlineSnapshot(`
        Map {
          "subDir/file2.txt" => {
            "creation": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
            "lastUpdate": {
              "author": "Seb",
              "timestamp": 1592524800000,
            },
          },
        }
      `);
    });
  });
});

describe('VSC strategies', () => {
  async function initTestRepo() {
    const superproject = await createGitRepoEmpty();
    await superproject.git.commitFile('rootFile.md');

    const submodule = await createGitRepoEmpty();
    await submodule.git.commitFile('submoduleFile.md');
    await submodule.git.commitFile('submoduleFile.md', {
      commitDate: '2020-06-20',
      fileContent: 'updated',
    });

    await superproject.git.defineSubmodules({
      'submodules/submodule': submodule.repoDir,
    });

    return {superproject, submodule};
  }

  // Create the repo only once for all tests => faster tests
  const repoPromise = initTestRepo();

  async function initVsc() {
    const repo = await repoPromise;
    const repoDir = repo.superproject.repoDir;
    const vcs = createVcsGitEagerConfig();
    // TODO awkward siteDir -> repoDir although it works
    vcs.initialize({siteDir: repoDir});
    return {vcs, repoDir};
  }

  describe('VSC Git Eager Strategy', () => {
    it('can read repo file info', async () => {
      const {vcs, repoDir} = await initVsc();

      const filepath = path.join(repoDir, 'rootFile.md');

      await expect(vcs.getFileLastUpdateInfo(filepath)).resolves.toEqual({
        author: 'Seb',
        timestamp: new Date('2020-06-19').getTime(),
      });
      await expect(vcs.getFileCreationInfo(filepath)).resolves.toEqual({
        author: 'Seb',
        timestamp: new Date('2020-06-19').getTime(),
      });
    });

    // see https://github.com/facebook/docusaurus/issues/12322
    it('can read repo file info from a relative path', async () => {
      const {vcs} = await initVsc();

      await expect(vcs.getFileLastUpdateInfo('rootFile.md')).resolves.toEqual({
        author: 'Seb',
        timestamp: new Date('2020-06-19').getTime(),
      });
      await expect(vcs.getFileCreationInfo('rootFile.md')).resolves.toEqual({
        author: 'Seb',
        timestamp: new Date('2020-06-19').getTime(),
      });
    });

    it('can read submodule file', async () => {
      const {vcs, repoDir} = await initVsc();

      const filepath = path.join(
        repoDir,
        'submodules/submodule/submoduleFile.md',
      );

      await expect(vcs.getFileLastUpdateInfo(filepath)).resolves.toEqual({
        author: 'Seb',
        timestamp: new Date('2020-06-20').getTime(),
      });
      await expect(vcs.getFileCreationInfo(filepath)).resolves.toEqual({
        author: 'Seb',
        timestamp: new Date('2020-06-19').getTime(),
      });
    });

    describe('when site is not using git', () => {
      async function initNonGitVsc() {
        const repoDir = await createTempDir();
        const vcs = createVcsGitEagerConfig();
        vcs.initialize({siteDir: repoDir});
        return {vcs, repoDir};
      }

      it('throws on read attempts', async () => {
        const {vcs, repoDir} = await initNonGitVsc();

        const filepath = path.join(repoDir, 'any.md');

        await expect(vcs.getFileLastUpdateInfo(filepath)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: This Docusaurus site is outside any Git worktree.
          Unable to read Git info for file "<TEMP_DIR>/git-test-repo<MKDTEMP_DIR_STABLE>/any.md" ]
        `);
      });
    });
  });
});
