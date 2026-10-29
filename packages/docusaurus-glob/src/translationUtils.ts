/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Awkward to have translation code in this package, but it is consumed by both
// @docusaurus/core and @docusaurus/theme-translations: this avoids duplication

import path from 'node:path';
import {safeGlob} from './globUtils';

export const isTranslatableSourceFile: (filePath: string) => boolean = (() => {
  // We only support extracting source code translations from these extensions
  const extensionsAllowed = new Set([
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    // TODO support md/mdx too? (may be overkill)
    // need to compile the MDX to JSX first and remove front matter
    // '.md',
    // '.mdx',
  ]);

  const isBlacklistedFilePath = (filePath: string) => {
    // We usually extract from ts files, unless they are .d.ts files
    return filePath.endsWith('.d.ts');
  };

  return (filePath): boolean => {
    const ext = path.extname(filePath);
    return extensionsAllowed.has(ext) && !isBlacklistedFilePath(filePath);
  };
})();

export async function globTranslatableSourceFiles(
  patterns: string[],
): Promise<string[]> {
  const filePaths = await safeGlob(patterns, {
    absolute: true,
  });
  return filePaths.filter(isTranslatableSourceFile);
}
