/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {remark} from 'remark';
import directives from 'remark-directive';
import mdx from 'remark-mdx';
import {read} from 'to-vfile';
import preprocessor from '../../../preprocessor';
import plugin, {DefaultAdmonitionOptions} from '../index';
import type {AdmonitionOptions} from '../index';
import type {MarkdownConfig} from '@docusaurus/types';

const processFixture = async (
  name: string,
  options?: Partial<AdmonitionOptions>,
) => {
  const filePath = path.join(__dirname, '__fixtures__', `${name}.md`);
  const file = await read(filePath);
  const fileContentPreprocessed = preprocessor({
    fileContent: file.toString(),
    filePath,
    admonitions: DefaultAdmonitionOptions,
    markdownConfig: {
      mermaid: false,
      mdx1Compat: {
        admonitions: true,
        comments: false,
        headingIds: true,
      },
    } as MarkdownConfig,
  });

  const result = await remark()
    .use(directives)
    .use(plugin, options ?? {})
    .use(mdx)
    .process(fileContentPreprocessed);

  return result.value;
};

describe('admonitions remark plugin', () => {
  it('base', async () => {
    const result = await processFixture('base');
    await expect(result).toMatchSnapshot();
  });

  it('default behavior for custom keyword', async () => {
    const result = await processFixture('base', {
      keywords: ['tip'],
      extendDefaults: undefined, // By default we extend
    });
    expect(result).toMatchSnapshot();
  });

  it('add custom keyword', async () => {
    const result = await processFixture('base', {
      keywords: ['tip'],
      extendDefaults: true,
    });
    expect(result).toMatchSnapshot();
  });

  it('replace custom keyword', async () => {
    const result = await processFixture('base', {
      keywords: ['tip'],
      extendDefaults: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('interpolation', async () => {
    const result = await processFixture('interpolation');
    expect(result).toMatchSnapshot();
  });

  it('nesting', async () => {
    const result = await processFixture('nesting');
    expect(result).toMatchSnapshot();
  });

  it('attributes', async () => {
    const result = await processFixture('attributes');
    await expect(result).toMatchSnapshot();
  });
});
