/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {remark} from 'remark';
import mdx from 'remark-mdx';
import head from '..';

async function process(content: string) {
  const result = await remark().use(mdx).use(head).process(content);

  return result.value;
}

describe('head remark plugin', () => {
  it("does nothing if there's no details", async () => {
    const input = `# Heading

<head>
  <html className="some-extra-html-class" />
  <body className="other-extra-body-class" />
  <title>Head Metadata customized title!</title>
  <meta charSet="utf-8" />
  <meta name="twitter:card" content="summary" />
  <link rel="canonical" href="https://docusaurus.io/docs/markdown-features/head-metadata" />
</head>

Some content
`;
    const result = await process(input);
    expect(result).toEqual(result);
  });

  it('can convert head', async () => {
    const input = `# Heading

<head>
  <html className="some-extra-html-class" />
  <body className="other-extra-body-class" />
  <title>Head Metadata customized title!</title>
  <meta charSet="utf-8" />
  <meta name="twitter:card" content="summary" />
  <link rel="canonical" href="https://docusaurus.io/docs/markdown-features/head-metadata" />
</head>

Some content;`;

    const result = await process(input);

    expect(result).toMatchInlineSnapshot(`
      "# Heading

      <Head>
        <html className="some-extra-html-class" />

        <body className="other-extra-body-class" />

        <title>Head Metadata customized title!</title>

        <meta charSet="utf-8" />

        <meta name="twitter:card" content="summary" />

        <link rel="canonical" href="https://docusaurus.io/docs/markdown-features/head-metadata" />
      </Head>

      Some content;
      "
    `);
  });
});
