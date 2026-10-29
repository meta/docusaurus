/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  mkdtempDisposable,
  readFile,
  realpath,
  writeFile,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {writeHeadingIds} from '../writeHeadingIds';
import type {WriteHeadingIDOptions} from '@docusaurus/utils';
import type {MarkdownConfig} from '@docusaurus/types';

const Content = `# Title

## Heading
`;

async function testWriteHeadingIds({
  markdownFormat,
  options,
}: {
  markdownFormat?: MarkdownConfig['format'];
  options?: WriteHeadingIDOptions;
}) {
  await using siteDir = await mkdtempDisposable(
    path.join(await realpath(tmpdir()), 'docusaurus-write-heading-ids-'),
  );
  const markdownConfig = markdownFormat ? {format: markdownFormat} : {};
  await writeFile(
    path.join(siteDir.path, 'docusaurus.config.js'),
    `export default ${JSON.stringify({
      title: 'My Site',
      url: 'https://example.com',
      baseUrl: '/',
      markdown: markdownConfig,
    })};`,
  );
  const mdFile = path.join(siteDir.path, 'doc.md');
  const mdxFile = path.join(siteDir.path, 'doc.mdx');
  await writeFile(mdFile, Content);
  await writeFile(mdxFile, Content);

  await writeHeadingIds(siteDir.path, [mdFile, mdxFile], options);

  return {
    md: await readFile(mdFile, 'utf8'),
    mdx: await readFile(mdxFile, 'utf8'),
  };
}

describe('writeHeadingIds', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('infers the syntax from the Markdown format', () => {
    it('uses mdx-comment for all files with the default "mdx" format', async () => {
      const result = await testWriteHeadingIds({});
      expect(result.md).toContain('## Heading {/* #heading */}');
      expect(result.mdx).toContain('## Heading {/* #heading */}');
    });

    it('uses classic for all files with the "md" format', async () => {
      const result = await testWriteHeadingIds({markdownFormat: 'md'});
      expect(result.md).toContain('## Heading {#heading}');
      expect(result.mdx).toContain('## Heading {#heading}');
    });

    it('uses the file extension with the "detect" format', async () => {
      const result = await testWriteHeadingIds({markdownFormat: 'detect'});
      expect(result.md).toContain('## Heading {#heading}');
      expect(result.mdx).toContain('## Heading {/* #heading */}');
    });
  });

  it('uses the explicit syntax option over the inferred syntax', async () => {
    const result = await testWriteHeadingIds({
      markdownFormat: 'detect',
      options: {syntax: 'classic'},
    });
    expect(result.md).toContain('## Heading {#heading}');
    expect(result.mdx).toContain('## Heading {#heading}');
  });

  it('throws for invalid syntax option', async () => {
    await expect(
      writeHeadingIds('.', [], {
        syntax: 'unknown' as WriteHeadingIDOptions['syntax'],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid --syntax value "unknown". Valid values: classic, mdx-comment]`,
    );
  });

  it('throws for --overwrite and --migrate options used together', async () => {
    await expect(
      writeHeadingIds('.', [], {overwrite: true, migrate: true}),
    ).rejects.toThrowError(
      'Options --overwrite and --migrate cannot be used together.',
    );
  });
});
