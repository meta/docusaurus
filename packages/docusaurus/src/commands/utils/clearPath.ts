/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {PerfLogger} from '@docusaurus/logger';
import {fs} from '@docusaurus/fs';

/**
 * @param pathToClear
 */
export default async function clearPath(pathToClear: string): Promise<void> {
  return PerfLogger.async(
    `clearPath ${path.relative(process.cwd(), pathToClear)}`,
    async () => {
      await fs.rm(pathToClear, {recursive: true, force: true});
    },
  );
}
