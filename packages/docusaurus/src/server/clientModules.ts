/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import type {LoadedPlugin} from '@docusaurus/types';

/**
 * Runs the `getClientModules` lifecycle. The returned file paths are all
 * absolute.
 */
export function getAllClientModules(plugins: LoadedPlugin[]): string[] {
  return plugins.flatMap(
    (plugin) =>
      plugin.getClientModules?.().map((p) => path.resolve(plugin.path, p)) ??
      [],
  );
}
