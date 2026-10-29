/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {defineConfig, devices} from '@playwright/test';
import {createArgosReporterOptions} from '@argos-ci/playwright/reporter';

const argosOptions = createArgosReporterOptions({
  uploadToArgos: true, // for now, we always upload even outside of CI
  buildName: 'screenshots',
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  timeout: 60000,

  reporter: [['list'], ['@argos-ci/playwright/reporter', argosOptions]],

  // Run website production built
  // Need to run "pnpm build:website:fast" before
  webServer: {
    cwd: '..',
    port: 3000,
    command: 'pnpm serve:website',
  },

  // Browsers: only Chrome for now
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Recommended by Argos
        // See https://argos-ci.com/docs/learn/reliability-and-flakiness/flaky-tests/stabilize-text-rendering
        launchOptions: {
          args: ['--disable-lcd-text', '--font-render-hinting=none'],
        },
      },
    },
  ],
});
