/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import * as path from 'node:path';
import {remark} from 'remark';
import mdx from 'remark-mdx';
import {read} from 'to-vfile';
import plugin, {type PluginOptions} from '../index';

const siteDir = path.join(__dirname, '__fixtures__');

const staticDirs = [
  path.join(__dirname, '__fixtures__/static'),
  path.join(__dirname, '__fixtures__/static2'),
];

const getProcessor = (options?: Partial<PluginOptions>) => {
  return remark()
    .use(mdx)
    .use(plugin, {
      siteDir,
      staticDirs,
      onBrokenMarkdownImages: 'throw',
      ...options,
    });
};

const processFixture = async (
  name: string,
  options?: Partial<PluginOptions>,
) => {
  const filePath = path.join(__dirname, `__fixtures__/${name}.md`);
  const file = await read(filePath);
  const processor = getProcessor(options);
  const result = await processor.process(file);
  return result.value;
};

const processContent = async (
  content: string,
  options?: Partial<PluginOptions>,
) => {
  const processor = getProcessor(options);
  const result = await processor.process({
    value: content,
    path: path.posix.join(siteDir, 'docs', 'myFile.mdx'),
  });
  return result.value.toString();
};

describe('transformImage plugin', () => {
  it('transform md images to <img />', async () => {
    // TODO split that large fixture into many smaller test cases?
    const result = await processFixture('img');
    expect(result).toMatchSnapshot();
  });

  it('pathname protocol', async () => {
    const result = await processContent(
      `![img](pathname:///img/unchecked.png)`,
    );
    expect(result).toMatchSnapshot();
  });

  it('does not HTML-escape alt and title', async () => {
    const result = await processContent(
      `![It's a "quoted" & alt](/img.png "It's a 'quoted' & title")`,
    );
    // &#x22; is how remark-mdx serializes " in a double-quoted attribute
    expect(result).toMatchInlineSnapshot(`
      "<img alt="It's a &#x22;quoted&#x22; & alt" src={require("!./../static/img.png?docusaurus-asset=image")} title="It's a 'quoted' & title" width="200" height="200" />
      "
    `);
  });

  it('does not choke on invalid image', async () => {
    using warn = vi.spyOn(console, 'warn');
    const result = await processContent(`![invalid image](/invalid.png)`);
    expect(result).toMatchSnapshot();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  describe('onBrokenMarkdownImages', () => {
    const fixtures = {
      doesNotExistAbsolute: `![img](/img/doesNotExist.png)`,
      doesNotExistRelative: `![img](./doesNotExist.png)`,
      doesNotExistSiteAlias: `![img](@site/doesNotExist.png)`,
      urlEmpty: `![img]()`,
    };

    describe('throws', () => {
      it('if image absolute path does not exist', async () => {
        await expect(processContent(fixtures.doesNotExistAbsolute)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Markdown image with URL \`/img/doesNotExist.png\` in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved to an existing local image file.
          To ignore this error, use the \`siteConfig.markdown.hooks.onBrokenMarkdownImages\` option, or apply the \`pathname://\` protocol to the broken image URLs.]
        `);
      });

      it('if image relative path does not exist', async () => {
        await expect(processContent(fixtures.doesNotExistRelative)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Markdown image with URL \`./doesNotExist.png\` in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved to an existing local image file.
          To ignore this error, use the \`siteConfig.markdown.hooks.onBrokenMarkdownImages\` option, or apply the \`pathname://\` protocol to the broken image URLs.]
        `);
      });

      it('if image @site path does not exist', async () => {
        await expect(processContent(fixtures.doesNotExistSiteAlias)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Markdown image with URL \`@site/doesNotExist.png\` in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved to an existing local image file.
          To ignore this error, use the \`siteConfig.markdown.hooks.onBrokenMarkdownImages\` option, or apply the \`pathname://\` protocol to the broken image URLs.]
        `);
      });

      it('if image url empty', async () => {
        await expect(processContent(fixtures.urlEmpty)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Markdown image with empty URL found in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1).
          To ignore this error, use the \`siteConfig.markdown.hooks.onBrokenMarkdownImages\` option, or apply the \`pathname://\` protocol to the broken image URLs.]
        `);
      });
    });

    describe('warns', () => {
      function processWarn(content: string) {
        return processContent(content, {onBrokenMarkdownImages: 'warn'});
      }

      it('if image absolute path does not exist', async () => {
        using warn = vi.spyOn(console, 'warn');
        const result = await processWarn(fixtures.doesNotExistAbsolute);
        expect(result).toMatchInlineSnapshot(`
          "![img](/img/doesNotExist.png)
          "
        `);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "[WARNING] Markdown image with URL \`/img/doesNotExist.png\` in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved to an existing local image file.",
            ],
          ]
        `);
      });

      it('if image relative path does not exist', async () => {
        using warn = vi.spyOn(console, 'warn');
        const result = await processWarn(fixtures.doesNotExistRelative);
        expect(result).toMatchInlineSnapshot(`
          "![img](./doesNotExist.png)
          "
        `);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "[WARNING] Markdown image with URL \`./doesNotExist.png\` in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved to an existing local image file.",
            ],
          ]
        `);
      });

      it('if image @site path does not exist', async () => {
        using warn = vi.spyOn(console, 'warn');
        const result = await processWarn(fixtures.doesNotExistSiteAlias);
        expect(result).toMatchInlineSnapshot(`
          "![img](@site/doesNotExist.png)
          "
        `);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "[WARNING] Markdown image with URL \`@site/doesNotExist.png\` in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved to an existing local image file.",
            ],
          ]
        `);
      });

      it('if image url empty', async () => {
        using warn = vi.spyOn(console, 'warn');
        const result = await processWarn(fixtures.urlEmpty);
        expect(result).toMatchInlineSnapshot(`
          "![img]()
          "
        `);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "[WARNING] Markdown image with empty URL found in source file "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx" (1:1).",
            ],
          ]
        `);
      });
    });

    describe('function form', () => {
      function processWarn(content: string) {
        return processContent(content, {
          onBrokenMarkdownImages: (params) => {
            console.log('onBrokenMarkdownImages called for ', params);
            // We can alter the AST Node
            params.node.alt = 'new 404 alt';
            params.node.url = 'ignored, less important than returned value';
            // Or return a new URL
            return '/404.png';
          },
        });
      }

      it('if image absolute path does not exist', async () => {
        using log = vi.spyOn(console, 'log');

        const result = await processWarn(fixtures.doesNotExistAbsolute);
        expect(result).toMatchInlineSnapshot(`
          "![new 404 alt](/404.png)
          "
        `);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onBrokenMarkdownImages called for ",
              {
                "node": {
                  "alt": "new 404 alt",
                  "position": {
                    "end": {
                      "column": 30,
                      "line": 1,
                      "offset": 29,
                    },
                    "start": {
                      "column": 1,
                      "line": 1,
                      "offset": 0,
                    },
                  },
                  "title": null,
                  "type": "image",
                  "url": "/404.png",
                },
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx",
                "url": "/img/doesNotExist.png",
              },
            ],
          ]
        `);
      });

      it('if image relative path does not exist', async () => {
        using log = vi.spyOn(console, 'log');

        const result = await processWarn(fixtures.doesNotExistRelative);
        expect(result).toMatchInlineSnapshot(`
          "![new 404 alt](/404.png)
          "
        `);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onBrokenMarkdownImages called for ",
              {
                "node": {
                  "alt": "new 404 alt",
                  "position": {
                    "end": {
                      "column": 27,
                      "line": 1,
                      "offset": 26,
                    },
                    "start": {
                      "column": 1,
                      "line": 1,
                      "offset": 0,
                    },
                  },
                  "title": null,
                  "type": "image",
                  "url": "/404.png",
                },
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx",
                "url": "./doesNotExist.png",
              },
            ],
          ]
        `);
      });

      it('if image @site path does not exist', async () => {
        using log = vi.spyOn(console, 'log');

        const result = await processWarn(fixtures.doesNotExistSiteAlias);
        expect(result).toMatchInlineSnapshot(`
          "![new 404 alt](/404.png)
          "
        `);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onBrokenMarkdownImages called for ",
              {
                "node": {
                  "alt": "new 404 alt",
                  "position": {
                    "end": {
                      "column": 31,
                      "line": 1,
                      "offset": 30,
                    },
                    "start": {
                      "column": 1,
                      "line": 1,
                      "offset": 0,
                    },
                  },
                  "title": null,
                  "type": "image",
                  "url": "/404.png",
                },
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx",
                "url": "@site/doesNotExist.png",
              },
            ],
          ]
        `);
      });

      it('if image url empty', async () => {
        using log = vi.spyOn(console, 'log');

        const result = await processWarn(fixtures.urlEmpty);
        expect(result).toMatchInlineSnapshot(`
          "![new 404 alt](/404.png)
          "
        `);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onBrokenMarkdownImages called for ",
              {
                "node": {
                  "alt": "new 404 alt",
                  "position": {
                    "end": {
                      "column": 9,
                      "line": 1,
                      "offset": 8,
                    },
                    "start": {
                      "column": 1,
                      "line": 1,
                      "offset": 0,
                    },
                  },
                  "title": null,
                  "type": "image",
                  "url": "/404.png",
                },
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/transformImage/__tests__/__fixtures__/docs/myFile.mdx",
                "url": "",
              },
            ],
          ]
        `);
      });
    });
  });
});
