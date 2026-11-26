/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const packageDir = path.dirname(import.meta.dirname);
const entryFile = path.join(packageDir, 'styles/infima.css');
const outputFile = path.join(packageDir, 'dist/infima.css');

// Matches the imports of the entry file, like @import url('common/base.css');
const ImportRegExp = /^@import url\('(?<importPath>.+)'\);$/gm;

// Only bundles the sources: the site bundler adds the vendor prefixes and the
// fallbacks for its target browsers, and minifies
async function main() {
  const css = await inlineImports(entryFile);
  await fs.mkdir(path.dirname(outputFile), {recursive: true});
  await fs.writeFile(outputFile, css);
}

async function inlineImports(file) {
  const css = await fs.readFile(file, 'utf8');
  const importedFiles = await readImportedFiles(file, css);
  return css.replace(ImportRegExp, (_match, importPath) =>
    importedFiles.get(importPath),
  );
}

async function readImportedFiles(file, css) {
  const importPaths = Array.from(
    css.matchAll(ImportRegExp),
    (match) => match.groups.importPath,
  );
  const entries = await Promise.all(
    importPaths.map(async (importPath) => {
      const importedFile = path.resolve(path.dirname(file), importPath);
      return [importPath, await fs.readFile(importedFile, 'utf8')];
    }),
  );
  return new Map(entries);
}

await main();
