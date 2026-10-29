/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {hash} from 'node:crypto';
import {fs, pathExists, outputFile} from '@docusaurus/fs';
import {findAsyncSequential} from './jsUtils';

const fileHash = new Map<string, string>();

const hashContent = (content: string): string => {
  return hash('md5', content);
};

/**
 * Outputs a file to the generated files directory. Only writes files if content
 * differs from cache (for hot reload performance).
 *
 * @param generatedFilesDir Absolute path.
 * @param file Path relative to `generatedFilesDir`. File will always be
 * outputted; no need to ensure directory exists.
 * @param content String content to write.
 * @param skipCache If `true` (defaults as `true` for production), file is
 * force-rewritten, skipping cache.
 */
export async function generate(
  generatedFilesDir: string,
  file: string,
  content: string,
  skipCache: boolean = process.env.NODE_ENV === 'production',
): Promise<void> {
  const filepath = path.resolve(generatedFilesDir, file);

  if (skipCache) {
    await outputFile(filepath, content);
    // Cache still needs to be reset, otherwise, writing "A", "B", and "A" where
    // "B" skips cache will cause the last "A" not be able to overwrite as the
    // first "A" remains in cache. But if the file never existed in cache, no
    // need to register it.
    if (fileHash.get(filepath)) {
      fileHash.set(filepath, hashContent(content));
    }
    return;
  }

  let lastHash = fileHash.get(filepath);

  // If file already exists but it's not in runtime cache yet, we try to
  // calculate the content hash and then compare. This is to avoid unnecessary
  // overwriting and we can reuse old file.
  if (!lastHash && (await pathExists(filepath))) {
    const lastContent = await fs.readFile(filepath, 'utf8');
    lastHash = hashContent(lastContent);
    fileHash.set(filepath, lastHash);
  }

  const currentHash = hashContent(content);

  if (lastHash !== currentHash) {
    await outputFile(filepath, content);
    fileHash.set(filepath, currentHash);
  }
}

/**
 * @param permalink The URL that the HTML file corresponds to, without base URL
 * @param outDir Full path to the output directory
 * @param trailingSlash The site config option. If provided, only one path will
 * be read.
 * @returns This returns a buffer, which you have to decode string yourself if
 * needed. (Not always necessary since the output isn't for human consumption
 * anyways, and most HTML manipulation libs accept buffers)
 * @throws Throws when the HTML file is not found at any of the potential paths.
 * This should never happen as it would lead to a 404.
 */
export async function readOutputHTMLFile(
  permalink: string,
  outDir: string,
  trailingSlash: boolean | undefined,
): Promise<Buffer> {
  const withTrailingSlashPath = path.join(outDir, permalink, 'index.html');
  const withoutTrailingSlashPath = (() => {
    const basePath = path.join(outDir, permalink.replace(/\/$/, ''));
    const htmlSuffix = /\.html?$/i.test(basePath) ? '' : '.html';
    return `${basePath}${htmlSuffix}`;
  })();

  const possibleHtmlPaths = [
    trailingSlash !== false && withTrailingSlashPath,
    trailingSlash !== true && withoutTrailingSlashPath,
  ].filter((p): p is string => Boolean(p));

  const HTMLPath = await findAsyncSequential(possibleHtmlPaths, pathExists);

  if (!HTMLPath) {
    throw new Error(
      `Expected output HTML file to be found at ${withTrailingSlashPath} for permalink ${permalink}.`,
    );
  }
  return fs.readFile(HTMLPath);
}
