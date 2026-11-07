/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {apps} from 'open';
import openBrowser from './openBrowser';

const {execMock, openMock} = vi.hoisted(() => {
  const execMock = vi.fn((...args: unknown[]) => {
    const command = args[0];
    const callback = args.at(-1);
    if (typeof command !== 'string' || typeof callback !== 'function') {
      throw new Error('exec mock expected a command and callback');
    }
    if (command.includes('ps cax')) {
      callback(null, {stdout: 'Google Chrome\n', stderr: ''});
      return;
    }
    if (command.includes('osascript')) {
      callback(null, {stdout: '', stderr: ''});
      return;
    }
    callback(new Error(`Unexpected command: ${command}`));
  });

  return {execMock, openMock: vi.fn()};
});

vi.mock('node:child_process', async () => {
  const actual =
    await vi.importActual<typeof import('node:child_process')>(
      'node:child_process',
    );
  return {
    ...actual,
    exec: execMock,
  };
});

vi.mock('open', async () => {
  const actual = await vi.importActual<typeof import('open')>('open');
  return {
    ...actual,
    default: openMock,
  };
});

const url = 'http://localhost:3000';
const originalPlatform = process.platform;
const originalBrowser = process.env.DOCUSAURUS_BROWSER;
const originalBrowserArgs = process.env.DOCUSAURUS_BROWSER_ARGS;

function setPlatform(platform: NodeJS.Platform) {
  Object.defineProperty(process, 'platform', {
    value: platform,
    configurable: true,
  });
}

function setEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe('openBrowser', () => {
  beforeEach(() => {
    execMock.mockClear();
    openMock.mockReset();
    openMock.mockResolvedValue(undefined);
    setPlatform('darwin');
    setEnv('DOCUSAURUS_BROWSER', undefined);
    setEnv('DOCUSAURUS_BROWSER_ARGS', undefined);
  });

  afterEach(() => {
    setPlatform(originalPlatform);
    setEnv('DOCUSAURUS_BROWSER', originalBrowser);
    setEnv('DOCUSAURUS_BROWSER_ARGS', originalBrowserArgs);
  });

  it('opens the system default browser on macOS when DOCUSAURUS_BROWSER is unset', async () => {
    await expect(openBrowser(url)).resolves.toBe(true);

    expect(execMock).not.toHaveBeenCalled();
    expect(openMock).toHaveBeenCalledWith(url, {
      app: undefined,
      wait: false,
    });
  });

  it('reuses an existing Chrome tab when DOCUSAURUS_BROWSER is google chrome', async () => {
    setEnv('DOCUSAURUS_BROWSER', 'google chrome');

    await expect(openBrowser(url)).resolves.toBe(true);

    expect(execMock).toHaveBeenCalledWith(
      expect.stringContaining('ps cax'),
      expect.any(Function),
    );
    expect(execMock).toHaveBeenCalledWith(
      `osascript openChrome.applescript "${url}" "Google Chrome"`,
      expect.objectContaining({cwd: expect.any(String)}),
      expect.any(Function),
    );
    expect(openMock).not.toHaveBeenCalled();
  });

  it('passes an explicit browser and its arguments to the opener', async () => {
    setEnv('DOCUSAURUS_BROWSER', 'firefox');
    setEnv('DOCUSAURUS_BROWSER_ARGS', '--private');

    await expect(openBrowser(url)).resolves.toBe(true);

    expect(execMock).not.toHaveBeenCalled();
    expect(openMock).toHaveBeenCalledWith(url, {
      app: {
        name: apps.firefox,
        arguments: ['--private'],
      },
      wait: false,
    });
  });

  it('returns false when the opener fails', async () => {
    openMock.mockRejectedValueOnce(new Error('failed to open'));

    await expect(openBrowser(url)).resolves.toBe(false);
    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it('bypasses AppleScript outside macOS', async () => {
    setPlatform('linux');
    setEnv('DOCUSAURUS_BROWSER', 'google chrome');

    await expect(openBrowser(url)).resolves.toBe(true);

    expect(execMock).not.toHaveBeenCalled();
    expect(openMock).toHaveBeenCalledWith(url, {
      app: {
        name: 'google chrome',
        arguments: [],
      },
      wait: false,
    });
  });
});
