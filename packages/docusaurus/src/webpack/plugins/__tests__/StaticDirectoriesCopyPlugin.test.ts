/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it} from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import {getCurrentBundler} from '@docusaurus/bundler';
import {outputFile} from '@docusaurus/fs';
import {createStaticDirectoriesCopyPlugin} from '../StaticDirectoriesCopyPlugin';
import type webpack from 'webpack';
import type {CurrentBundler, Props} from '@docusaurus/types';

const tempDirs: string[] = [];

async function createProps(bundlerName: CurrentBundler['name']) {
  const siteDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docusaurus-copy-'));
  tempDirs.push(siteDir);
  const currentBundler = await getCurrentBundler({
    siteConfig: {webpack: bundlerName === 'webpack' ? {} : undefined},
  });
  return {
    siteDir,
    outDir: path.join(siteDir, 'build'),
    siteConfig: {staticDirectories: ['first', 'second', 'empty', 'missing']},
    currentBundler,
  } as Props;
}

describe.each(['webpack', 'rspack'] as const)(
  '%s static directories',
  (name) => {
    afterEach(async () => {
      await Promise.all(
        tempDirs
          .splice(0)
          .map((dir) => fs.rm(dir, {recursive: true, force: true})),
      );
    });

    it('copies nested files, dotfiles and unminified assets, keeping the first directory priority', async () => {
      const props = await createProps(name);
      const files = {
        'first/shared.txt': 'first',
        'second/shared.txt': 'second',
        'second/nested/file.txt': 'nested',
        'first/.nojekyll': '',
        'first/.well-known/test.txt': 'hidden directory',
        'first/static.js': '// Keep this comment\nconst value = 1 + 2;\n',
        'first/static.css': '/* Keep this comment */\n.foo { color: red; }\n',
      };
      await Promise.all(
        Object.entries(files).map(([file, contents]) =>
          outputFile(path.join(props.siteDir, file), contents),
        ),
      );
      await fs.mkdir(path.join(props.siteDir, 'empty'), {recursive: true});
      const plugin = await createStaticDirectoriesCopyPlugin({props});
      const compiler = props.currentBundler.instance({
        mode: 'production',
        context: props.siteDir,
        entry: {},
        output: {path: props.outDir},
        plugins: [plugin!],
      });
      let stats: webpack.Stats;
      try {
        stats = await new Promise((resolve, reject) => {
          compiler.run((error, result) =>
            error ? reject(error) : resolve(result!),
          );
        });
      } finally {
        await new Promise<void>((resolve, reject) => {
          compiler.close((error) => (error ? reject(error) : resolve()));
        });
      }
      expect(stats.hasErrors()).toBe(false);
      expect(stats.hasWarnings()).toBe(false);
      for (const [file, contents] of Object.entries(files)) {
        if (file === 'second/shared.txt') {
          continue;
        }
        const outputName = file.substring(file.indexOf('/') + 1);
        await expect(
          fs.readFile(path.join(props.outDir, outputName), 'utf8'),
        ).resolves.toBe(contents);
      }
      for (const file of ['static.js', 'static.css']) {
        expect(stats.compilation.getAsset(file)?.info.minimized).toBe(true);
      }
    });

    it('ignores empty and missing directories', async () => {
      const props = await createProps(name);
      await fs.mkdir(path.join(props.siteDir, 'empty'), {recursive: true});
      await expect(
        createStaticDirectoriesCopyPlugin({props}),
      ).resolves.toBeUndefined();
    });
  },
);
