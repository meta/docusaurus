/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {mkdir, mkdtempDisposable, realpath, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {transform} from '@svgr/core';
import svgo from '@svgr/plugin-svgo';
import jsx from '@svgr/plugin-jsx';
import {createSVGRConfig} from '../svgrLoader';
import type {SVGRConfig} from '../options';

const siteDir = path.join(__dirname, 'site');

const typescriptSvgrConfig = 'module.exports = {typescript: true};\n';

function gradientSvg(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <title>Gradient</title>
  <rect class="my-rect" width="10" height="10" fill="url(#${color}-gradient)" />
  <linearGradient id="${color}-gradient">
    <stop offset="0%" stop-color="${color}" />
    <stop offset="100%" stop-color="white" />
  </linearGradient>
</svg>`;
}

async function transformSvg({
  svg,
  filePath,
  svgrConfig = {},
  siteDirectory = siteDir,
}: {
  svg: string;
  filePath: string;
  svgrConfig?: SVGRConfig;
  siteDirectory?: string;
}): Promise<string> {
  return transform(
    svg,
    {
      ...createSVGRConfig({siteDir: siteDirectory, svgrConfig}),
      plugins: [svgo, jsx],
    },
    {filePath: path.join(siteDirectory, filePath)},
  );
}

function getIds(code: string): string[] {
  return [...code.matchAll(/\bid="(?<id>[^"]+)"/g)].map(
    (match) => match.groups!.id!,
  );
}

// SVGR searches from the SVG file upward, so each case needs its own directory.
// Cosmiconfig caches a search path for the process lifetime.
async function withSvgrConfigFile(
  configSource: string,
  location: 'parent' | 'site',
): Promise<{siteDirectory: string; filePath: string} & AsyncDisposable> {
  const parent = await mkdtempDisposable(
    path.join(await realpath(tmpdir()), 'docusaurus-svgr-'),
  );
  const siteDirectory = path.join(parent.path, 'site');
  const filePath = 'src/icon.svg';
  await mkdir(path.join(siteDirectory, 'src'), {recursive: true});
  await writeFile(path.join(siteDirectory, filePath), gradientSvg('red'));
  const configDirectory = location === 'parent' ? parent.path : siteDirectory;
  await writeFile(path.join(configDirectory, 'svgr.config.js'), configSource);
  return {
    siteDirectory,
    filePath,
    [Symbol.asyncDispose]: parent[Symbol.asyncDispose],
  };
}

function expectPlainReactSvg(code: string) {
  expect(code).toContain('export default');
  expect(code).toContain('viewBox="0 0 10 10"');
  expect(code).not.toContain('interface SVGRProps');
  expect(code).not.toContain('import type { SVGProps }');
}

describe('createSVGRConfig', () => {
  it('prefixes SVG ids to avoid clashes between inline SVGs', async () => {
    const codeA = await transformSvg({
      svg: gradientSvg('red'),
      filePath: 'src/a/gradient.svg',
    });
    const codeB = await transformSvg({
      svg: gradientSvg('blue'),
      filePath: 'src/b/gradient.svg',
    });

    const [idA] = getIds(codeA);
    const [idB] = getIds(codeB);
    expect(idA).toMatch(/^svg-[\da-f]{6}-a$/);
    expect(idB).toMatch(/^svg-[\da-f]{6}-a$/);
    expect(idA).not.toEqual(idB);

    // Id references are prefixed too
    expect(codeA).toContain(`fill="url(#${idA})"`);
    expect(codeB).toContain(`fill="url(#${idB})"`);
  });

  it('generates the same ids for the same site-relative file path', async () => {
    const code1 = await transformSvg({
      svg: gradientSvg('red'),
      filePath: 'src/gradient.svg',
      siteDirectory: path.join(__dirname, 'site1'),
    });
    const code2 = await transformSvg({
      svg: gradientSvg('red'),
      filePath: 'src/gradient.svg',
      siteDirectory: path.join(__dirname, 'site2'),
    });
    expect(getIds(code1)).toEqual(getIds(code2));
  });

  it('keeps class names, viewBox and title', async () => {
    const code = await transformSvg({
      svg: gradientSvg('red'),
      filePath: 'src/gradient.svg',
    });
    expect(code).toContain('className="my-rect"');
    expect(code).toContain('viewBox="0 0 10 10"');
    expect(code).toContain('<title id={titleId}>');
  });

  it('can restore the Docusaurus v3 SVGO config', async () => {
    const code = await transformSvg({
      svg: gradientSvg('red'),
      filePath: 'src/gradient.svg',
      svgrConfig: {
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeTitle: false,
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      },
    });
    expect(getIds(code)).toEqual(['a']);
    expect(code).toContain('fill="url(#a)"');
  });

  it('ignores a parent svgr config that enables TypeScript output', async () => {
    await using site = await withSvgrConfigFile(typescriptSvgrConfig, 'parent');
    const code = await transformSvg({
      svg: gradientSvg('red'),
      filePath: site.filePath,
      siteDirectory: site.siteDirectory,
    });
    expectPlainReactSvg(code);
  });

  it('loads a parent svgr config when runtimeConfig is enabled', async () => {
    await using site = await withSvgrConfigFile(typescriptSvgrConfig, 'parent');
    const code = await transformSvg({
      svg: gradientSvg('red'),
      filePath: site.filePath,
      siteDirectory: site.siteDirectory,
      svgrConfig: {runtimeConfig: true},
    });
    expect(code).toContain('interface SVGRProps');
    expect(code).toContain('import type { SVGProps }');
  });

  it('ignores an svgr config in the site directory', async () => {
    await using site = await withSvgrConfigFile(typescriptSvgrConfig, 'site');
    const code = await transformSvg({
      svg: gradientSvg('red'),
      filePath: site.filePath,
      siteDirectory: site.siteDirectory,
    });
    expectPlainReactSvg(code);
  });

  it('ignores a malformed svgr config discovered from a parent directory', async () => {
    await using site = await withSvgrConfigFile(
      'module.exports = {\n',
      'parent',
    );
    const code = await transformSvg({
      svg: gradientSvg('red'),
      filePath: site.filePath,
      siteDirectory: site.siteDirectory,
    });
    expectPlainReactSvg(code);
  });
});
