/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  GlobExcludeDefault,
  createMatcher,
  createAbsoluteFilePathMatcher,
} from '../globUtils';

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
