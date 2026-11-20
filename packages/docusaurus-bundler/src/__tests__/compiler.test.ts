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
import {compile, formatStatsErrorMessage} from '../compiler';
import {getCurrentBundler} from '../currentBundler';

describe('formatStatsErrorMessage', () => {
  it('includes the source module and location', () => {
    const result = formatStatsErrorMessage({
      errors: [
        {
          moduleIdentifier: '/project/src/pages/thing.xyz',
          file: 'main.js',
          moduleName: './src/pages/thing.xyz',
          loc: '1:0',
          message: 'Module parse failed: Unexpected character',
        },
      ],
      warnings: [],
    });
    expect(result).toContain('./src/pages/thing.xyz:1:0');
    expect(result).toContain('Module parse failed: Unexpected character');
    expect(result).not.toContain('/project/');
    expect(result).not.toContain('main.js');
  });

  it('uses the file when no source module is provided', () => {
    expect(
      formatStatsErrorMessage({
        errors: [{file: 'styles.css', message: 'Invalid CSS'}],
        warnings: [],
      }),
    ).toContain('styles.css');
  });

  it('keeps errors without source metadata', () => {
    expect(
      formatStatsErrorMessage({
        errors: [{message: 'A plain error'}],
        warnings: [],
      }),
    ).toContain('A plain error');
  });

  it('keeps the source of each formatted error', () => {
    const result = formatStatsErrorMessage({
      errors: [
        {moduleName: './first.js', message: 'First error'},
        {moduleName: './second.js', message: 'Second error'},
      ],
      warnings: [],
    });
    expect(result).toContain('./first.js');
    expect(result).toContain('First error');
    expect(result).toContain('./second.js');
    expect(result).toContain('Second error');
    expect(result).toContain('--------------------------');
  });

  it('keeps the matching source when syntax errors filter other errors', () => {
    const result = formatStatsErrorMessage({
      errors: [
        {moduleName: './other.js', message: 'Another error'},
        {moduleName: './broken.js', message: 'Syntax error: Invalid token'},
      ],
      warnings: [],
    });
    expect(result).toContain('./broken.js');
    expect(result).toContain('Syntax error: Invalid token');
    expect(result).not.toContain('./other.js');
    expect(result).not.toContain('Another error');
  });

  it('preserves module-resolution details when adding the source', () => {
    const result = formatStatsErrorMessage({
      errors: [
        {
          moduleName: './src/index.js',
          loc: '1:0-24',
          message: [
            "Module not found: Error: Can't resolve 'buffer'",
            'BREAKING CHANGE: webpack < 5 included polyfills by default.',
            'Configure resolve.fallback to provide a polyfill.',
          ].join('\n'),
        },
      ],
      warnings: [],
    });
    expect(result).toContain('./src/index.js:1:0-24');
    expect(result).toContain("Can't resolve 'buffer'");
    expect(result).toContain('BREAKING CHANGE:');
    expect(result).toContain('Configure resolve.fallback');
  });

  it('preserves Sass installation guidance when adding the source', () => {
    const result = formatStatsErrorMessage({
      errors: [
        {
          moduleName: './src/styles.scss',
          message:
            "./src/styles.scss\nCannot find module 'sass'\nRequire stack:",
        },
      ],
      warnings: [],
    });
    expect(result).toContain('./src/styles.scss');
    expect(result).toContain(
      'To import Sass files, you first need to install sass.',
    );
    expect(result).toContain('npm install sass');
  });

  it('returns undefined when there are no errors', () => {
    expect(formatStatsErrorMessage(undefined)).toBeUndefined();
    expect(formatStatsErrorMessage({errors: [], warnings: []})).toBeUndefined();
  });
});

describe.each(['webpack', 'rspack'] as const)(
  '%s error diagnostics',
  (name) => {
    it('preserves real module-resolution diagnostics', async () => {
      await using dir = await fs.mkdtempDisposable(
        path.join(await fs.realpath(tmpdir()), 'docusaurus-compiler-'),
      );
      await fs.mkdir(path.join(dir.path, 'src'));
      await fs.writeFile(
        path.join(dir.path, 'src/index.js'),
        "import 'buffer';",
      );
      const currentBundler = await getCurrentBundler({
        siteConfig: {webpack: name === 'webpack' ? {} : undefined},
      });
      const compilation = compile({
        currentBundler,
        configs: [
          {
            mode: 'development',
            context: dir.path,
            entry: './src/index.js',
            output: {path: path.join(dir.path, 'build')},
          },
        ],
      });
      await expect(compilation).rejects.toThrow('./src/index.js');
      await expect(compilation).rejects.toThrow(
        name === 'webpack' ? 'resolve.fallback' : "Can't resolve 'buffer'",
      );
    });

    it('identifies the source of a real module parse failure', async () => {
      await using dir = await fs.mkdtempDisposable(
        path.join(await fs.realpath(tmpdir()), 'docusaurus-compiler-'),
      );
      await fs.mkdir(path.join(dir.path, 'src'));
      await fs.writeFile(
        path.join(dir.path, 'src/index.js'),
        "import './thing.xyz';",
      );
      await fs.writeFile(path.join(dir.path, 'src/thing.xyz'), '🔥 invalid');
      const currentBundler = await getCurrentBundler({
        siteConfig: {webpack: name === 'webpack' ? {} : undefined},
      });
      await expect(
        compile({
          currentBundler,
          configs: [
            {
              mode: 'development',
              context: dir.path,
              entry: './src/index.js',
              output: {path: path.join(dir.path, 'build')},
            },
          ],
        }),
      ).rejects.toThrow('./src/thing.xyz');
    });
  },
);
