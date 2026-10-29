/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {posixPath} from '@docusaurus/utils';
import {getPluginPathsToWatch} from '../watcher';
import type {LoadedPlugin} from '@docusaurus/types';

describe('getPluginPathsToWatch', () => {
  const siteDir = path.resolve('/site');

  function getPaths(pathsToWatch: string[] | undefined): string[] {
    const plugin = {
      getPathsToWatch: pathsToWatch ? () => pathsToWatch : undefined,
    } as unknown as LoadedPlugin;
    return getPluginPathsToWatch({siteDir, plugin});
  }

  it('returns no paths for plugins without getPathsToWatch()', () => {
    expect(getPaths(undefined)).toEqual([]);
  });

  it('filters empty paths', () => {
    // Ecosystem: docusaurus-plugin-redoc, docusaurus-plugin-openapi...
    expect(getPaths([])).toEqual([]);
    expect(getPaths(['', 'sidebars.js'])).toEqual(['sidebars.js']);
  });

  it('keeps relative paths', () => {
    // Ecosystem: docusaurus-plugin-moonwave with a relative code path
    expect(
      getPaths(['sidebars.js', 'docs/**/*.{md,mdx}', '../src/**/*.lua']),
    ).toEqual(['sidebars.js', 'docs/**/*.{md,mdx}', '../src/**/*.lua']);
  });

  it('makes absolute file paths relative to siteDir', () => {
    // Ecosystem: docusaurus-plugin-glossary, redocusaurus, asyncapi...
    expect(
      getPaths([
        path.join(siteDir, 'glossary/glossary.json'),
        path.join(siteDir, '../api/openapi.yaml'),
      ]),
    ).toEqual(['glossary/glossary.json', '../api/openapi.yaml']);
  });

  it('makes absolute file paths in node_modules relative to siteDir', () => {
    // Ecosystem: @easyops-cn/docusaurus-search-local, with npm or pnpm
    const pnpmDir =
      '../node_modules/.pnpm/@easyops-cn+docusaurus-search-local@0.55.3/node_modules';
    expect(
      getPaths([
        path.join(
          siteDir,
          'node_modules/@easyops-cn/docusaurus-search-local/theme/index.js',
        ),
        path.join(
          siteDir,
          pnpmDir,
          '@easyops-cn/docusaurus-search-local/theme/index.js',
        ),
      ]),
    ).toEqual([
      'node_modules/@easyops-cn/docusaurus-search-local/theme/index.js',
      `${pnpmDir}/@easyops-cn/docusaurus-search-local/theme/index.js`,
    ]);
  });

  it('makes absolute dir paths relative to siteDir', () => {
    // Ecosystem: docusaurus-plugin-openapi, @docusaurus-plugin-ai/core,
    // @cbnventures/docusaurus-preset-nova, @apify/docusaurus-plugin-typedoc-api
    expect(
      getPaths([
        path.join(siteDir, 'docs'),
        path.join(siteDir, '../specs'),
        path.join(siteDir, 'node_modules/preset/blocks'),
      ]),
    ).toEqual(['docs', '../specs', 'node_modules/preset/blocks']);
  });

  it('makes absolute glob paths relative to siteDir', () => {
    // Ecosystem: @aldridged/docusaurus-plugin-lunr, docusaurus-plugin-copy,
    // @cbnventures/docusaurus-preset-nova, docusaurus-plugin-structurizr...
    const docsDir = path.join(siteDir, 'docs');
    expect(
      getPaths([
        `${docsDir}/**/*.{md,mdx}`,
        `${path.join(siteDir, 'versioned_docs/version-1.0.0')}/**/*.{md,mdx}`,
        `${path.join(siteDir, 'src')}/**/*.{md,mdx,ts,tsx,js,jsx}`,
      ]),
    ).toEqual([
      'docs/**/*.{md,mdx}',
      'versioned_docs/version-1.0.0/**/*.{md,mdx}',
      'src/**/*.{md,mdx,ts,tsx,js,jsx}',
    ]);
  });

  it('makes absolute glob paths with platform separators relative', () => {
    // Ecosystem: @supersuit/docusaurus-preset-wiki uses path.join() for globs
    // On Windows, they contain backslashes
    const docsDir = path.join(siteDir, 'docs');
    expect(
      getPaths([path.join(docsDir, '**/*.md'), path.join(docsDir, '**/*.mdx')]),
    ).toEqual(['docs/**/*.md', 'docs/**/*.mdx']);
  });

  it('makes absolute glob paths outside siteDir relative', () => {
    // Ecosystem: @vantagecompute/docusaurus-theme watches its own theme dir
    expect(
      getPaths([
        path.resolve(siteDir, '../theme/src/theme/**/*.{js,jsx,ts,tsx,css}'),
      ]),
    ).toEqual(['../theme/src/theme/**/*.{js,jsx,ts,tsx,css}']);
  });

  it('keeps negated absolute glob paths absolute', () => {
    // Ecosystem: docusaurus-plugin-structurizr
    // TODO this negated glob has no effect: watch() is called with the
    //  "cwd" option, and Chokidar v3 resolves it to "!<cwd>/<abs>"
    expect(getPaths([`!${siteDir}/**/include.*.dsl`])).toEqual([
      `!${posixPath(siteDir)}/**/include.*.dsl`,
    ]);
  });
});
