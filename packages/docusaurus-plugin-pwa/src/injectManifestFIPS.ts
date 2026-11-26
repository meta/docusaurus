/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getHashes} from 'node:crypto';
import path from 'node:path';
import {injectManifest} from 'workbox-build';
// Internal Workbox APIs, to apply the user options the same way Workbox does
import {transformManifest} from 'workbox-build/build/lib/transform-manifest';
import {validateInjectManifestOptions} from 'workbox-build/build/lib/validate-options';
import {fs} from '@docusaurus/fs';
import {glob} from '@docusaurus/glob';
import logger from '@docusaurus/logger';
import {hashString, posixPath} from '@docusaurus/utils';
import type {FileDetails, InjectManifestOptions} from 'workbox-build';

/** FIPS mode rejects MD5 */
export function isMD5Available(): boolean {
  return getHashes().includes('md5');
}

/**
 * Same as Workbox `injectManifest()`, but falls back to SHA-256 to hash the
 * files when MD5 is not available. Workbox hardcodes MD5, which FIPS mode
 * rejects. Only use it when MD5 is not available, to keep the Workbox code
 * path everywhere else.
 *
 * TODO temporary workaround: remove once Workbox supports FIPS mode
 *  See https://github.com/GoogleChrome/workbox/issues/3366
 */
export async function injectManifestFIPS(
  config: InjectManifestOptions,
): Promise<void> {
  const options = validateInjectManifestOptions(config);

  // Options our file hashing doesn't support: Workbox (and MD5) handles them
  if (options.templatedURLs || !options.globFollow) {
    await injectManifest(config);
    return;
  }

  const files = await globFilesToPrecache(options);
  const fileDetails = await getFileDetails(files, options.globDirectory);
  const {manifestEntries} = await transformManifest({...options, fileDetails});

  await injectManifest({
    swSrc: options.swSrc,
    swDest: options.swDest,
    globDirectory: options.globDirectory,
    injectionPoint: options.injectionPoint,
    globPatterns: [],
    additionalManifestEntries: manifestEntries,
  });
}

async function globFilesToPrecache({
  globDirectory,
  globPatterns = [],
  globIgnores = [],
  swSrc,
  swDest,
}: InjectManifestOptions): Promise<string[]> {
  // Like Workbox, never precache the service worker itself
  const swFiles = [swSrc, swDest].map((file) =>
    posixPath(path.relative(globDirectory, file)),
  );
  const files = await glob(globPatterns, {
    cwd: globDirectory,
    ignore: [...globIgnores, ...swFiles],
    // Like Workbox, don't precache all the files of a next.js/ directory
    expandDirectories: false,
  });
  // Sorted for a deterministic sw.js output
  return files.toSorted();
}

async function getFileDetails(
  files: string[],
  globDirectory: string,
): Promise<FileDetails[]> {
  return Promise.all(
    files.map((file) => getSingleFileDetails(file, globDirectory)),
  );
}

async function getSingleFileDetails(
  file: string,
  globDirectory: string,
): Promise<FileDetails> {
  const filePath = path.join(globDirectory, file);
  try {
    const content = await fs.readFile(filePath);
    return {file, hash: hashString(content), size: content.length};
  } catch (err) {
    throw new Error(
      logger.interpolate`Can't hash the file to precache at path=${path.relative(process.cwd(), filePath)}`,
      {cause: err},
    );
  }
}
