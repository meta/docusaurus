/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {execa, type Result} from 'execa';
import {fs} from '@docusaurus/fs';
import {getGitRepoRoot, getGitSuperProjectRoot} from '../gitUtils';

// This file mocks execa and the filesystem, so it lives apart from the
// integration tests in gitUtils.test.ts (which run against real Git repos).
// Vitest scopes module mocks per file, so the two do not interfere.
vi.mock('execa', () => ({
  execa: vi.fn(),
  execaSync: vi.fn(() => ({exitCode: 0})),
}));

vi.mock('@docusaurus/fs', () => ({
  fs: {realpath: vi.fn(async (p: string) => p)},
  pathExists: vi.fn(),
}));

describe('Git root resolvers normalize Git Bash paths on Windows', () => {
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
  });

  it('getGitRepoRoot passes a normalized Windows path to fs.realpath', async () => {
    vi.mocked(execa).mockResolvedValue({
      stdout: '/c/Users/foo/project',
    } as unknown as Result);

    await getGitRepoRoot('/any/cwd');

    // fs.realpath would receive '/c/Users/foo/project' (and this would fail) if
    // normalizeGitPath were removed from the resolver.
    expect(fs.realpath).toHaveBeenCalledWith('C:\\Users\\foo\\project');
  });

  it('getGitSuperProjectRoot passes a normalized Windows path to fs.realpath', async () => {
    vi.mocked(execa).mockResolvedValue({
      stdout: '/d/work/super',
    } as unknown as Result);

    await getGitSuperProjectRoot('/any/cwd');

    expect(fs.realpath).toHaveBeenCalledWith('D:\\work\\super');
  });

  it('leaves POSIX Git paths unchanged on non-Windows platforms', async () => {
    // A `/c/project` path is a valid absolute path on Linux and must be passed
    // through untouched; this fails if the win32 guard is removed from
    // normalizeGitPath.
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    });
    vi.mocked(execa)
      .mockResolvedValueOnce({stdout: '/c/project'} as unknown as Result)
      .mockResolvedValueOnce({stdout: '/c/project'} as unknown as Result);

    await getGitRepoRoot('/any/cwd');
    await getGitSuperProjectRoot('/any/cwd');

    expect(fs.realpath).toHaveBeenNthCalledWith(1, '/c/project');
    expect(fs.realpath).toHaveBeenNthCalledWith(2, '/c/project');
  });
});
