/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, onTestFinished} from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  glob,
  safeGlob,
  GlobExcludeDefault,
  createMatcher,
  createAbsoluteFilePathMatcher,
} from '../globUtils';

describe('glob', () => {
  async function createFiles(files: string[]): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'glob-test-'));
    onTestFinished(() => fs.rm(dir, {recursive: true, force: true}));
    for (const file of files) {
      await fs.mkdir(path.dirname(path.join(dir, file)), {recursive: true});
      await fs.writeFile(path.join(dir, file), '');
    }
    return dir;
  }

  it('sorts the files of folders read concurrently', async () => {
    const sortedFiles = Array.from(
      {length: 30},
      (_, i) => `post-${String(i).padStart(2, '0')}/index.md`,
    );
    const dir = await createFiles(sortedFiles);
    await expect(glob('**/*.md', {cwd: dir})).resolves.toEqual(sortedFiles);
  });

  it('sorts absolute file paths', async () => {
    const dir = await createFiles(['b/a.md', 'b.md', 'a.md']);
    const files = await glob('**/*.md', {cwd: dir, absolute: true});
    expect(files.map((file) => path.relative(dir, file))).toEqual([
      'a.md',
      'b.md',
      path.join('b', 'a.md'),
    ]);
  });

  describe('with a folder named like a file', () => {
    const cwd = path.join(__dirname, '__fixtures__', 'folder-named-like-file');

    it('does not match the files of a folder named like the pattern', async () => {
      await expect(glob(['**/*.md'], {cwd})).resolves.toEqual([
        'doc.md',
        'folder.md/doc.md',
      ]);
    });

    it('matches all the files of a directory pattern', async () => {
      await expect(glob(['folder.md'], {cwd})).resolves.toEqual([
        'folder.md/doc.md',
        'folder.md/notes.txt',
      ]);
    });

    it('matches all the files of a directory pattern with a trailing slash', async () => {
      await expect(glob(['folder.md/'], {cwd})).resolves.toEqual([
        'folder.md/doc.md',
        'folder.md/notes.txt',
      ]);
    });

    it('ignores all the files of a directory', async () => {
      await expect(
        glob(['**/*'], {cwd, ignore: ['folder.md']}),
      ).resolves.toEqual(['doc.md']);
    });
  });

  it('matches all the files of a directory named with glob characters', async () => {
    await expect(
      glob(['folder (copy) [old]'], {
        cwd: path.join(__dirname, '__fixtures__', 'glob-characters'),
      }),
    ).resolves.toEqual(['folder (copy) [old]/doc.md']);
  });
});

describe('createMatcher', () => {
  it('match default exclude MD/MDX partials correctly', () => {
    const matcher = createMatcher(GlobExcludeDefault);
    expect(matcher('doc.md')).toBe(false);
    expect(matcher('category/doc.md')).toBe(false);
    expect(matcher('category/subcategory/doc.md')).toBe(false);
    //
    expect(matcher('doc.mdx')).toBe(false);
    expect(matcher('category/doc.mdx')).toBe(false);
    expect(matcher('category/subcategory/doc.mdx')).toBe(false);
    //
    expect(matcher('_doc.md')).toBe(true);
    expect(matcher('category/_doc.md')).toBe(true);
    expect(matcher('category/subcategory/_doc.md')).toBe(true);
    expect(matcher('_category/doc.md')).toBe(true);
    expect(matcher('_category/subcategory/doc.md')).toBe(true);
    expect(matcher('category/_subcategory/doc.md')).toBe(true);
  });

  it('match default exclude tests correctly', () => {
    const matcher = createMatcher(GlobExcludeDefault);
    expect(matcher('xyz.js')).toBe(false);
    expect(matcher('xyz.ts')).toBe(false);
    expect(matcher('xyz.jsx')).toBe(false);
    expect(matcher('xyz.tsx')).toBe(false);
    expect(matcher('folder/xyz.js')).toBe(false);
    expect(matcher('folder/xyz.ts')).toBe(false);
    expect(matcher('folder/xyz.jsx')).toBe(false);
    expect(matcher('folder/xyz.tsx')).toBe(false);
    //
    expect(matcher('xyz.test.js')).toBe(true);
    expect(matcher('xyz.test.ts')).toBe(true);
    expect(matcher('xyz.test.jsx')).toBe(true);
    expect(matcher('xyz.test.tsx')).toBe(true);
    expect(matcher('folder/xyz.test.js')).toBe(true);
    expect(matcher('folder/xyz.test.ts')).toBe(true);
    expect(matcher('folder/xyz.test.jsx')).toBe(true);
    expect(matcher('folder/xyz.test.tsx')).toBe(true);
    expect(matcher('folder/subfolder/xyz.test.js')).toBe(true);
    expect(matcher('folder/subfolder/xyz.test.ts')).toBe(true);
    expect(matcher('folder/subfolder/xyz.test.jsx')).toBe(true);
    expect(matcher('folder/subfolder/xyz.test.tsx')).toBe(true);
    //
    expect(matcher('__tests__/subfolder/xyz.js')).toBe(true);
    expect(matcher('__tests__/subfolder/xyz.ts')).toBe(true);
    expect(matcher('__tests__/subfolder/xyz.jsx')).toBe(true);
    expect(matcher('__tests__/subfolder/xyz.tsx')).toBe(true);
    expect(matcher('folder/__tests__/xyz.js')).toBe(true);
    expect(matcher('folder/__tests__/xyz.ts')).toBe(true);
    expect(matcher('folder/__tests__/xyz.jsx')).toBe(true);
    expect(matcher('folder/__tests__/xyz.tsx')).toBe(true);
  });

  it('matches nothing given nothing', () => {
    const matcher = createMatcher([]);
    expect(matcher('foo')).toBe(false);
    expect(matcher('')).toBe(false);
    expect(matcher('we/are/the/champions')).toBe(false);
  });
});

describe('createAbsoluteFilePathMatcher', () => {
  const rootFolders = ['/_root/docs', '/root/_docs/', '/__test__/website/src'];

  const matcher = createAbsoluteFilePathMatcher(
    GlobExcludeDefault,
    rootFolders,
  );

  it('match default exclude MD/MDX partials correctly', () => {
    expect(matcher('/_root/docs/myDoc.md')).toBe(false);
    expect(matcher('/_root/docs/myDoc.mdx')).toBe(false);
    expect(matcher('/root/_docs/myDoc.md')).toBe(false);
    expect(matcher('/root/_docs/myDoc.mdx')).toBe(false);
    expect(matcher('/_root/docs/category/myDoc.md')).toBe(false);
    expect(matcher('/_root/docs/category/myDoc.mdx')).toBe(false);
    expect(matcher('/root/_docs/category/myDoc.md')).toBe(false);
    expect(matcher('/root/_docs/category/myDoc.mdx')).toBe(false);
    //
    expect(matcher('/_root/docs/_myDoc.md')).toBe(true);
    expect(matcher('/_root/docs/_myDoc.mdx')).toBe(true);
    expect(matcher('/root/_docs/_myDoc.md')).toBe(true);
    expect(matcher('/root/_docs/_myDoc.mdx')).toBe(true);
    expect(matcher('/_root/docs/_category/myDoc.md')).toBe(true);
    expect(matcher('/_root/docs/_category/myDoc.mdx')).toBe(true);
    expect(matcher('/root/_docs/_category/myDoc.md')).toBe(true);
    expect(matcher('/root/_docs/_category/myDoc.mdx')).toBe(true);
    expect(matcher('/_root/docs/category/_myDoc.md')).toBe(true);
    expect(matcher('/_root/docs/category/_subcategory/myDoc.md')).toBe(true);
  });

  it('match default exclude tests correctly', () => {
    expect(matcher('/__test__/website/src/xyz.js')).toBe(false);
    expect(matcher('/__test__/website/src/__test__/xyz.js')).toBe(true);
    expect(matcher('/__test__/website/src/xyz.test.js')).toBe(true);
  });

  it('throw if file is not contained in any root doc', () => {
    expect(() =>
      matcher('/bad/path/myDoc.md'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: createAbsoluteFilePathMatcher unexpected error, absoluteFilePath=/bad/path/myDoc.md was not contained in any of the root folders: /_root/docs, /root/_docs/, /__test__/website/src]`,
    );
  });

  it('matches paths with overlapping paths', () => {
    const overlapMatcher = createAbsoluteFilePathMatcher(GlobExcludeDefault, [
      '/root/docs',
      '/root/versioned_docs/version-2.0.0',
      '/root/versioned_docs/version-2.0.0-rc.1',
    ]);
    expect(
      overlapMatcher('/root/versioned_docs/version-2.0.0-rc.1/_partial.mdx'),
    ).toBe(true);
    expect(
      overlapMatcher('/root/versioned_docs/version-2.0.0/_partial.mdx'),
    ).toBe(true);
    expect(
      overlapMatcher('/root/versioned_docs/version-2.0.0/no-partial.mdx'),
    ).toBe(false);
  });
});

describe('safeGlob', () => {
  it('matches all the files of an absolute directory path', async () => {
    const dirPath = path.join(
      __dirname,
      '__fixtures__',
      'folder-named-like-file',
      'folder.md',
    );
    const files = await safeGlob([dirPath], {absolute: true});
    expect(files.map((file) => path.relative(dirPath, file))).toEqual([
      'doc.md',
      'notes.txt',
    ]);
  });
});
