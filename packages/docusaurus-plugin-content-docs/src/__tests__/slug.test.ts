/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import getSlug from '../slug';

describe('getSlug', () => {
  it('defaults to dirname/id', () => {
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/doc.md',
        sourceDirName: '/dir',
      }),
    ).toBe('/dir/doc');
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/doc.md',
        sourceDirName: '/dir/subdir',
      }),
    ).toBe('/dir/subdir/doc');
  });

  it('handles conventional doc indexes', () => {
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/index.md',
        sourceDirName: '/dir/subdir',
      }),
    ).toBe('/dir/subdir/');
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/inDEx.mdx',
        sourceDirName: '/dir/subdir',
      }),
    ).toBe('/dir/subdir/');
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/readme.md',
        sourceDirName: '/dir/subdir',
      }),
    ).toBe('/dir/subdir/');
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/reADMe.mdx',
        sourceDirName: '/dir/subdir',
      }),
    ).toBe('/dir/subdir/');
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/subdir.md',
        sourceDirName: '/dir/subdir',
      }),
    ).toBe('/dir/subdir/');
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/suBDir.mdx',
        sourceDirName: '/dir/subdir',
      }),
    ).toBe('/dir/subdir/');
  });

  it('ignores conventional doc index when explicit slug front matter is provided', () => {
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/dir/subdir/index.md',
        sourceDirName: '/dir/subdir',
        frontMatterSlug: '/my/frontMatterSlug',
      }),
    ).toBe('/my/frontMatterSlug');
  });

  it('can strip dir number prefixes', () => {
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/001-dir1/002-dir2/doc.md',
        sourceDirName: '/001-dir1/002-dir2',
        stripDirNumberPrefixes: true,
      }),
    ).toBe('/dir1/dir2/doc');
    expect(
      getSlug({
        baseID: 'doc',
        source: '@site/docs/001-dir1/002-dir2/doc.md',
        sourceDirName: '/001-dir1/002-dir2',
        stripDirNumberPrefixes: false,
      }),
    ).toBe('/001-dir1/002-dir2/doc');
  });

  // See https://github.com/facebook/docusaurus/issues/3223
  it('handles special chars in doc path', () => {
    expect(
      getSlug({
        baseID: 'my dôc',
        source: '@site/docs/dir with spâce/hey $hello/doc.md',
        sourceDirName: '/dir with spâce/hey $hello',
      }),
    ).toBe('/dir with spâce/hey $hello/my dôc');
  });

  it('throws for invalid routes', () => {
    expect(() =>
      getSlug({
        baseID: 'my dôc',
        source: '@site/docs/dir with spâce/hey $hello/doc.md',
        sourceDirName: '/dir with spâce/hey $hello',
        frontMatterSlug: '//',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: We couldn't compute a valid slug for document with ID "my dôc" in "/dir with spâce/hey $hello" directory.
      The slug we computed looks invalid: //.
      Maybe your slug front matter is incorrect or there are special characters in the file path?
      By using front matter to set a custom slug, you should be able to fix this error:

      ---
      slug: /my/customDocPath
      ---
      ]
    `);
  });

  it('handles current dir', () => {
    expect(
      getSlug({baseID: 'doc', source: '@site/docs/doc.md', sourceDirName: '.'}),
    ).toBe('/doc');
    expect(
      getSlug({baseID: 'doc', source: '@site/docs/doc.md', sourceDirName: '/'}),
    ).toBe('/doc');
  });

  it('resolves absolute slug front matter', () => {
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/doc.md',
        sourceDirName: '.',
        frontMatterSlug: '/abc/def',
      }),
    ).toBe('/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/any/doc.md',
        sourceDirName: './any',
        frontMatterSlug: '/abc/def',
      }),
    ).toBe('/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/any/any/doc.md',
        sourceDirName: './any/any',
        frontMatterSlug: '/abc/def',
      }),
    ).toBe('/abc/def');
  });

  it('resolves relative slug front matter', () => {
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/doc.md',
        sourceDirName: '.',
        frontMatterSlug: 'abc/def',
      }),
    ).toBe('/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/dir/doc.md',
        sourceDirName: '/dir',
        frontMatterSlug: 'abc/def',
      }),
    ).toBe('/dir/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/nonSlashedDir/doc.md',
        sourceDirName: 'nonSlashedDir',
        frontMatterSlug: 'abc/def',
      }),
    ).toBe('/nonSlashedDir/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/dir/subdir/doc.md',
        sourceDirName: 'dir/subdir',
        frontMatterSlug: 'abc/def',
      }),
    ).toBe('/dir/subdir/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/dir/doc.md',
        sourceDirName: '/dir',
        frontMatterSlug: './abc/def',
      }),
    ).toBe('/dir/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/dir/doc.md',
        sourceDirName: '/dir',
        frontMatterSlug: './abc/../def',
      }),
    ).toBe('/dir/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/dir/subdir/doc.md',
        sourceDirName: '/dir/subdir',
        frontMatterSlug: '../abc/def',
      }),
    ).toBe('/dir/abc/def');
    expect(
      getSlug({
        baseID: 'any',
        source: '@site/docs/dir/subdirDoc.md',
        sourceDirName: '/dir/subdir',
        frontMatterSlug: '../../../../../abc/../def',
      }),
    ).toBe('/def');
  });
});
