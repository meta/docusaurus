/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import React, {type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import _ from 'lodash';
import * as runtime from 'react/jsx-runtime';
import {run} from '@mdx-js/mdx';
import {visit} from 'unist-util-visit';
import {DEFAULT_PARSE_FRONT_MATTER} from '@docusaurus/utils';
import {compileToJSX} from '../utils';
import type {Options} from '../options';
import type {Root} from 'mdast';
import type {Root as HastRoot} from 'hast';
import type {Plugin} from 'unified';
import type {DeepPartial} from 'utility-types';

function createOptions(overrides: DeepPartial<Options> = {}): Options {
  const defaults: Options = {
    siteDir: __dirname,
    staticDirs: [],
    admonitions: true,
    markdownConfig: {
      format: 'mdx',
      parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
      mermaid: false,
      emoji: true,
      mdx1Compat: {comments: true, admonitions: true, headingIds: true},
      anchors: {maintainCase: false},
      remarkRehypeOptions: undefined,
      hooks: {
        onBrokenMarkdownLinks: 'throw',
        onBrokenMarkdownImages: 'throw',
        onUnusedMarkdownDirectives: 'throw',
      },
    },
  };
  return _.merge({}, defaults, overrides);
}

function processContent(content: string, options: Options) {
  return compileToJSX({
    fileContent: content,
    filePath: `${__dirname}/document.md`,
    frontMatter: {},
    compilerName: 'client',
    options,
  });
}

const TestMDXComponents = {
  admonition: ({
    type,
    title,
    className,
    id,
    children,
  }: {
    type: string;
    title?: ReactNode;
    className?: string;
    id?: string;
    children?: ReactNode;
  }) =>
    React.createElement(
      'aside',
      {'data-type': type, className, id},
      React.createElement('header', null, title ?? 'Default title'),
      children,
    ),
};

async function renderContent(content: string, options: Options) {
  // Options are passed through to MDX: compile a function body for run()
  const mdxOptions = {...options, outputFormat: 'function-body' as const};
  const result = await processContent(content, mdxOptions);
  const {default: Content} = await run(result.content, {
    ...runtime,
    useMDXComponents: () => TestMDXComponents,
  });
  return renderToStaticMarkup(React.createElement(Content));
}

describe('MDX processor', () => {
  describe.each(['md', 'mdx'] as const)('%s format', (format) => {
    it('compiles GFM tables', async () => {
      const options = createOptions({markdownConfig: {format}});
      const result = await processContent(
        '| a | b |\n| - | - |\n| c | d |',
        options,
      );
      expect(result.content).toMatchSnapshot();
    });

    it('extracts the content title', async () => {
      const options = createOptions({markdownConfig: {format}});
      const result = await processContent('# Title', options);
      expect(result.data.contentTitle).toBe('Title');
    });

    it('exports the table of contents', async () => {
      const options = createOptions({markdownConfig: {format}});
      const result = await processContent('## Heading', options);
      expect(result.content).toMatchSnapshot();
    });

    it('reuses the processor when compiling files concurrently', async () => {
      let pluginInitializations = 0;
      const asyncPlugin: Plugin<[], Root> = () => {
        pluginInitializations += 1;
        return async (_tree, file) => {
          await new Promise<void>((resolve) => setImmediate(resolve));
          file.data.asyncPluginContent = file.toString();
        };
      };
      const options = createOptions({
        markdownConfig: {format},
        remarkPlugins: [asyncPlugin],
      });

      const results = await Promise.all([
        processContent('First document', options),
        processContent('Second document', options),
      ]);

      expect(pluginInitializations).toBe(1);
      expect(results.map((result) => result.data.asyncPluginContent)).toEqual([
        'First document',
        'Second document',
      ]);
    });
  });

  describe('admonitions', () => {
    describe.each(['md', 'mdx'] as const)('%s format', (format) => {
      it('renders text titles and attributes', async () => {
        const html = await renderContent(
          ':::note[Title]{#custom-id .one .two}\nBody\n:::',
          createOptions({markdownConfig: {format}}),
        );
        expect(html).toBe(
          '<aside data-type="note" class="one two" id="custom-id"><header>Title</header><p>Body</p></aside>',
        );
      });

      it('passes rich titles through the title prop', async () => {
        const html = await renderContent(
          `::::note[**Outer** \`title\` :smile:]

:::tip[*Inner* [link](./document.md)]
Body
:::

::::`,
          createOptions({
            markdownConfig: {format},
            resolveMarkdownLink: () => '/resolved-link',
          }),
        );
        expect(html).toBe(
          '<aside data-type="note"><header><strong>Outer</strong> <code>title</code> 😄</header><aside data-type="tip"><header><em>Inner</em> <a href="/resolved-link">link</a></header><p>Body</p></aside></aside>',
        );
      });

      it('gives the title attribute precedence over the label', async () => {
        const html = await renderContent(
          ':::note[**Ignored**]{title="Explicit title"}\nBody\n:::',
          createOptions({markdownConfig: {format}}),
        );
        expect(html).toBe(
          '<aside data-type="note"><header>Explicit title</header><p>Body</p></aside>',
        );
      });

      it('renders title-only admonitions without children', async () => {
        const html = await renderContent(
          ':::note Title only\n:::\n\n:::tip[**Rich title only**]\n:::',
          createOptions({markdownConfig: {format}}),
        );
        expect(html).toBe(
          '<aside data-type="note"><header>Title only</header></aside>\n<aside data-type="tip"><header><strong>Rich title only</strong></header></aside>',
        );
      });

      it('keeps the default title for an empty label', async () => {
        const html = await renderContent(
          ':::note[]\nBody\n:::',
          createOptions({markdownConfig: {format}}),
        );
        expect(html).toBe(
          '<aside data-type="note"><header>Default title</header><p>Body</p></aside>',
        );
      });

      it('lets user plugins process rich titles', async () => {
        const remarkPlugin: Plugin<[], Root> = () => (tree) => {
          visit(tree, 'text', (node) => {
            node.value = node.value.replace('Title', 'Remark title');
          });
        };
        const rehypePlugin: Plugin<[], HastRoot> = () => (tree) => {
          visit(tree, 'element', (node) => {
            if (node.tagName === 'strong') {
              node.properties.title = 'Rehype title';
            }
          });
        };
        const html = await renderContent(
          ':::note[**Title**]\nBody\n:::',
          createOptions({
            markdownConfig: {format},
            remarkPlugins: [remarkPlugin],
            rehypePlugins: [rehypePlugin],
          }),
        );
        expect(html).toBe(
          '<aside data-type="note"><header><strong title="Rehype title">Remark title</strong></header><p>Body</p></aside>',
        );
      });

      it('transforms local images in rich titles', async () => {
        const result = await processContent(
          ':::note[![Title](../remark/transformImage/__tests__/__fixtures__/static/img.png)]\nBody\n:::',
          createOptions({markdownConfig: {format}}),
        );
        expect(result.content).toMatch(
          /title: _jsx\(_Fragment, \{\s+children: _jsx\(_components\.img, \{\s+alt: "Title",\s+src: require\(/,
        );
      });
    });

    it('renders raw HTML in titles with the md format', async () => {
      const html = await renderContent(
        ':::note[Hello <b>world</b>]\nBody\n:::',
        createOptions({markdownConfig: {format: 'md'}}),
      );
      expect(html).toBe(
        '<aside data-type="note"><header>Hello <b>world</b></header><p>Body</p></aside>',
      );
    });

    it('renders JSX and expressions in titles with the mdx format', async () => {
      const html = await renderContent(
        ':::tip[**Title** <span style={{color: "red"}}>{1 + 1}</span>]\nBody\n:::',
        createOptions({markdownConfig: {format: 'mdx'}}),
      );
      expect(html).toBe(
        '<aside data-type="tip"><header><strong>Title</strong> <span style="color:red">2</span></header><p>Body</p></aside>',
      );
    });

    it('can not be shadowed by a local Admonition component', async () => {
      const html = await renderContent(
        'export const Admonition = () => "Shadowed";\n\n:::note[Title]\nBody\n:::',
        createOptions({markdownConfig: {format: 'mdx'}}),
      );
      expect(html).toBe(
        '<aside data-type="note"><header>Title</header><p>Body</p></aside>',
      );
    });
  });

  it.each([true, false])('supports emoji=%s', async (emoji) => {
    const options = createOptions({markdownConfig: {emoji}});
    const result = await processContent(
      'Hello :smile: :unknown_shortcode:',
      options,
    );
    expect(result.content).toMatchSnapshot();
  });

  it('awaits async user plugins', async () => {
    const asyncPlugin: Plugin<[], Root> = () => async (_tree, file) => {
      await new Promise<void>((resolve) => setImmediate(resolve));
      file.data.asyncPluginCompleted = true;
    };
    const options = createOptions({remarkPlugins: [asyncPlugin]});
    const result = await processContent('Content', options);
    expect(result.data.asyncPluginCompleted).toBe(true);
  });

  it('preserves legacy comments', async () => {
    const options = createOptions();
    const result = await processContent('<!-- hidden comment -->', options);
    expect(result.content).toMatchSnapshot();
  });

  it('preserves legacy heading IDs', async () => {
    const options = createOptions();
    const result = await processContent('## Heading {#custom-id}', options);
    expect(result.content).toMatchSnapshot();
  });

  it('preserves legacy admonition titles', async () => {
    const options = createOptions();
    const result = await processContent(
      ':::note Custom title\nBody\n:::',
      options,
    );
    expect(result.content).toMatchSnapshot();
  });

  it('preserves raw HTML in CommonMark', async () => {
    const options = createOptions({markdownConfig: {format: 'md'}});
    const result = await processContent(
      '<div class="custom">HTML content</div>',
      options,
    );
    expect(result.content).toMatchSnapshot();
  });

  describe('remarkMdxOptions', () => {
    // See https://github.com/mdx-js/mdx/issues/2628
    const importAttributes = `import text from './file.txt' with {type: 'text'};

{text}`;

    it('parses import attributes by default (ES2025)', async () => {
      const options = createOptions({markdownConfig: {format: 'mdx'}});
      const result = await processContent(importAttributes, options);
      expect(result.content).toMatchSnapshot();
    });

    it('can downgrade to ES2024', async () => {
      const options = createOptions({
        markdownConfig: {format: 'mdx'},
        remarkMdxOptions: {
          acornOptions: {ecmaVersion: 2024, sourceType: 'module'},
        },
      });
      await expect(processContent(importAttributes, options)).rejects.toThrow(
        /Could not parse import\/exports with acorn/,
      );
    });

    it('does not apply to the md format', async () => {
      const options = createOptions({markdownConfig: {format: 'md'}});
      const result = await processContent(importAttributes, options);
      expect(result.content).toMatchSnapshot();
    });
  });
});
