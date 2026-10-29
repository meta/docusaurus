#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import _ from 'lodash';

const srcDir = path.join(process.cwd(), 'src');
const libDir = path.join(process.cwd(), 'lib');

const ignoredPattern = /__tests__|\.tsx?$/;

async function copy() {
  await fs.promises.cp(srcDir, libDir, {
    recursive: true,
    filter(testedPath) {
      return !ignoredPattern.test(testedPath);
    },
  });
}

// Coalesce bursts of events (e.g. one file save) into a single copy
const copyDebounced = _.debounce(copy, 100);

if (process.argv.includes('--watch')) {
  fs.watch(srcDir, {recursive: true}, copyDebounced);
} else {
  await copy();
}
