#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// TODO: temporary workaround, remove this script once oxfmt has a first-class
// way to format gitignored files, and call oxfmt directly instead:
//   oxfmt --no-ignore=vcs "lib/theme/**/*.js"
// Tracked in https://github.com/oxc-project/oxc/issues/25259
// Implemented by https://github.com/oxc-project/oxc/pull/25358 (not released)
//
// Formats gitignored build outputs, such as the lib/theme JS code that users
// eject with swizzle, or the website build used for Argos text snapshots.
// oxfmt skips gitignored files found through directory or glob targets, but
// still formats gitignored files passed explicitly, so we expand globs here.
// See https://github.com/oxc-project/oxc/pull/25531
//
// Usage: format-gitignored-files [--oxfmt-option=value] <glob>...

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const oxfmtBin = fileURLToPath(
  new URL('bin/oxfmt', import.meta.resolve('oxfmt/package.json')),
);

const args = process.argv.slice(2);
const options = args.filter((arg) => arg.startsWith('-'));
const patterns = args.filter((arg) => !arg.startsWith('-'));

const files = await Array.fromAsync(fs.promises.glob(patterns));
if (files.length === 0) {
  throw new Error(`No files matched ${patterns.join(', ')}`);
}

// Batches keep the command line under the Windows length limit
const batchSize = 100;
for (let i = 0; i < files.length; i += batchSize) {
  const batch = files.slice(i, i + batchSize);
  const {status} = spawnSync(
    process.execPath,
    [oxfmtBin, ...options, ...batch],
    {stdio: 'inherit'},
  );
  if (status !== 0) {
    process.exit(status ?? 1);
  }
}
