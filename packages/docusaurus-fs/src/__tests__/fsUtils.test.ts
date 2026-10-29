/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {pathExists, outputFile, readJSON, realpath} from '../fsUtils';

const isCaseInsensitiveFileSystem = await pathExists(__filename.toUpperCase());

async function createTmpDir() {
  return fs.mkdtempDisposable(
    path.join(await fs.realpath(tmpdir()), 'docusaurus-fsUtils-'),
  );
}

describe('pathExists', () => {
  it('returns true for existing files and directories', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'file.txt');
    await fs.writeFile(filePath, 'content');
    await expect(pathExists(filePath)).resolves.toBe(true);
    await expect(pathExists(dir.path)).resolves.toBe(true);
  });

  it('returns false for missing paths', async () => {
    await using dir = await createTmpDir();
    await expect(pathExists(path.join(dir.path, 'missing'))).resolves.toBe(
      false,
    );
    await expect(
      pathExists(path.join(dir.path, 'missing/nested/file.txt')),
    ).resolves.toBe(false);
  });
});

describe('outputFile', () => {
  it('creates missing parent directories', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'a/b/c/file.txt');
    await outputFile(filePath, 'content');
    await expect(fs.readFile(filePath, 'utf8')).resolves.toBe('content');
  });

  it('overwrites existing files', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'file.txt');
    await outputFile(filePath, 'content 1');
    await outputFile(filePath, 'content 2');
    await expect(fs.readFile(filePath, 'utf8')).resolves.toBe('content 2');
  });

  it('writes buffers', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'dir/file.bin');
    await outputFile(filePath, Buffer.from([0, 1, 2]));
    await expect(fs.readFile(filePath)).resolves.toEqual(
      Buffer.from([0, 1, 2]),
    );
  });

  it('writes through fs.writeFile, so that tests can spy on it', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'dir/file.txt');
    using writeFile = vi.spyOn(fs, 'writeFile');
    await outputFile(filePath, 'content');
    expect(writeFile).toHaveBeenCalledExactlyOnceWith(
      filePath,
      'content',
      undefined,
    );
  });
});

describe('readJSON', () => {
  it('reads JSON', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'file.json');
    await fs.writeFile(filePath, '{"a": 1, "b": [true, null]}');
    await expect(readJSON(filePath)).resolves.toEqual({a: 1, b: [true, null]});
  });

  it('ignores a leading UTF-8 BOM', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'file.json');
    await fs.writeFile(filePath, '\uFEFF{"a": 1}');
    await expect(readJSON(filePath)).resolves.toEqual({a: 1});
  });

  it('throws an error with the relative path, caused by the parse error', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'file.json');
    await fs.writeFile(filePath, '{"a": ');
    const error = (await readJSON(filePath).catch(
      (err: unknown) => err,
    )) as Error;
    expect(error.message).toContain('Failed to read JSON file at ');
    expect(error.message).toContain(path.relative(process.cwd(), filePath));
    expect(error.cause).toBeInstanceOf(SyntaxError);
  });

  it('throws an error with the relative path, caused by the read error', async () => {
    await using dir = await createTmpDir();
    const filePath = path.join(dir.path, 'missing.json');
    const error = (await readJSON(filePath).catch(
      (err: unknown) => err,
    )) as Error;
    expect(error.message).toContain(path.relative(process.cwd(), filePath));
    expect(error.cause).toMatchObject({code: 'ENOENT'});
  });
});

describe('realpath', () => {
  it('resolves symlinks', async () => {
    await using dir = await createTmpDir();
    const targetPath = path.join(dir.path, 'target');
    const linkPath = path.join(dir.path, 'link');
    await fs.mkdir(targetPath);
    await fs.symlink(targetPath, linkPath, 'junction');
    await expect(realpath(linkPath)).resolves.toBe(targetPath);
    await expect(realpath(path.join(linkPath, '..', 'link'))).resolves.toBe(
      targetPath,
    );
  });

  // Unlike fs/promises realpath() that would return ".../MixedCase"
  it.skipIf(!isCaseInsensitiveFileSystem)(
    'keeps the path casing on case-insensitive file systems',
    async () => {
      await using dir = await createTmpDir();
      await fs.mkdir(path.join(dir.path, 'MixedCase'));
      const lowerCasePath = path.join(dir.path, 'mixedcase');
      await expect(realpath(lowerCasePath)).resolves.toBe(lowerCasePath);
    },
  );

  it('rejects for missing paths', async () => {
    await using dir = await createTmpDir();
    await expect(
      realpath(path.join(dir.path, 'missing')),
    ).rejects.toMatchObject({code: 'ENOENT'});
  });
});
