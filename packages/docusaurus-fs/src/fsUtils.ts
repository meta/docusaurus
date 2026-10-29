/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Small helpers to replace fs-extra APIs, with the same semantics.

import fsCallback from 'node:fs';
import path from 'node:path';
import {promisify} from 'node:util';
import logger from '@docusaurus/logger';
import {fs} from './fs';

/**
 * Checks if a file or directory exists, without throwing.
 * Same semantics as fs-extra `pathExists()`.
 */
export async function pathExists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(
    () => true,
    () => false,
  );
}

/**
 * Writes a file, creating the parent directories if they don't exist yet.
 * Same semantics as fs-extra `outputFile()`.
 */
export async function outputFile(
  filePath: string,
  data: Parameters<typeof fs.writeFile>[1],
  options?: Parameters<typeof fs.writeFile>[2],
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, data, options);
}

// JSON.parse() rejects a leading UTF-8 BOM (U+FEFF) character, but some
// editors (such as Windows Notepad) add one when saving files
function stripUTF8BOM(content: string): string {
  return content.startsWith('\uFEFF') ? content.slice(1) : content;
}

/**
 * Reads and parses a JSON file, ignoring a leading UTF-8 BOM (like fs-extra
 * `readJSON()`).
 * @throws Throws an error mentioning the relative file path, with the read or
 * parse error as cause.
 */
export async function readJSON(filePath: string): Promise<unknown> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(stripUTF8BOM(content));
  } catch (err) {
    throw new Error(
      logger.interpolate`Failed to read JSON file at path=${path.relative(
        process.cwd(),
        filePath,
      )}`,
      {cause: err},
    );
  }
}

/**
 * Resolves a path to its canonical absolute path.
 * Same semantics as fs-extra `realpath()`, which uses the Node.js JavaScript
 * implementation `fs.realpath()`. In contrast, `fs/promises` `realpath()` uses
 * the native implementation, which may normalize path casing (macOS, Windows)
 * or resolve Windows subst/network drives differently from Node's module
 * resolution.
 */
export async function realpath(filePath: string): Promise<string> {
  return promisify(fsCallback.realpath)(filePath);
}
