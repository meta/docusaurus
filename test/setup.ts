/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

// Only created to fix test: website/src/data/__tests__/user.test.ts
for (const ext of ['.png']) {
  require.extensions[ext] = (module: any, _filename: string) => {
    module.exports = null;
  };
}
