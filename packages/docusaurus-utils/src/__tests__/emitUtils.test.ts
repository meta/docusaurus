/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import {readOutputHTMLFile, generate} from '../emitUtils';

describe('readOutputHTMLFile', () => {
  it('reads both files with trailing slash undefined', async () => {
    await expect(
      readOutputHTMLFile(
        '/file',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).resolves.toBe('file\n');
    await expect(
      readOutputHTMLFile(
        '/folder',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).resolves.toBe('folder\n');
    await expect(
      readOutputHTMLFile(
        '/file/',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).resolves.toBe('file\n');
    await expect(
      readOutputHTMLFile(
        '/folder/',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).resolves.toBe('folder\n');
  });
  it('reads only folder with trailing slash true', async () => {
    await expect(
      readOutputHTMLFile(
        '/folder',
        path.join(__dirname, '__fixtures__/build-snap'),
        true,
      ).then(String),
    ).resolves.toBe('folder\n');
    await expect(
      readOutputHTMLFile(
        '/folder/',
        path.join(__dirname, '__fixtures__/build-snap'),
        true,
      ).then(String),
    ).resolves.toBe('folder\n');
  });
  it('reads only file trailing slash false', async () => {
    await expect(
      readOutputHTMLFile(
        '/file',
        path.join(__dirname, '__fixtures__/build-snap'),
        false,
      ).then(String),
    ).resolves.toBe('file\n');
    await expect(
      readOutputHTMLFile(
        '/file/',
        path.join(__dirname, '__fixtures__/build-snap'),
        false,
      ).then(String),
    ).resolves.toBe('file\n');
  });
  it('reads file ending in .html', async () => {
    await expect(
      readOutputHTMLFile(
        '/htmlFile.html',
        path.join(__dirname, '__fixtures__/build-snap'),
        false,
      ).then(String),
    ).resolves.toBe('htmlFile.html\n');
    await expect(
      readOutputHTMLFile(
        '/htmlFile.html',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).resolves.toBe('htmlFile.html\n');
  });
  it('reads file ending in .html in folder containing .html', async () => {
    await expect(
      readOutputHTMLFile(
        '/weird.html.folder/nestedHtmlFile.html',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).resolves.toBe('nestedHtmlFile.html\n');
    await expect(
      readOutputHTMLFile(
        '/weird.html.folder/nestedHtmlFile.html',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).resolves.toBe('nestedHtmlFile.html\n');
  });
  // Can it ever happen?
  it('throws if file does not exist', async () => {
    await expect(
      readOutputHTMLFile(
        '/nonExistent',
        path.join(__dirname, '__fixtures__/build-snap'),
        undefined,
      ).then(String),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected output HTML file to be found at <PROJECT_ROOT>/packages/docusaurus-utils/src/__tests__/__fixtures__/build-snap/nonExistent/index.html for permalink /nonExistent.]`,
    );
  });
});

describe('generate', () => {
  const writeMock = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
  // Used by pathExists()
  const accessMock = vi.spyOn(fs, 'access');
  const readMock = vi.spyOn(fs, 'readFile');

  it('works with no file and no cache', async () => {
    accessMock.mockRejectedValueOnce(new Error('ENOENT'));
    await generate(__dirname, 'foo', 'bar');
    expect(writeMock).toHaveBeenNthCalledWith(
      1,
      path.join(__dirname, 'foo'),
      'bar',
      undefined,
    );
  });

  it('works with existing cache', async () => {
    accessMock.mockRejectedValueOnce(new Error('ENOENT'));
    await generate(__dirname, 'cached', 'bar');
    writeMock.mockClear();

    await generate(__dirname, 'cached', 'bar');
    expect(writeMock).not.toHaveBeenCalled();
  });

  it('works with existing file but no cache', async () => {
    accessMock.mockResolvedValueOnce(undefined);
    readMock.mockImplementationOnce(() => Promise.resolve('bar'));
    await generate(__dirname, 'baz', 'bar');
    expect(writeMock).not.toHaveBeenCalled();
  });

  it('works when force skipping cache', async () => {
    accessMock.mockRejectedValueOnce(new Error('ENOENT'));
    await generate(__dirname, 'skip-cache', 'bar');
    writeMock.mockClear();

    await generate(__dirname, 'skip-cache', 'bar', true);
    expect(writeMock).toHaveBeenNthCalledWith(
      1,
      path.join(__dirname, 'skip-cache'),
      'bar',
      undefined,
    );
  });
});
