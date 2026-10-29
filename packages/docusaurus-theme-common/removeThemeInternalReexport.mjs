/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs/promises';

// See comment in src/internal.ts
// This script should be run by CI tests to remove:
// export * from './index'

const filePath = 'lib/internal.js';
const lineToRemove = "export * from './index';\n";

await fs.access(filePath).catch((err) => {
  throw new Error(`internal entrypoint file not found at ${filePath}`, {
    cause: err,
  });
});

const fileContent = await fs.readFile(filePath, 'utf8');

const fileContentUpdated = fileContent.replaceAll(lineToRemove, '');

// Ensure the script correctly removes the re-export
if (fileContent === fileContentUpdated) {
  throw new Error(
    'Unexpected: internal re-export has not been replaced.\nMake sure this script works, and is only run once.',
  );
}

await fs.writeFile(filePath, fileContentUpdated);
