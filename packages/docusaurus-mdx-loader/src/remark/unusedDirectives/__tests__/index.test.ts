/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import {remark} from 'remark';
import directives from 'remark-directive';
import remark2rehype from 'remark-rehype';
import stringify from 'rehype-stringify';
import {read} from 'to-vfile';
import plugin, {type PluginOptions} from '../index';
import admonition from '../../admonitions';
import type {WebpackCompilerName} from '@docusaurus/utils';

const getProcessor = (options?: Partial<PluginOptions>) => {
  return remark()
    .use(directives)
    .use(admonition)
    .use(plugin, {
      onUnusedMarkdownDirectives: 'warn',
      ...options,
    })
    .use(remark2rehype)
    .use(stringify);
};

const processFixture = async (
  name: string,
  {compilerName}: {compilerName: WebpackCompilerName},
  options?: Partial<PluginOptions>,
) => {
  const processor = getProcessor(options);

  const filePath = path.join(__dirname, '__fixtures__', `${name}.md`);
  const file = await read(filePath);
  file.data.compilerName = compilerName;

  const result = await processor.process(file);

  return result.value;
};

describe('directives remark plugin - client compiler', () => {
  const fileData = {compilerName: 'client'} as const;

  it('default behavior for container directives', async () => {
    using warn = vi.spyOn(console, 'warn');
    const result = await processFixture('containerDirectives', fileData);
    expect(result).toMatchSnapshot('result');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls).toMatchSnapshot('console');
  });

  it('default behavior for leaf directives', async () => {
    using warn = vi.spyOn(console, 'warn');
    const result = await processFixture('leafDirectives', fileData);
    expect(result).toMatchSnapshot('result');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls).toMatchSnapshot('console');
  });

  it('default behavior for text directives', async () => {
    using warn = vi.spyOn(console, 'warn');
    const result = await processFixture('textDirectives', fileData);
    expect(result).toMatchSnapshot('result');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls).toMatchSnapshot('console');
  });

  describe('onUnusedMarkdownDirectives', () => {
    describe('throws', () => {
      const options = {onUnusedMarkdownDirectives: 'throw'} as const;
      it('if file contains unused container directive', async () => {
        await expect(processFixture('containerDirectives', fileData, options))
          .rejects.toThrowErrorMatchingInlineSnapshot(`
          [Error: Docusaurus found 1 unused Markdown directives in file "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/containerDirectives.md"
          - :::unusedDirective (7:1)
          Your content might render in an unexpected way. Visit https://github.com/facebook/docusaurus/pull/9394 to find out why and how to fix it.
          To ignore this error, use the \`siteConfig.markdown.hooks.onUnusedMarkdownDirectives\` option.]
        `);
      });
      it('if file contains unused leaf directive', async () => {
        await expect(processFixture('leafDirectives', fileData, options))
          .rejects.toThrowErrorMatchingInlineSnapshot(`
          [Error: Docusaurus found 1 unused Markdown directives in file "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/leafDirectives.md"
          - ::unusedLeafDirective (1:1)
          Your content might render in an unexpected way. Visit https://github.com/facebook/docusaurus/pull/9394 to find out why and how to fix it.
          To ignore this error, use the \`siteConfig.markdown.hooks.onUnusedMarkdownDirectives\` option.]
        `);
      });
      it('if file contains unused text directive', async () => {
        await expect(processFixture('textDirectives', fileData, options))
          .rejects.toThrowErrorMatchingInlineSnapshot(`
          [Error: Docusaurus found 2 unused Markdown directives in file "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/textDirectives.md"
          - :textDirective3 (9:7)
          - :textDirective4 (11:7)
          Your content might render in an unexpected way. Visit https://github.com/facebook/docusaurus/pull/9394 to find out why and how to fix it.
          To ignore this error, use the \`siteConfig.markdown.hooks.onUnusedMarkdownDirectives\` option.]
        `);
      });
      it('if file contains removed caution admonition, with hint', async () => {
        await expect(processFixture('cautionAdmonition', fileData, options))
          .rejects.toThrowErrorMatchingInlineSnapshot(`
          [Error: Docusaurus found 1 unused Markdown directives in file "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/cautionAdmonition.md"
          - :::caution (7:1) - the :::caution admonition has been removed in Docusaurus v4, use :::warning instead
          Your content might render in an unexpected way. Visit https://github.com/facebook/docusaurus/pull/9394 to find out why and how to fix it.
          To ignore this error, use the \`siteConfig.markdown.hooks.onUnusedMarkdownDirectives\` option.]
        `);
      });
      it('if file contains removed legacy admonition aliases, with hints', async () => {
        await expect(
          processFixture('legacyAdmonitionAliases', fileData, options),
        ).rejects.toThrowErrorMatchingInlineSnapshot(`
          [Error: Docusaurus found 3 unused Markdown directives in file "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/legacyAdmonitionAliases.md"
          - :::secondary (7:1) - the :::secondary admonition has been removed in Docusaurus v4, use :::note instead
          - :::success (13:1) - the :::success admonition has been removed in Docusaurus v4, use :::tip instead
          - :::important (19:1) - the :::important admonition has been removed in Docusaurus v4, use :::info instead
          Your content might render in an unexpected way. Visit https://github.com/facebook/docusaurus/pull/9394 to find out why and how to fix it.
          To ignore this error, use the \`siteConfig.markdown.hooks.onUnusedMarkdownDirectives\` option.]
        `);
      });
    });

    describe('function form', () => {
      const options: PluginOptions = {
        onUnusedMarkdownDirectives: (params) => {
          console.log('onUnusedMarkdownDirectives called with', params);
          // We can alter the AST Node
          params.directives.forEach((directive) => {
            directive.name = `fixed-${directive.name}`;
            directive.children = [];
          });
        },
      };
      it('if file contains unused container directive', async () => {
        using log = vi.spyOn(console, 'log');
        const result = await processFixture(
          'containerDirectives',
          fileData,
          options,
        );
        expect(result).toMatchSnapshot('result');
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onUnusedMarkdownDirectives called with",
              {
                "directives": [
                  {
                    "attributes": {},
                    "children": [],
                    "name": "fixed-unusedDirective",
                    "position": {
                      "end": {
                        "column": 4,
                        "line": 11,
                        "offset": 93,
                      },
                      "start": {
                        "column": 1,
                        "line": 7,
                        "offset": 44,
                      },
                    },
                    "type": "containerDirective",
                  },
                ],
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/containerDirectives.md",
              },
            ],
          ]
        `);
      });
      it('if file contains unused leaf directive', async () => {
        using log = vi.spyOn(console, 'log');
        const result = await processFixture(
          'leafDirectives',
          fileData,
          options,
        );
        expect(result).toMatchSnapshot('result');
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onUnusedMarkdownDirectives called with",
              {
                "directives": [
                  {
                    "attributes": {},
                    "children": [],
                    "name": "fixed-unusedLeafDirective",
                    "position": {
                      "end": {
                        "column": 22,
                        "line": 1,
                        "offset": 21,
                      },
                      "start": {
                        "column": 1,
                        "line": 1,
                        "offset": 0,
                      },
                    },
                    "type": "leafDirective",
                  },
                ],
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/leafDirectives.md",
              },
            ],
          ]
        `);
      });
      it('if file contains unused text directive', async () => {
        using log = vi.spyOn(console, 'log');
        const result = await processFixture(
          'textDirectives',
          fileData,
          options,
        );
        expect(result).toMatchSnapshot('result');
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onUnusedMarkdownDirectives called with",
              {
                "directives": [
                  {
                    "attributes": {},
                    "children": [],
                    "name": "fixed-textDirective3",
                    "position": {
                      "end": {
                        "column": 29,
                        "line": 9,
                        "offset": 112,
                      },
                      "start": {
                        "column": 7,
                        "line": 9,
                        "offset": 90,
                      },
                    },
                    "type": "textDirective",
                  },
                  {
                    "attributes": {
                      "age": "42",
                    },
                    "children": [],
                    "name": "fixed-textDirective4",
                    "position": {
                      "end": {
                        "column": 30,
                        "line": 11,
                        "offset": 143,
                      },
                      "start": {
                        "column": 7,
                        "line": 11,
                        "offset": 120,
                      },
                    },
                    "type": "textDirective",
                  },
                ],
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/unusedDirectives/__tests__/__fixtures__/textDirectives.md",
              },
            ],
          ]
        `);
      });
    });

    describe('ignore', () => {
      const options = {onUnusedMarkdownDirectives: 'ignore'} as const;
      it('if file contains unused container directive', async () => {
        using warn = vi.spyOn(console, 'warn');
        using log = vi.spyOn(console, 'log');
        const result = await processFixture(
          'containerDirectives',
          fileData,
          options,
        );
        expect(result).toMatchSnapshot('result');
        expect(log).toHaveBeenCalledTimes(0);
        expect(warn).toHaveBeenCalledTimes(0);
      });
      it('if file contains unused leaf directive', async () => {
        using warn = vi.spyOn(console, 'warn');
        using log = vi.spyOn(console, 'log');
        const result = await processFixture(
          'leafDirectives',
          fileData,
          options,
        );
        expect(result).toMatchSnapshot('result');
        expect(log).toHaveBeenCalledTimes(0);
        expect(warn).toHaveBeenCalledTimes(0);
      });
      it('if file contains unused text directive', async () => {
        using warn = vi.spyOn(console, 'warn');
        using log = vi.spyOn(console, 'log');
        const result = await processFixture(
          'textDirectives',
          fileData,
          options,
        );
        expect(result).toMatchSnapshot('result');
        expect(log).toHaveBeenCalledTimes(0);
        expect(warn).toHaveBeenCalledTimes(0);
      });
    });
  });
});

describe('directives remark plugin - server compiler', () => {
  const fileData = {compilerName: 'server'} as const;

  it('default behavior for container directives', async () => {
    using warn = vi.spyOn(console, 'warn');
    const result = await processFixture('containerDirectives', fileData);
    expect(result).toMatchSnapshot('result');
    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('default behavior for leaf directives', async () => {
    using warn = vi.spyOn(console, 'warn');
    const result = await processFixture('leafDirectives', fileData);
    expect(result).toMatchSnapshot('result');
    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('default behavior for text directives', async () => {
    using warn = vi.spyOn(console, 'warn');
    const result = await processFixture('textDirectives', fileData);
    expect(result).toMatchSnapshot('result');
    expect(warn).toHaveBeenCalledTimes(0);
  });
});

describe('directives remark plugin - client result === server result', () => {
  // It is important that client/server outputs are exactly the same
  // otherwise React hydration mismatches can occur
  async function testSameResult(name: string) {
    const resultClient = await processFixture(name, {compilerName: 'client'});
    const resultServer = await processFixture(name, {compilerName: 'server'});
    expect(resultClient).toEqual(resultServer);
  }

  it('for containerDirectives', async () => {
    await testSameResult('containerDirectives');
  });

  it('for leafDirectives', async () => {
    await testSameResult('leafDirectives');
  });

  it('for textDirectives', async () => {
    await testSameResult('textDirectives');
  });
});
