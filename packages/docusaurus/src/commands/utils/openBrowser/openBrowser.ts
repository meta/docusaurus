/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This code was initially in CRA/react-dev-utils (deprecated in 2025)
// We copied and refactored it
// See https://github.com/facebook/docusaurus/pull/10956
// See https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/openBrowser.js

/* eslint-disable */

import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import open, {openApp, apps, App, AppName} from 'open';
import {PerfLogger} from '@docusaurus/logger';

const execPromise = promisify(exec);

type BrowserName = string | undefined;
type BrowserArgs = string[];

type Params = {
  url: string;
  browser: BrowserName;
  browserArgs: BrowserArgs;
};

// Not sure if we need this, but let's keep a secret escape hatch
// CRA/react-dev-utils supported BROWSER/BROWSER_ARGS
const BrowserEnv: BrowserName = process.env.DOCUSAURUS_BROWSER;
const BrowserEnvArgs: string[] = process.env.DOCUSAURUS_BROWSER_ARGS
  ? process.env.DOCUSAURUS_BROWSER_ARGS.split(' ')
  : [];

// If we're on OS X, the user hasn't specifically
// requested a different browser, we can try opening
// Chrome with AppleScript. This lets us reuse an
// existing tab when possible instead of creating a new one.
// Copied from https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/openBrowser.js
async function tryOpenWithAppleScript({
  url,
  browser,
}: Params): Promise<boolean> {
  const shouldTryOpenChromiumWithAppleScript =
    process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === 'google chrome');

  if (!shouldTryOpenChromiumWithAppleScript) {
    return false;
  }

  if (shouldTryOpenChromiumWithAppleScript) {
    async function getBrowsersToTry(): Promise<string[]> {
      // Will use the first open browser found from list
      const supportedChromiumBrowsers = [
        'Google Chrome Canary',
        'Google Chrome Dev',
        'Google Chrome Beta',
        'Google Chrome',
        'Microsoft Edge',
        'Brave Browser',
        'Vivaldi',
        'Chromium',
        'Arc',
      ];

      // Among all the supported browsers, retrieves to stdout the active ones
      const command = `ps cax -o command | grep -E "^(${supportedChromiumBrowsers.join(
        '|',
      )})$"`;

      // Promise.try() also catches errors thrown synchronously
      // See https://github.com/facebook/docusaurus/issues/11204#issuecomment-3073480330
      const result = await Promise.try(() => execPromise(command)).catch(() => {
        // Ignore all errors
        // In particular grep errors when macOS user has no Chromium-based browser open
        // See https://github.com/facebook/docusaurus/issues/11204
      });
      if (!result) {
        return [];
      }

      const activeBrowsers = result.stdout.toString().trim().split('\n');

      // This preserves the initial browser order
      // We open Google Chrome Canary in priority over Google Chrome
      return supportedChromiumBrowsers.filter((b) =>
        activeBrowsers.includes(b),
      );
    }

    // Test this manually with:
    // osascript ./packages/docusaurus/src/commands/utils/openBrowser/openChrome.applescript "http://localhost:8080" "Google Chrome"
    // osascript ./packages/docusaurus/src/commands/utils/openBrowser/openChrome.applescript "http://localhost:8080" "Arc"
    async function tryBrowser(browserName: string): Promise<boolean> {
      try {
        // This command runs the openChrome.applescript (copied from CRA)
        const command = `osascript openChrome.applescript "${encodeURI(
          url,
        )}" "${browserName}"`;
        await execPromise(command, {
          cwd: __dirname,
        });
        return true;
      } catch (err) {
        console.error(
          `Failed to open browser ${browserName} with AppleScript`,
          err,
        );
        return false;
      }
    }

    const browsers = await PerfLogger.async('getBrowsersToTry', () =>
      getBrowsersToTry(),
    );
    for (let browser of browsers) {
      const success = await PerfLogger.async(browser, () =>
        tryBrowser(browser),
      );
      if (success) {
        return true;
      }
    }
  }

  return false;
}

function toOpenApp(params: Params): App | undefined {
  if (!params.browser) {
    return undefined;
  }
  // Handles "cross-platform" shortcuts like "chrome", "firefox", "edge"
  if (apps[params.browser as AppName]) {
    return {
      name: apps[params.browser as AppName],
      arguments: params.browserArgs,
    };
  }
  // Fallback to platform-specific app name
  return {
    name: params.browser,
    arguments: params.browserArgs,
  };
}

async function startBrowserProcess(params: Params): Promise<boolean> {
  if (
    await PerfLogger.async('tryOpenWithAppleScript', () =>
      tryOpenWithAppleScript(params),
    )
  ) {
    return true;
  }
  try {
    await open(params.url, {
      app: toOpenApp(params),
      wait: false,
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Returns true if it opened a browser
 */
export default async function openBrowser(url: string): Promise<boolean> {
  return startBrowserProcess({
    url,
    browser: BrowserEnv,
    browserArgs: BrowserEnvArgs,
  });
}
