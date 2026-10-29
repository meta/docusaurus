/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {remark} from 'remark';
import remark2rehype from 'remark-rehype';
import stringify from 'rehype-stringify';
import mermaid from '..';

async function process(content: string) {
  const result = await remark()
    .use(mermaid)
    .use(remark2rehype)
    .use(stringify)
    .process(content);

  return result.value;
}

describe('mermaid remark plugin', () => {
  it("does nothing if there's no mermaid code block", async () => {
    const result = await process(
      `# Heading 1

No Mermaid diagram :(

\`\`\`js
this is not mermaid
\`\`\`
`,
    );

    expect(result).toMatchInlineSnapshot(`
      "<h1>Heading 1</h1>
      <p>No Mermaid diagram :(</p>
      <pre><code class="language-js">this is not mermaid
      </code></pre>"
    `);
  });

  it('works for basic mermaid code blocks', async () => {
    const result = await process(`# Heading 1

\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\``);
    expect(result).toMatchInlineSnapshot(`
      "<h1>Heading 1</h1>
      <mermaid value="graph TD;
          A-->B;
          A-->C;
          B-->D;
          C-->D;"></mermaid>"
    `);
  });
});
