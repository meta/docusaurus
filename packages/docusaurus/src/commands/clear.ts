/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import logger from '@docusaurus/logger';
import {
  DEFAULT_BUILD_DIR_NAME,
  GENERATED_FILES_DIR_NAME,
} from '@docusaurus/utils';
import {pathExists, realpath} from '@docusaurus/fs';
import clearPath from './utils/clearPath';

async function removePath(entry: {path: string; description: string}) {
  if (!(await pathExists(entry.path))) {
    return;
  }
  try {
    await clearPath(entry.path);
    logger.success`Removed the ${entry.description} at path=${path.relative(
      process.cwd(),
      entry.path,
    )}.`;
  } catch (err) {
    logger.error`Could not remove the ${entry.description} at path=${entry.path}.`;
    logger.error(err);
  }
}

export async function clear(siteDirParam: string = '.'): Promise<void> {
  const siteDir = await realpath(siteDirParam);

  const generatedFolder = {
    path: path.join(siteDir, GENERATED_FILES_DIR_NAME),
    description: 'generated folder',
  };
  const buildFolder = {
    path: path.join(siteDir, DEFAULT_BUILD_DIR_NAME),
    description: 'build output folder',
  };
  // In Yarn PnP, cache is stored in `.yarn/.cache` because n_m doesn't exist
  const cacheFolders = ['node_modules', '.yarn'].map((p) => ({
    path: path.join(siteDir, p, '.cache'),
    description: 'bundler persistent cache folder',
  }));
  await Promise.all(
    [generatedFolder, buildFolder, ...cacheFolders].map(removePath),
  );
}
