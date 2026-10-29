/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

import {outputFile} from '@docusaurus/fs';
import writeRedirectFiles, {
  toRedirectFiles,
  createToUrl,
} from '../writeRedirectFiles';

// Test to fix toUrl bugs we had:
// - https://github.com/facebook/docusaurus/issues/3886
// - https://github.com/facebook/docusaurus/issues/3925
describe('createToUrl', () => {
  it('creates appropriate redirect urls', () => {
    expect(createToUrl('/', '/docs/something/else')).toBe(
      '/docs/something/else',
    );
    expect(createToUrl('/', '/docs/something/else/')).toBe(
      '/docs/something/else/',
    );
    expect(createToUrl('/', 'docs/something/else')).toBe('docs/something/else');
    expect(createToUrl('/', './docs/something/else')).toBe(
      './docs/something/else',
    );
    expect(createToUrl('/', 'https://docs/something/else')).toBe(
      'https://docs/something/else',
    );
  });

  it('creates appropriate redirect urls with baseUrl', () => {
    expect(createToUrl('/baseUrl/', '/docs/something/else')).toBe(
      '/baseUrl/docs/something/else',
    );
    expect(createToUrl('/baseUrl/', '/docs/something/else/')).toBe(
      '/baseUrl/docs/something/else/',
    );
    expect(createToUrl('/baseUrl/', 'docs/something/else')).toBe(
      'docs/something/else',
    );
    expect(createToUrl('/baseUrl/', './docs/something/else')).toBe(
      './docs/something/else',
    );
    expect(createToUrl('/baseUrl/', 'https://docs/something/else')).toBe(
      'https://docs/something/else',
    );
  });
});

describe('toRedirectFiles', () => {
  it('creates appropriate metadata absolute url', () => {
    const pluginContext = {
      outDir: '/tmp/someFixedOutDir',
      baseUrl: '/',
    };

    const redirectFiles = toRedirectFiles(
      [
        {from: '/abc', to: 'https://docusaurus.io/'},
        {from: '/def', to: 'https://docusaurus.io/docs/intro?a=1'},
        {from: '/ijk', to: 'https://docusaurus.io/docs/intro#anchor'},
      ],
      pluginContext,
      undefined,
    );

    expect(redirectFiles.map((f) => f.fileAbsolutePath)).toEqual([
      path.join(pluginContext.outDir, '/abc/index.html'),
      path.join(pluginContext.outDir, '/def/index.html'),
      path.join(pluginContext.outDir, '/ijk/index.html'),
    ]);

    expect(redirectFiles.map((f) => f.fileContent)).toMatchSnapshot(
      'fileContent',
    );
  });

  it('creates appropriate metadata trailingSlash=undefined', () => {
    const pluginContext = {
      outDir: '/tmp/someFixedOutDir',
      baseUrl: 'https://docusaurus.io',
    };

    const redirectFiles = toRedirectFiles(
      [
        {from: '/abc.html', to: '/abc'},
        {from: '/def', to: '/def.html'},
        {from: '/xyz', to: '/'},
      ],
      pluginContext,
      undefined,
    );

    expect(redirectFiles.map((f) => f.fileAbsolutePath)).toEqual([
      path.join(pluginContext.outDir, '/abc.html/index.html'),
      path.join(pluginContext.outDir, '/def/index.html'),
      path.join(pluginContext.outDir, '/xyz/index.html'),
    ]);

    expect(redirectFiles.map((f) => f.fileContent)).toMatchSnapshot(
      'fileContent',
    );
  });

  it('creates appropriate metadata trailingSlash=true', () => {
    const pluginContext = {
      outDir: '/tmp/someFixedOutDir',
      baseUrl: 'https://docusaurus.io',
    };

    const redirectFiles = toRedirectFiles(
      [
        {from: '/abc.html', to: '/abc'},
        {from: '/def', to: '/def.html'},
        {from: '/xyz', to: '/'},
      ],
      pluginContext,
      true,
    );

    expect(redirectFiles.map((f) => f.fileAbsolutePath)).toEqual([
      path.join(pluginContext.outDir, '/abc.html/index.html'),
      path.join(pluginContext.outDir, '/def/index.html'),
      path.join(pluginContext.outDir, '/xyz/index.html'),
    ]);

    expect(redirectFiles.map((f) => f.fileContent)).toMatchSnapshot(
      'fileContent',
    );
  });

  it('creates appropriate metadata trailingSlash=false', () => {
    const pluginContext = {
      outDir: '/tmp/someFixedOutDir',
      baseUrl: 'https://docusaurus.io',
    };

    const redirectFiles = toRedirectFiles(
      [
        {from: '/abc.html', to: '/abc'},
        {from: '/def', to: '/def.html'},
        {from: '/xyz', to: '/'},
      ],
      pluginContext,
      false,
    );

    expect(redirectFiles.map((f) => f.fileAbsolutePath)).toEqual([
      // Can't be used because /abc.html already exists, and file/folder can't
      // share same name on Unix!
      // path.join(pluginContext.outDir, '/abc.html/index.html'),
      path.join(pluginContext.outDir, '/abc.html.html'), // Weird but on purpose!
      path.join(pluginContext.outDir, '/def/index.html'),
      path.join(pluginContext.outDir, '/xyz/index.html'),
    ]);

    expect(redirectFiles.map((f) => f.fileContent)).toMatchSnapshot(
      'fileContent',
    );
  });

  it('creates appropriate metadata for root baseUrl', () => {
    const pluginContext = {
      outDir: '/tmp/someFixedOutDir',
      baseUrl: '/',
    };
    const redirectFiles = toRedirectFiles(
      [{from: '/abc.html', to: '/abc'}],
      pluginContext,
      undefined,
    );
    expect(redirectFiles.map((f) => f.fileContent)).toMatchSnapshot(
      'fileContent baseUrl=/',
    );
  });

  it('creates appropriate metadata for empty baseUrl', () => {
    const pluginContext = {
      outDir: '/tmp/someFixedOutDir',
      baseUrl: '',
    };
    const redirectFiles = toRedirectFiles(
      [{from: '/abc.html', to: '/abc'}],
      pluginContext,
      undefined,
    );
    expect(redirectFiles.map((f) => f.fileContent)).toMatchSnapshot(
      'fileContent baseUrl=empty',
    );
  });
});

describe('writeRedirectFiles', () => {
  it('write the files', async () => {
    const outDir = `/tmp/docusaurus_tests_${Math.random()}`;

    const filesMetadata = [
      {
        fileAbsolutePath: path.join(outDir, 'someFileName'),
        fileContent: 'content 1',
      },
      {
        fileAbsolutePath: path.join(outDir, '/some/nested/filename'),
        fileContent: 'content 2',
      },
    ];

    await writeRedirectFiles(filesMetadata);

    await expect(
      fs.readFile(filesMetadata[0]!.fileAbsolutePath, 'utf8'),
    ).resolves.toBe('content 1');

    await expect(
      fs.readFile(filesMetadata[1]!.fileAbsolutePath, 'utf8'),
    ).resolves.toBe('content 2');
  });

  it('avoid overwriting existing files', async () => {
    const outDir = `/tmp/docusaurus_tests_${Math.random()}`;

    const filesMetadata = [
      {
        fileAbsolutePath: path.join(outDir, 'someFileName/index.html'),
        fileContent: 'content 1',
      },
    ];

    await outputFile(
      filesMetadata[0]!.fileAbsolutePath,
      'file already exists!',
    );

    await expect(
      writeRedirectFiles(filesMetadata),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: The redirect plugin is not supposed to override existing files.]`,
    );
  });
});
