/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {compile} from '../compiler';
import {getCurrentBundler} from '../currentBundler';
import {getMinimizers} from '../minification';
import type {Configuration} from 'webpack';
import type {CurrentBundler} from '@docusaurus/types';

// Files imported with {type: 'text'}: they must remain the raw file content
const TextImportFiles = {
  'text.js': '// Text import\nconst   jsText   =   1;\n',
  'text.css': '/* Text import */\n.textCss   {   color:   red;   }\n',
};

const ProjectFiles = {
  ...TextImportFiles,
  'index.js': `
import jsText from './text.js' with {type: 'text'};
import cssText from './text.css' with {type: 'text'};

export default function getTexts() {
  const unminifiedVariableName = [jsText, cssText];
  return [...unminifiedVariableName, new URL('./style.css', import.meta.url)];
}
`,
  // Emitted as a CSS asset, through new URL()
  'style.css': '/* Comment */\n.style {\n  color: #ff0000;\n}\n',
};

async function createTmpDir() {
  return fs.mkdtempDisposable(
    path.join(await fs.realpath(tmpdir()), 'docusaurus-minification-'),
  );
}

async function writeProjectFiles(dir: string) {
  for (const [fileName, content] of Object.entries(ProjectFiles)) {
    await fs.writeFile(path.join(dir, fileName), content);
  }
}

async function createConfig({
  dir,
  currentBundler,
}: {
  dir: string;
  currentBundler: CurrentBundler;
}): Promise<Configuration> {
  return {
    mode: 'production',
    context: dir,
    entry: './index.js',
    output: {
      path: path.join(dir, 'build'),
      filename: '[name].js',
      assetModuleFilename: '[name][ext]',
      // Keeps the entry exports, otherwise all the code is removed
      library: {type: 'commonjs2'},
    },
    optimization: {minimizer: await getMinimizers({currentBundler})},
  };
}

// Builds the project with our minimizers, returns the emitted JS and CSS
async function buildProject(bundlerName: CurrentBundler['name']) {
  await using dir = await createTmpDir();
  await writeProjectFiles(dir.path);
  const currentBundler = await getCurrentBundler({
    siteConfig: {webpack: bundlerName === 'webpack' ? {} : undefined},
  });
  const config = await createConfig({dir: dir.path, currentBundler});
  const stats = await compile({configs: [config], currentBundler});
  expect(stats.hasWarnings()).toBe(false);
  return {
    js: await fs.readFile(path.join(dir.path, 'build/main.js'), 'utf8'),
    css: await fs.readFile(path.join(dir.path, 'build/style.css'), 'utf8'),
  };
}

describe.each(['webpack', 'rspack'] as const)('%s minimizers', (name) => {
  it('minify JS and CSS assets', async () => {
    const {js, css} = await buildProject(name);
    expect(js).not.toContain('unminifiedVariableName');
    expect(css).toBe('.style{color:red}');
  });

  it('do not minify text imports', async () => {
    const {js} = await buildProject(name);
    // Text imports are embedded in JS as string literals
    expect(js).toContain(JSON.stringify(TextImportFiles['text.js']));
    expect(js).toContain(JSON.stringify(TextImportFiles['text.css']));
  });
});
