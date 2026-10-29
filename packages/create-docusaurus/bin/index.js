#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-check

import path from 'node:path';
import {inspect} from 'node:util';
import {createRequire} from 'node:module';
import {logger} from '@docusaurus/logger';
import semver from 'semver';
import {program} from 'commander';

const packageJson = /** @type {typeof import("../package.json")} */ (
  createRequire(import.meta.url)('../package.json')
);
const requiredVersion = packageJson.engines.node;

if (!semver.satisfies(process.version, requiredVersion)) {
  logger.error('Minimum Node.js version not met :(');
  logger.info`You are using Node.js number=${process.version}, Requirement: Node.js number=${requiredVersion}.`;
  process.exit(1);
}

program.version(packageJson.version);

program
  .arguments('[siteName] [template] [rootDir]')
  .option(
    '-p, --package-manager <manager>',
    'The package manager used to install dependencies. One of yarn, npm, pnpm, and bun.',
  )
  .option(
    '-s, --skip-install',
    'Do not run package manager immediately after scaffolding',
  )
  .option('-t, --typescript', 'Use the TypeScript template variant')
  .option('-j, --javascript', 'Use the JavaScript template variant')
  .option(
    '-g, --git-strategy <strategy>',
    `Only used if the template is a git repository.
\`deep\`: preserve full history
\`shallow\`: clone with --depth=1
\`copy\`: do a shallow clone, but do not create a git repo
\`custom\`: enter your custom git clone command. We will prompt you for it.`,
  )
  .description('Initialize website.')
  .action((siteName, template, rootDir, options) =>
    // See https://github.com/facebook/docusaurus/pull/6860
    import('../lib/index.js').then(({default: init}) =>
      init(path.resolve(rootDir ?? '.'), siteName, template, options),
    ),
  );

program.parse(process.argv);

if (!process.argv.slice(1).length) {
  program.outputHelp();
}

process.on('unhandledRejection', (error) => {
  logger.error(inspect(error));
  process.exit(1);
});
