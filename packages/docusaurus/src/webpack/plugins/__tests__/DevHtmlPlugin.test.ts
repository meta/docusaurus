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
import DevHtmlPlugin, {DevHtmlFilename, getAssetUrls} from '../DevHtmlPlugin';
import {createStaticDirectoriesCopyPlugin} from '../StaticDirectoriesCopyPlugin';
import type webpack from 'webpack';
import type {CurrentBundler, Props} from '@docusaurus/types';

describe('getAssetUrls', () => {
  const files = ['runtime~main.js', 'main.js', 'styles.css', 'main.js.map'];

  it('prefixes assets with the baseUrl', () => {
    expect(getAssetUrls({files, publicPath: '/base/'})).toEqual({
      scripts: ['/base/runtime~main.js', '/base/main.js'],
      stylesheets: ['/base/styles.css'],
    });
  });

  it('adds missing trailing slash to publicPath', () => {
    expect(
      getAssetUrls({
        files: ['main.js'],
        publicPath: 'https://example.com/base',
      }),
    ).toEqual({scripts: ['https://example.com/base/main.js'], stylesheets: []});
  });

  it('uses relative urls for publicPath "auto"', () => {
    expect(getAssetUrls({files, publicPath: 'auto'})).toEqual({
      scripts: ['runtime~main.js', 'main.js'],
      stylesheets: ['styles.css'],
    });
  });

  it('dedupes and encodes files', () => {
    expect(
      getAssetUrls({
        files: ['a b/main.mjs?v=1', 'a b/main.mjs?v=1', 'x.css?v=2'],
        publicPath: '/',
      }),
    ).toEqual({scripts: ['/a%20b/main.mjs?v=1'], stylesheets: ['/x.css?v=2']});
  });
});

describe('DevHtmlPlugin', () => {
  it('defaults filename to DevHtmlFilename', () => {
    const plugin = new DevHtmlPlugin({
      render: () => '<html></html>',
    });
    expect(plugin.options.filename).toBe(DevHtmlFilename);
    expect(DevHtmlFilename).toBe('__docusaurus.html');
  });

  it('allows custom filename', () => {
    const plugin = new DevHtmlPlugin({
      filename: 'custom.html',
      render: () => '<html></html>',
    });
    expect(plugin.options.filename).toBe('custom.html');
  });
});

const tempDirs: string[] = [];

async function createProps(bundlerName: CurrentBundler['name']) {
  const siteDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'docusaurus-dev-html-'),
  );
  tempDirs.push(siteDir);
  const currentBundler = await getCurrentBundler({
    siteConfig: {webpack: bundlerName === 'webpack' ? {} : undefined},
  });
  return {
    siteDir,
    outDir: path.join(siteDir, 'build'),
    siteConfig: {staticDirectories: ['static']},
    currentBundler,
  } as Props;
}

describe.each(['webpack', 'rspack'] as const)(
  '%s dev html with static index.html',
  (name) => {
    afterEach(async () => {
      await Promise.all(
        tempDirs
          .splice(0)
          .map((dir) => fs.rm(dir, {recursive: true, force: true})),
      );
    });

    it('emits dev html without colliding with static/index.html', async () => {
      const props = await createProps(name);
      await outputFile(
        path.join(props.siteDir, 'static/index.html'),
        '<h1>Static Index</h1>',
      );
      const copyPlugin = await createStaticDirectoriesCopyPlugin({props});
      const devHtmlPlugin = new DevHtmlPlugin({
        render: () => '<html>Dev Shell</html>',
      });
      const compiler = props.currentBundler.instance({
        mode: 'development',
        context: props.siteDir,
        entry: {},
        output: {path: props.outDir},
        plugins: [copyPlugin!, devHtmlPlugin],
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
      await expect(
        fs.readFile(path.join(props.outDir, 'index.html'), 'utf8'),
      ).resolves.toBe('<h1>Static Index</h1>');
      await expect(
        fs.readFile(path.join(props.outDir, DevHtmlFilename), 'utf8'),
      ).resolves.toBe('<html>Dev Shell</html>');
    });
  },
);
