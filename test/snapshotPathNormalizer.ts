/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Forked from https://github.com/tribou/jest-serializer-path/blob/master/lib/index.js
// Added some project-specific handlers

import type {SnapshotSerializer} from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import {stripVTControlCharacters} from 'node:util';
import _ from 'lodash';
import {version} from '../packages/docusaurus/package.json';
import {posixPath} from '../packages/docusaurus-utils/src';

/*
This weird thing is to normalize paths on our Windows GitHub Actions runners

For some reason, os.tmpdir() returns the "legacy 8.3 DOS short paths"
This prevents snapshot normalization on Windows

      tempDir: 'C:\\Users\\RUNNER~1\\AppData\\Local\\Temp',
      tempDirReal: 'C:\\Users\\RUNNER~1\\AppData\\Local\\Temp',
      homeDir: 'C:\\Users\\runneradmin',
      homeDirReal: 'C:\\Users\\runneradmin',
 */
function normalizeWindowTempDirShortPath(str: string): string {
  return str.replace('\\RUNNER~1\\', '\\runneradmin\\');
}

function escapePath(str: string): string {
  const escaped = JSON.stringify(str);
  // Remove the " around the json string;
  return escaped.substring(1, escaped.length - 1);
}

function readPathsForNormalization() {
  const cwd = process.cwd();
  const cwdEscaped = escapePath(cwd);

  const tempDir = os.tmpdir();
  const homeDir = os.homedir();

  // Can we get rid of this legacy sync FS function?
  function getRealPathSync(pathname: string): string {
    try {
      // eslint-disable-next-line no-restricted-properties
      return fs.realpathSync(pathname);
    } catch {
      return pathname;
    }
  }

  const tempDirReal = getRealPathSync(tempDir);
  const homeDirReal = getRealPathSync(homeDir);

  return {
    cwd,
    cwdEscaped,
    tempDir: normalizeWindowTempDirShortPath(tempDir),
    tempDirReal: normalizeWindowTempDirShortPath(tempDirReal),
    homeDir,
    homeDirReal,
  };
}

// We memoize it to avoid useless FS calls on each path normalization
const getPathsForNormalization: typeof readPathsForNormalization = _.memoize(
  readPathsForNormalization,
);

/**
 * Normalize paths across platforms.
 * Filters must be ran on all platforms to guard against false positives
 */
function normalizeString(value: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Value is not a string: ${typeof value} ${value}`);
  }

  const {cwd, cwdEscaped, tempDir, tempDirReal, homeDir, homeDirReal} =
    getPathsForNormalization();

  const homeRelativeToTemp = path.relative(tempDir, homeDir);

  const runner: ((val: string) => string)[] = [
    (val) => (val.includes('keepAnsi') ? val : stripVTControlCharacters(val)),
    // Replace process.cwd with <PROJECT_ROOT>
    (val) => val.split(cwd).join('<PROJECT_ROOT>'),
    (val) => val.split(posixPath(cwd)).join('<PROJECT_ROOT>'),
    // In case the CWD is escaped
    (val) => val.split(cwdEscaped).join('<PROJECT_ROOT>'),

    // Replace temp directory with <TEMP_DIR>
    (val) => val.split(tempDirReal).join('<TEMP_DIR>'),
    (val) => val.split(tempDir).join('<TEMP_DIR>'),

    (val) => val.split(tempDirReal).join('<TEMP_DIR>'),
    (val) => val.split(tempDir).join('<TEMP_DIR>'),

    // Replace home directory with <HOME_DIR>
    (val) => val.split(homeDirReal).join('<HOME_DIR>'),
    (val) => val.split(homeDir).join('<HOME_DIR>'),

    // Handle HOME_DIR nested inside TEMP_DIR
    // This happens on windows GitHub actions runners
    // tempDir: 'C:\\Users\\RUNNER~1\\AppData\\Local\\Temp',
    // homeDir: 'C:\\Users\\runneradmin',
    (val) =>
      val
        .split(`<TEMP_DIR>${path.sep + homeRelativeToTemp}`)
        .join('<HOME_DIR>'),

    // replace /prefix___MKDTEMP_DIR___ABC123 with /prefix<MKDTEMP_DIR_STABLE>
    // The random 6-char suffix of mkdtemp() is removed to make snapshots stable
    (val) => {
      const [before, after] = val.split('___MKDTEMP_DIR___');
      if (after) {
        const afterSub = after.substring(6);
        return [before, afterSub].join('<MKDTEMP_DIR_STABLE>');
      }
      return before;
    },

    // Replace the Docusaurus version with a stub
    (val) => val.split(version).join('<CURRENT_VERSION>'),

    // Remove win32 drive letters, C:\ -> \
    (val) => val.replace(/[a-z]:\\/gi, '\\'),

    // Remove duplicate backslashes created from escapePath
    (val) => val.replace(/\\\\/g, '\\'),

    // Convert win32 backslash's to forward slashes, \ -> /;
    // ignore some that look like escape sequences.
    (val) => val.replace(/\\(?!")/g, '/'),

    // Strip the pnpm virtual store dir (isolated nodeLinker)
    // node_modules/.pnpm/react@19.3.0/node_modules/react -> node_modules/react
    (val) =>
      val.replace(
        /node_modules\/\.pnpm\/[^/]+\/node_modules\//g,
        'node_modules/',
      ),
  ];

  let result = value as string;
  runner.forEach((current) => {
    result = current(result);
  });

  return result;
}

function normalizeObject(val: object): object {
  const normalizedValue = _.cloneDeep(val) as {[key: string]: unknown};
  Object.keys(normalizedValue).forEach((key) => {
    if (typeof normalizedValue[key] === 'string') {
      normalizedValue[key] = normalizeValue(normalizedValue[key]);
    }
  });
  return normalizedValue;
}

function normalizeError(error: Error): Error {
  const message = normalizeString(error.message);

  const newError = new Error(message, {
    cause:
      error.cause instanceof Error ? normalizeError(error.cause) : error.cause,
  });
  Object.setPrototypeOf(newError, Object.getPrototypeOf(error));

  const allKeys = [
    ...Object.getOwnPropertyNames(error),
    ...Object.keys(error),
  ] as (keyof Error)[];
  allKeys.forEach((key) => {
    if (typeof error[key] === 'string') {
      newError[key] = normalizeString(error[key]) as never;
    }
  });
  return newError;
}

function normalizeValue(val: unknown): unknown {
  // Normalize Error + Error.cause
  if (val instanceof Error) {
    return normalizeError(val);
  }
  // Normalize JS objects
  else if (val && typeof val === 'object') {
    return normalizeObject(val);
  }
  // Normalize strings
  else if (typeof val === 'string') {
    return normalizeString(val);
  }
  return val;
}

function shouldNormalize(value: unknown) {
  return (
    shouldNormalizeString(value) ||
    shouldNormalizeObject(value) ||
    shouldNormalizeError(value)
  );

  function shouldNormalizeString(v: unknown) {
    if (typeof v === 'string') {
      return normalizeString(v) !== v;
    }
    return false;
  }

  function shouldNormalizeObject(v: unknown) {
    if (v && typeof v === 'object') {
      return Object.keys(v).some((key) =>
        shouldNormalizeString((v as {[key: string]: unknown})[key]),
      );
    }
    return false;
  }

  function shouldNormalizeError(v: unknown): boolean {
    if (v && v instanceof Error) {
      return shouldNormalizeString(v.message) || shouldNormalizeError(v.cause);
    }
    return false;
  }
}

const snapshotSerializer: SnapshotSerializer = {
  serialize(value: unknown, ...rest): string {
    const normalizedValue = normalizeValue(value);
    const printer = rest[4];
    return printer(normalizedValue, rest[0], rest[1], rest[2], rest[3]);
  },

  test: (value: unknown): boolean => {
    // TODO this is not ideal and not very performant
    // see https://github.com/vitest-dev/vitest/issues/10349
    return shouldNormalize(value);
  },
};

export default snapshotSerializer;
