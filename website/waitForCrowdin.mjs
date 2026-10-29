/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Translations} from '@crowdin/crowdin-api-client';

/*
Crowdin does not support concurrent "project builds" (downloads of
translations). The Crowdin CLI fails with error 409, and it leads to failures on
Netlify.

On Docusaurus, when we commit on main, we have 2 Netlify deployments triggered:
- prod
- i18n-staging (work-in-progress locales)

This script helps the 2 deployments to not download translations concurrently
from Crowdin.
 */

const pollInterval = 5000;
const timeout = 5 * 60 * 1000;

const projectId = 428890;
const token = process.env.CROWDIN_PERSONAL_TOKEN; // Set on Netlify

const translations = new Translations({token});

/**
 * @param {number} ms
 */
async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function hasBuildInProgress() {
  const projectBuilds = await translations.listProjectBuilds(projectId);
  return projectBuilds.data.some((build) => build.data.status === 'inProgress');
}

const timeBefore = Date.now();

while (true) {
  if (Date.now() - timeBefore > timeout) {
    console.warn(
      '[Crowdin] Timeout of wait script reached => will try to proceed but download translations is likely to fail...',
    );
    break;
  }

  const inProgress = await hasBuildInProgress();
  if (inProgress) {
    console.log('[Crowdin] A build is still in progress => waiting...');
    await delay(pollInterval);
  } else {
    console.warn("[Crowdin] No build in progress => let's continue");
    break;
  }
}
