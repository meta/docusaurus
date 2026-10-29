/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* Based on remark-slug (https://github.com/remarkjs/remark-slug) and gatsby-remark-autolink-headers (https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-remark-autolink-headers) */

import {describe, expect, it} from 'vitest';
import {remark} from 'remark';
import mdx from 'remark-mdx';
import {u} from 'unist-builder';
import {visit} from 'unist-util-visit';
import {escapeMarkdownHeadingIds} from '@docusaurus/utils';
import plugin from '../index';
import type {PluginOptions} from '../index';
import type {Plugin} from 'unified';
import type {Parent, Node} from 'unist';
import type {Heading, Root} from 'mdast';

function removePositions(tree: Node) {
  visit(tree, (node) => {
    delete node.position;
    // cleanup positions in JSX attributes too
    (node as any).attributes?.forEach(removePositions);
  });
}

async function process(
  input: string,
  plugins: Plugin[] = [],
  options: Partial<PluginOptions> = {anchorsMaintainCase: false},
  format: 'md' | 'mdx' = 'mdx',
): Promise<Root> {
  let content = input;
  let formatPlugins: Plugin[] = [];

  if (format === 'mdx') {
    // Preprocess the input to support our invalid heading ids syntax
    content = escapeMarkdownHeadingIds(input);
    formatPlugins = [mdx];
  }

  const processor = remark().use({
    plugins: [...formatPlugins, ...plugins, [plugin, options]],
  });

  const result = await processor.run(processor.parse(content));
  removePositions(result);

  return result as unknown as Root;
}

function h(text: string | null, depth: number, id: string) {
  return u(
    'heading',
    {depth, data: {id, hProperties: {id}}},
    text ? [u('text', text)] : [],
  );
}

describe('headings remark plugin', () => {
  it('patches `id`s and `data.hProperties.id', async () => {
    const result = await process('# Normal\n\n## Table of Contents\n\n# Baz\n');
    const expected = u('root', [
      h('Normal', 1, 'normal'),
      u(
        'heading',
        {
          depth: 2,
          data: {
            hProperties: {id: 'table-of-contents'},
            id: 'table-of-contents',
          },
        },
        [u('text', 'Table of Contents')],
      ),
      u('heading', {depth: 1, data: {hProperties: {id: 'baz'}, id: 'baz'}}, [
        u('text', 'Baz'),
      ]),
    ]);

    expect(result).toEqual(expected);
  });

  it('does not overwrite `data` on headings', async () => {
    const result = await process('# Normal\n', [
      () => (root) => {
        // @ts-expect-error: test unknown data
        (root as Parent).children[0]!.data = {foo: 'bar'};
      },
    ]);
    const expected = u('root', [
      u(
        'heading',
        {
          depth: 1,
          data: {foo: 'bar', hProperties: {id: 'normal'}, id: 'normal'},
        },
        [u('text', 'Normal')],
      ),
    ]);

    expect(result).toEqual(expected);
  });

  it('does not overwrite `data.hProperties` on headings', async () => {
    const result = await process('# Normal\n', [
      () => (root) => {
        (root as Parent).children[0]!.data = {
          hProperties: {className: ['foo']},
        };
      },
    ]);
    const expected = u('root', [
      u(
        'heading',
        {
          depth: 1,
          data: {hProperties: {className: ['foo'], id: 'normal'}, id: 'normal'},
        },
        [u('text', 'Normal')],
      ),
    ]);

    expect(result).toEqual(expected);
  });

  it('generates `id`s and `hProperties.id`s, based on `hProperties.id` if they exist', async () => {
    const result = await process(
      [
        '## Something',
        '## Something here',
        '## Something there',
        '## Something also',
      ].join('\n\n'),
      [
        function customIdPlugin() {
          return (root) => {
            (root as Parent).children[1]!.data = {hProperties: {id: 'here'}};
            (root as Parent).children[3]!.data = {
              hProperties: {id: 'something'},
            };
          };
        },
      ],
    );
    const expected = u('root', [
      u(
        'heading',
        {
          depth: 2,
          data: {hProperties: {id: 'something'}, id: 'something'},
        },
        [u('text', 'Something')],
      ),
      u(
        'heading',
        {
          depth: 2,
          data: {hProperties: {id: 'here'}, id: 'here'},
        },
        [u('text', 'Something here')],
      ),
      u(
        'heading',
        {
          depth: 2,
          data: {hProperties: {id: 'something-there'}, id: 'something-there'},
        },
        [u('text', 'Something there')],
      ),
      u(
        'heading',
        {
          depth: 2,
          data: {hProperties: {id: 'something-1'}, id: 'something-1'},
        },
        [u('text', 'Something also')],
      ),
    ]);

    expect(result).toEqual(expected);
  });

  it('creates GitHub-style headings ids', async () => {
    const result = await process(
      [
        '## I ♥ unicode',
        '',
        '## Dash-dash',
        '',
        '## en–dash',
        '',
        '## em–dash',
        '',
        '## 😄 unicode emoji',
        '',
        '## 😄-😄 unicode emoji',
        '',
        '## 😄_😄 unicode emoji',
        '',
        '##',
        '',
        '## ',
        '',
        '##     Initial spaces',
        '',
        '## Final spaces   ',
        '',
        '## Duplicate',
        '',
        '## Duplicate',
        '',
        '## :ok: No underscore',
        '',
        '## :ok_hand: Single',
        '',
        '## :ok_hand::hatched_chick: Two in a row with no spaces',
        '',
        '## :ok_hand: :hatched_chick: Two in a row',
        '',
      ].join('\n'),
    );

    function heading(label: string | null, id: string) {
      return u(
        'heading',
        {depth: 2, data: {id, hProperties: {id}}},
        label ? [u('text', label)] : [],
      );
    }

    const expected = u('root', [
      heading('I ♥ unicode', 'i--unicode'),
      heading('Dash-dash', 'dash-dash'),
      // cSpell:ignore endash
      heading('en–dash', 'endash'),
      // cSpell:ignore emdash
      heading('em–dash', 'emdash'),
      heading('😄 unicode emoji', '-unicode-emoji'),
      heading('😄-😄 unicode emoji', '--unicode-emoji'),
      heading('😄_😄 unicode emoji', '_-unicode-emoji'),
      heading(null, ''),
      heading(null, '-1'),
      heading('Initial spaces', 'initial-spaces'),
      heading('Final spaces', 'final-spaces'),
      heading('Duplicate', 'duplicate'),
      heading('Duplicate', 'duplicate-1'),
      heading(':ok: No underscore', 'ok-no-underscore'),
      heading(':ok_hand: Single', 'ok_hand-single'),
      heading(
        ':ok_hand::hatched_chick: Two in a row with no spaces',
        // cSpell:ignore handhatched
        'ok_handhatched_chick-two-in-a-row-with-no-spaces',
      ),
      heading(
        ':ok_hand: :hatched_chick: Two in a row',
        'ok_hand-hatched_chick-two-in-a-row',
      ),
    ]);

    expect(result).toEqual(expected);
  });

  it('generates id from only text contents of headings if they contains HTML tags', async () => {
    const result = await process(
      '# <span class="normal-header">Normal</span>\n',
    );

    const expected = u('root', [
      u(
        'heading',
        {
          depth: 1,
          data: {hProperties: {id: 'normal'}, id: 'normal'},
        },
        [
          u('mdxJsxTextElement', {
            name: 'span',
            attributes: [
              u('mdxJsxAttribute', {
                name: 'class',
                value: 'normal-header',
              }),
            ],
            children: [u('text', 'Normal')],
          }),
        ],
      ),
    ]);

    expect(result).toEqual(expected);
  });

  describe('headings ids', () => {
    async function processHeading(
      input: string,
      format: 'md' | 'mdx' = 'mdx',
    ): Promise<Heading> {
      const result = await process(input, [], {}, format);
      const headings: Heading[] = [];
      visit(result, 'heading', (node) => {
        headings.push(node);
      });
      expect(headings).toHaveLength(1);
      return headings[0]!;
    }

    async function headingIdFor(
      input: string,
      format: 'md' | 'mdx' = 'mdx',
    ): Promise<string> {
      const {data} = await processHeading(input, format);
      return (data! as {id: string}).id;
    }

    describe('historical syntax', () => {
      // Shared test because it's the same syntax for both md and mdx
      async function testHeadingIds(format: 'md' | 'mdx') {
        await expect(
          headingIdFor('# Heading One {#custom_h1}', format),
        ).resolves.toEqual('custom_h1');
        await expect(
          headingIdFor('## Heading Two {#custom-heading-two}', format),
        ).resolves.toEqual('custom-heading-two');

        await expect(
          headingIdFor('# With *Bold* {#custom-with-bold}', format),
        ).resolves.toEqual('custom-with-bold');

        await expect(
          headingIdFor('# With *Bold* hello{#custom-with-bold-hello}', format),
        ).resolves.toEqual('custom-with-bold-hello');

        await expect(
          headingIdFor(
            '# With *Bold* hello2 {#custom-with-bold-hello2}',
            format,
          ),
        ).resolves.toEqual('custom-with-bold-hello2');

        await expect(
          headingIdFor('# Snake-cased ID {#this_is_custom_id}', format),
        ).resolves.toEqual('this_is_custom_id');

        await expect(headingIdFor('# No custom ID', format)).resolves.toEqual(
          'no-custom-id',
        );

        await expect(headingIdFor('# {#id-only}', format)).resolves.toEqual(
          'id-only',
        );

        // in this case, we don't parse the heading id: the id is the text slug
        await expect(
          headingIdFor('# {#text-after} custom ID', format),
        ).resolves.toEqual('text-after-custom-id');
      }
      it('works for format CommonMark', async () => {
        await testHeadingIds('md');
      });

      it('works for format MDX', async () => {
        await testHeadingIds('mdx');
      });
    });

    describe('comment syntax', () => {
      describe('works for format CommonMark', () => {
        it('extracts id from HTML comment with # prefix at end of heading', async () => {
          await expect(
            headingIdFor('# Heading One <!-- #custom_h1 -->', 'md'),
          ).resolves.toEqual('custom_h1');

          await expect(
            headingIdFor('## Heading Two <!-- #custom-heading-two -->', 'md'),
          ).resolves.toEqual('custom-heading-two');

          await expect(
            headingIdFor('# Snake-cased <!-- #this_is_custom_id -->', 'md'),
          ).resolves.toEqual('this_is_custom_id');
        });

        it('extracts id when comment is the only heading content', async () => {
          await expect(
            headingIdFor('# <!-- #id-only -->', 'md'),
          ).resolves.toEqual('id-only');
        });

        it('extracts id when heading has inline markup before comment', async () => {
          await expect(
            headingIdFor('# With *Bold* <!-- #custom-with-bold -->', 'md'),
          ).resolves.toEqual('custom-with-bold');
        });

        it('does NOT extract id when HTML comment is not the last node', async () => {
          await expect(
            headingIdFor('# <!-- #custom-id --> some text', 'md'),
          ).resolves.not.toEqual('custom-id');
        });

        it('does NOT extract id when HTML comment has no # prefix', async () => {
          const id = await headingIdFor('# Heading <!-- my-id -->', 'md');
          expect(id).not.toEqual('my-id');
          expect(id).toMatchInlineSnapshot(`"heading-"`);
        });

        it('does NOT extract id when HTML comment is just #', async () => {
          const id = await headingIdFor('## Heading <!-- # -->', 'md');
          expect(id).not.toEqual('');
          expect(id).toMatchInlineSnapshot(`"heading-"`);
        });

        it('extracts id when MDX comment has spaces', async () => {
          const id = await headingIdFor(
            '## Heading <!-- #id1 whatever comment #id2 -->',
            'md',
          );
          expect(id).toEqual('id1');
        });

        it('removes the comment node from heading AST', async () => {
          const heading = await processHeading(
            '## Heading <!-- #my-id -->',
            'md',
          );
          expect(heading).toEqual(h('Heading', 2, 'my-id'));
        });

        it('removes the comment node when it is the only heading content', async () => {
          const heading = await processHeading('## <!-- #id-only -->', 'md');
          expect(heading).toEqual(h(null, 2, 'id-only'));
        });

        it('does NOT support MDX comment syntax {/* #id */} in CommonMark', async () => {
          // In CommonMark (no remark-mdx), {/* #id */} is regular text
          const id = await headingIdFor('# Heading {/* #my-id */}', 'md');
          expect(id).not.toEqual('my-id');
        });
      });

      describe('works for format MDX', () => {
        it('extracts id from MDX comment with # prefix at end of heading', async () => {
          await expect(
            headingIdFor('# Heading One {/* #custom_h1 */}', 'mdx'),
          ).resolves.toEqual('custom_h1');

          await expect(
            headingIdFor('## Heading Two {/* #custom-heading-two */}', 'mdx'),
          ).resolves.toEqual('custom-heading-two');

          await expect(
            headingIdFor('# Snake-cased {/* #this_is_custom_id */}', 'mdx'),
          ).resolves.toEqual('this_is_custom_id');
        });

        it('extracts id when comment is the only heading content', async () => {
          await expect(
            headingIdFor('# {/* #id-only */}', 'mdx'),
          ).resolves.toEqual('id-only');
        });

        it('extracts id when heading has inline markup before comment', async () => {
          await expect(
            headingIdFor('# With *Bold* {/* #custom-with-bold */}', 'mdx'),
          ).resolves.toEqual('custom-with-bold');
        });

        it('does NOT extract id when MDX comment is not the last node', async () => {
          const id = await headingIdFor(
            '# {/* #custom-id */} some text',
            'mdx',
          );
          expect(id).not.toEqual('custom-id');
          expect(id).toMatchInlineSnapshot(`"-custom-id--some-text"`);
        });

        it('does NOT extract id when MDX comment is not the only part of the expression', async () => {
          const id = await headingIdFor(
            '# some text {someExpression /* #custom-id */}',
            'mdx',
          );
          expect(id).not.toEqual('custom-id');
          expect(id).toMatchInlineSnapshot(
            `"some-text-someexpression--custom-id-"`,
          );
        });

        it('does NOT extract id when MDX expression has multiple comments', async () => {
          const id = await headingIdFor(
            '# some text {/* #id1 *//* #id2 */}',
            'mdx',
          );
          expect(id).not.toEqual('id1');
          expect(id).not.toEqual('id2');
          expect(id).toMatchInlineSnapshot(`"some-text--id1--id2-"`);
        });

        it('does NOT extract id when MDX comment has no # prefix', async () => {
          const id = await headingIdFor('## Heading {/* my-id */}', 'mdx');
          expect(id).not.toEqual('my-id');
          expect(id).toMatchInlineSnapshot(`"heading--my-id-"`);
        });

        it('does NOT extract id when MDX comment is just #', async () => {
          const id = await headingIdFor('## Heading {/* # */}', 'mdx');
          expect(id).not.toEqual('');
          expect(id).toMatchInlineSnapshot(`"heading---"`);
        });

        it('extracts id when MDX comment has spaces', async () => {
          const id = await headingIdFor(
            '## Heading {/* #id1 whatever comment #id2 */}',
            'mdx',
          );
          expect(id).toEqual('id1');
        });

        it('removes the comment node from heading AST', async () => {
          const heading = await processHeading(
            '## Heading {/* #my-id */}',
            'mdx',
          );
          expect(heading).toEqual(h('Heading', 2, 'my-id'));
        });

        it('removes the comment node when it is the only heading content', async () => {
          const heading = await processHeading('## {/* #id-only */}', 'mdx');
          expect(heading).toEqual(h(null, 2, 'id-only'));
        });

        it('does NOT support HTML comment syntax <!-- #id --> in MDX', async () => {
          // MDX throws a parse error for HTML comments inside headings
          await expect(
            processHeading('## Heading <!-- #my-id -->', 'mdx'),
          ).rejects.toThrowErrorMatchingInlineSnapshot(
            `[1:13: Unexpected character \`!\` (U+0021) before name, expected a character that can start a name, such as a letter, \`$\`, or \`_\` (note: to create a comment in MDX, use \`{/* text */}\`)]`,
          );
        });
      });
    });
  });

  it('preserve anchors case then "anchorsMaintainCase" option is set', async () => {
    const result = await process('# Case Sensitive Heading', [], {
      anchorsMaintainCase: true,
    });
    const expected = u('root', [
      u(
        'heading',
        {
          depth: 1,
          data: {
            hProperties: {id: 'Case-Sensitive-Heading'},
            id: 'Case-Sensitive-Heading',
          },
        },
        [u('text', 'Case Sensitive Heading')],
      ),
    ]);

    expect(result).toEqual(expected);
  });
});
