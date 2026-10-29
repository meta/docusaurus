/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import gfm from 'remark-gfm';
import {compile} from '@mdx-js/mdx';
import {read} from 'to-vfile';
import plugin from '../index';
import headings from '../../headings/index';

const processFixture = async (name: string) => {
  const filePath = path.join(
    __dirname,
    '__fixtures__',
    name.endsWith('.mdx') ? name : `${name}.md`,
  );

  const file = await read(filePath);

  const result = await compile(file, {
    format: 'mdx',
    remarkPlugins: [[headings, {anchorsMaintainCase: false}], gfm, plugin],
    rehypePlugins: [],
  });

  return result.value;
};

describe('toc remark plugin', () => {
  it('outputs empty array for no TOC', async () => {
    const result = await processFixture('no-heading');
    expect(result).toMatchSnapshot();
  });

  // A very implicit API: we allow users to hand-write the toc variable. It will
  // get overwritten in most cases, but until we find a better way, better keep
  // supporting this
  it('does not overwrite TOC var if no TOC', async () => {
    const result = await processFixture('no-heading-with-toc-export');
    expect(result).toMatchSnapshot();
  });

  it('works on non text phrasing content', async () => {
    const result = await processFixture('non-text-content');
    expect(result).toMatchSnapshot();
  });

  it('escapes inline code', async () => {
    const result = await processFixture('inline-code');
    expect(result).toMatchSnapshot();
  });

  it('works on text content', async () => {
    const result = await processFixture('just-content');
    expect(result).toMatchSnapshot();
  });

  it('exports even with existing name', async () => {
    const result = await processFixture('name-exist');
    expect(result).toMatchSnapshot();
  });

  it('inserts below imports', async () => {
    const result = await processFixture('insert-below-imports');
    expect(result).toMatchSnapshot();
  });

  it('handles empty headings', async () => {
    const result = await processFixture('empty-headings');
    expect(result).toMatchSnapshot();
  });

  it('works with imported markdown', async () => {
    const result = await processFixture('partials/index.mdx');
    expect(result).toMatchSnapshot();
  });

  it('works with partials importing other partials', async () => {
    const result = await processFixture('partials/_partial2.mdx');
    expect(result).toMatchSnapshot();
  });

  it('works with partial imported after its usage', async () => {
    const result = await processFixture(
      'partials/partial-used-before-import.mdx',
    );
    expect(result).toMatchSnapshot();
  });
});
