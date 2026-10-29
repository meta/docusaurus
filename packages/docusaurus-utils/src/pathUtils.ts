/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';

// Based on https://github.com/gatsbyjs/gatsby/pull/21518/files
// macOS (APFS) and Windows (NTFS) filename length limit = 255 chars,
// Others = 255 bytes
const MAX_PATH_SEGMENT_CHARS = 255;
const MAX_PATH_SEGMENT_BYTES = 255;
// Space for appending things to the string like file extensions and so on
const SPACE_FOR_APPENDING = 10;

const isMacOs = () => process.platform === 'darwin';
const isWindows = () => process.platform === 'win32';

export const isNameTooLong = (str: string): boolean =>
  // Not entirely correct: we can't assume FS from OS. But good enough?
  isMacOs() || isWindows()
    ? // Windows (NTFS) and macOS (APFS) filename length limit (255 chars)
      str.length + SPACE_FOR_APPENDING > MAX_PATH_SEGMENT_CHARS
    : // Other (255 bytes)
      Buffer.from(str).length + SPACE_FOR_APPENDING > MAX_PATH_SEGMENT_BYTES;

export function shortName(str: string): string {
  if (isMacOs() || isWindows()) {
    const overflowingChars = str.length - MAX_PATH_SEGMENT_CHARS;
    return str.slice(
      0,
      str.length - overflowingChars - SPACE_FOR_APPENDING - 1,
    );
  }
  const strBuffer = Buffer.from(str);
  const overflowingBytes =
    Buffer.byteLength(strBuffer) - MAX_PATH_SEGMENT_BYTES;
  return strBuffer
    .slice(
      0,
      Buffer.byteLength(strBuffer) - overflowingBytes - SPACE_FOR_APPENDING - 1,
    )
    .toString();
}

/**
 * Convert Windows backslash paths to posix style paths.
 * E.g: endi\lie -> endi/lie
 *
 * Returns original path if the posix counterpart is not valid Windows path.
 * This makes the legacy code that uses posixPath safe; but also makes it less
 * useful when you actually want a path with forward slashes (e.g. for URL)
 *
 * Adopted from https://github.com/sindresorhus/slash/blob/main/index.js
 */
export function posixPath(str: string): string {
  const isExtendedLengthPath = str.startsWith('\\\\?\\');

  if (isExtendedLengthPath) {
    return str;
  }
  return str.replace(/\\/g, '/');
}

/**
 * When you want to display a path in a message/warning/error, it's more
 * convenient to:
 *
 * - make it relative to `cwd()`
 * - convert to posix (ie not using windows \ path separator)
 *
 * This way, Jest tests can run more reliably on any computer/CI on both
 * Unix/Windows
 * For Windows users this is not perfect (as they see / instead of \) but it's
 * probably good enough
 */
export function toMessageRelativeFilePath(filePath: string): string {
  return posixPath(path.relative(process.cwd(), filePath));
}

/**
 * Alias filepath relative to site directory, very useful so that we
 * don't expose user's site structure.
 * Example: some/path/to/website/docs/foo.md -> @site/docs/foo.md
 */
export function aliasedSitePath(filePath: string, siteDir: string): string {
  const relativePath = posixPath(path.relative(siteDir, filePath));
  // Cannot use path.join() as it resolves '../' and removes
  // the '@site'. Let webpack loader resolve it.
  return `@site/${relativePath}`;
}

/**
 * Converts back the aliased site path (starting with "@site/...") to a relative path
 *
 * TODO method this is a workaround, we shouldn't need to alias/un-alias paths
 *  we should refactor the codebase to not have aliased site paths everywhere
 *  We probably only need aliasing for client-only paths required by Webpack
 */
export function aliasedSitePathToRelativePath(filePath: string): string {
  if (filePath.startsWith('@site/')) {
    return filePath.replace('@site/', '');
  }
  throw new Error(`Unexpected, filePath is not site-aliased: ${filePath}`);
}

/**
 * When you have a path like C:\X\Y
 * It is not safe to use directly when generating code
 * For example, this would fail due to unescaped \:
 * `<img src={require("${filePath}")} />`
 * But this would work: `<img src={require("${escapePath(filePath)}")} />`
 *
 * posixPath can't be used in all cases, because forward slashes are only valid
 * Windows paths when they don't contain non-ascii characters, and posixPath
 * doesn't escape those that fail to be converted.
 *
 * This function escapes double quotes but not single quotes (because it uses
 * `JSON.stringify`). Therefore, you must put the escaped path inside double
 * quotes when generating code.
 */
export function escapePath(str: string): string {
  const escaped = JSON.stringify(str);

  // Remove the " around the json string;
  return escaped.substring(1, escaped.length - 1);
}

export function addTrailingPathSeparator(str: string): string {
  return str.endsWith(path.sep)
    ? str
    : // If this is Windows, we need to change the forward slash to backward
      `${str.replace(/[\\/]$/, '')}${path.sep}`;
}
