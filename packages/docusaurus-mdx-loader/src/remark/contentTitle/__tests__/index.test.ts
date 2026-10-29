/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {remark} from 'remark';
import mdx from 'remark-mdx';
import {escapeMarkdownHeadingIds} from '@docusaurus/utils';
import plugin from '../index';

async function process(
  content: string,
  options: {removeContentTitle?: boolean} = {},
) {
  const result = await remark()
    .use(mdx)
    .use(plugin, options)
    .process(escapeMarkdownHeadingIds(content));

  return result;
}

describe('contentTitle remark plugin', () => {
  describe('extracts data.contentTitle', () => {
    it('extracts h1 heading', async () => {
      const result = await process(`
# contentTitle 1

## Heading Two {#custom-heading-two}

# contentTitle 2

some **markdown** *content*
  `);

      expect(result.data.contentTitle).toBe('contentTitle 1');
    });

    it('extracts h1 heading alt syntax', async () => {
      const result = await process(
        `
contentTitle alt
===

# contentTitle 1

## Heading Two {#custom-heading-two}

# contentTitle 2

some **markdown** *content*
  `,
      );

      expect(result.data.contentTitle).toBe('contentTitle alt');
    });

    it('works with no contentTitle', async () => {
      const result = await process(`
## Heading Two {#custom-heading-two}

some **markdown** *content*
  `);

      expect(result.data.contentTitle).toBeUndefined();
    });

    it('ignore contentTitle if not in first position', async () => {
      const result = await process(`
## Heading Two {#custom-heading-two}

# contentTitle 1

some **markdown** *content*
  `);

      expect(result.data.contentTitle).toBeUndefined();
    });

    it('ignore contentTitle if after thematic break', async () => {
      const result = await process(`

Hey

---

# contentTitle 1

some **markdown** *content*
  `);

      expect(result.data.contentTitle).toBeUndefined();
    });

    it('is able to decently serialize Markdown syntax', async () => {
      const result = await process(`
# some **markdown** \`content\` _italic_

some **markdown** *content*
  `);

      expect(result.data.contentTitle).toBe('some markdown content italic');
    });
  });

  describe('returns appropriate content', () => {
    it('returns heading wrapped in <header>', async () => {
      // Test case for https://github.com/facebook/docusaurus/issues/8476

      const content = `
# contentTitle 1

## Heading Two {#custom-heading-two}

# contentTitle 2

some **markdown** *content*
`.trim();

      const result = await process(content);

      expect(result.toString().trim()).toEqual(
        `
<header>
  # contentTitle 1
</header>

## Heading Two \\{#custom-heading-two}

# contentTitle 2

some **markdown** *content*
`.trim(),
      );
    });

    it('can strip contentTitle', async () => {
      const content = `
# contentTitle 1

## Heading Two {#custom-heading-two}

# contentTitle 2

some **markdown** *content*
`.trim();

      const result = await process(content, {removeContentTitle: true});

      expect(result.toString().trim()).toEqual(
        `
## Heading Two \\{#custom-heading-two}

# contentTitle 2

some **markdown** *content*
`.trim(),
      );
    });

    it('can strip contentTitle alt', async () => {
      const content = `
contentTitle alt
===

## Heading Two {#custom-heading-two}

# contentTitle 2

some **markdown** *content*
`.trim();

      const result = await process(content, {removeContentTitle: true});

      expect(result.toString().trim()).toEqual(
        `
## Heading Two \\{#custom-heading-two}

# contentTitle 2

some **markdown** *content*
`.trim(),
      );
    });
  });
});
