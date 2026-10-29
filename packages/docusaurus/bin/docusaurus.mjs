#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-check

import {inspect} from 'node:util';
import {logger} from '@docusaurus/logger';
import {DOCUSAURUS_VERSION} from '@docusaurus/utils';
import {runCLI} from '../lib/index.js';
import beforeCli from './beforeCli.mjs';

// Env variables are initialized to dev, but can be overridden by each command
// For example, "docusaurus build" overrides them to "production"
// See also https://github.com/facebook/docusaurus/issues/8599
process.env.BABEL_ENV ??= 'development';
process.env.NODE_ENV ??= 'development';

/**
 * @param {unknown} error
 */
function handleError(error) {
  console.log('');

  // We need to use inspect with increased depth to log the full causal chain
  // By default Node logging has depth=2
  // see also https://github.com/nodejs/node/issues/51637
  logger.error(inspect(error, {depth: Infinity}));

  logger.info`Docusaurus version: number=${DOCUSAURUS_VERSION}
Node version: number=${process.version}`;
  process.exit(1);
}

process.on('unhandledRejection', handleError);

try {
  await beforeCli();
  // @ts-expect-error: we know it has at least 2 args
  await runCLI(process.argv);
} catch (e) {
  handleError(e);
}
