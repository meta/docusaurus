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
import plugin, {type PluginOptions} from '..';
import transformImage from '../../transformImage';

const siteDir = path.join(__dirname, `__fixtures__`);

const staticDirs = [
  path.join(siteDir, 'static'),
  path.join(siteDir, 'static2'),
];

const getProcessor = (options?: Partial<PluginOptions>) => {
  return remark()
    .use(mdx)
    .use(transformImage, {
      siteDir,
      staticDirs,
      onBrokenMarkdownImages: 'throw',
    })
    .use(plugin, {
      staticDirs,
      siteDir,
      onBrokenMarkdownLinks: 'throw',
      ...options,
    });
};

const processFixture = async (
  name: string,
  options?: Partial<PluginOptions>,
) => {
  const processor = getProcessor(options);
  const file = await read(path.join(siteDir, `${name}.md`));
  const result = await processor.process(file);
  return result.value.toString().trim();
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
  return result.value.toString().trim();
};

describe('transformLinks plugin', () => {
  it('transform md links to <a />', async () => {
    // TODO split fixture in many smaller test cases
    const result = await processFixture('asset');
    expect(result).toMatchSnapshot();
  });

  it('pathname protocol', async () => {
    const result = await processContent(`pathname:///unchecked.pdf)`);
    expect(result).toMatchInlineSnapshot(`"pathname:///unchecked.pdf)"`);
  });

  it('does not HTML-escape title', async () => {
    const result = await processContent(
      `[asset](/staticAsset.pdf "It's a 'quoted' & title")`,
    );
    expect(result).toMatchInlineSnapshot(
      `"<a target="_blank" data-noBrokenLinkCheck={true} href={require("!./../static/staticAsset.pdf?docusaurus-asset=file")} title="It's a 'quoted' & title">asset</a>"`,
    );
  });

  it('accepts absolute file that does not exist', async () => {
    const result = await processContent(`[file](/dir/file.zip)`);
    expect(result).toMatchInlineSnapshot(`"[file](/dir/file.zip)"`);
  });

  it('accepts relative file that does not exist', async () => {
    const result = await processContent(`[file](dir/file.zip)`);
    expect(result).toMatchInlineSnapshot(`"[file](dir/file.zip)"`);
  });

  it('does not transform existing dotted directory links to asset requires', async () => {
    const result = await processContent(
      `[directory](../dotted-directory.whatever)`,
    );
    expect(result).toMatchInlineSnapshot(
      `"[directory](../dotted-directory.whatever)"`,
    );
  });

  it('does not transform absolute dotted directory links to asset requires', async () => {
    const result = await processContent(
      `[directory](/static-dotted-directory.test)`,
    );
    expect(result).toMatchInlineSnapshot(
      `"[directory](/static-dotted-directory.test)"`,
    );
  });

  describe('onBrokenMarkdownLinks', () => {
    const fixtures = {
      urlEmpty: `[empty]()`,
      fileDoesNotExistSiteAlias: `[file](@site/file.zip)`,
      directoryWithDotSiteAlias: `[dir](@site/dotted-directory.whatever)`,
    };

    describe('throws', () => {
      it('if url is empty', async () => {
        await expect(processContent(fixtures.urlEmpty)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Markdown link with empty URL found in source file "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx" (1:1).
          To ignore this error, use the \`siteConfig.markdown.hooks.onBrokenMarkdownLinks\` option, or apply the \`pathname://\` protocol to the broken link URLs.]
        `);
      });

      it('if file with site alias does not exist', async () => {
        await expect(processContent(fixtures.fileDoesNotExistSiteAlias)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Markdown link with URL \`@site/file.zip\` in source file "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved.
          Make sure it references a local Markdown file that exists within the current plugin.
          To ignore this error, use the \`siteConfig.markdown.hooks.onBrokenMarkdownLinks\` option, or apply the \`pathname://\` protocol to the broken link URLs.]
        `);
      });

      it('if site alias points to a directory with a dot', async () => {
        await expect(processContent(fixtures.directoryWithDotSiteAlias)).rejects
          .toThrowErrorMatchingInlineSnapshot(`
          [Error: Markdown link with URL \`@site/dotted-directory.whatever\` in source file "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved.
          Make sure it references a local Markdown file that exists within the current plugin.
          To ignore this error, use the \`siteConfig.markdown.hooks.onBrokenMarkdownLinks\` option, or apply the \`pathname://\` protocol to the broken link URLs.]
        `);
      });
    });

    describe('warns', () => {
      function processWarn(content: string) {
        return processContent(content, {onBrokenMarkdownLinks: 'warn'});
      }

      it('if url is empty', async () => {
        using warn = vi.spyOn(console, 'warn');
        const result = await processWarn(fixtures.urlEmpty);
        expect(result).toMatchInlineSnapshot(`"[empty]()"`);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "[WARNING] Markdown link with empty URL found in source file "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx" (1:1).",
            ],
          ]
        `);
      });

      it('if file with site alias does not exist', async () => {
        using warn = vi.spyOn(console, 'warn');
        const result = await processWarn(fixtures.fileDoesNotExistSiteAlias);
        expect(result).toMatchInlineSnapshot(`"[file](@site/file.zip)"`);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "[WARNING] Markdown link with URL \`@site/file.zip\` in source file "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved.
          Make sure it references a local Markdown file that exists within the current plugin.",
            ],
          ]
        `);
      });

      it('if site alias points to a directory with a dot', async () => {
        using warn = vi.spyOn(console, 'warn');
        const result = await processWarn(fixtures.directoryWithDotSiteAlias);
        expect(result).toMatchInlineSnapshot(
          `"[dir](@site/dotted-directory.whatever)"`,
        );
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "[WARNING] Markdown link with URL \`@site/dotted-directory.whatever\` in source file "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx" (1:1) couldn't be resolved.
          Make sure it references a local Markdown file that exists within the current plugin.",
            ],
          ]
        `);
      });
    });

    describe('function form', () => {
      function processWarn(content: string) {
        return processContent(content, {
          onBrokenMarkdownLinks: (params) => {
            console.log('onBrokenMarkdownLinks called with', params);
            // We can alter the AST Node
            params.node.title = 'fixed link title';
            params.node.url = 'ignored, less important than returned value';
            // Or return a new URL
            return '/404';
          },
        });
      }

      it('if url is empty', async () => {
        using log = vi.spyOn(console, 'log');
        const result = await processWarn(fixtures.urlEmpty);
        expect(result).toMatchInlineSnapshot(
          `"[empty](/404 "fixed link title")"`,
        );
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onBrokenMarkdownLinks called with",
              {
                "node": {
                  "children": [
                    {
                      "position": {
                        "end": {
                          "column": 7,
                          "line": 1,
                          "offset": 6,
                        },
                        "start": {
                          "column": 2,
                          "line": 1,
                          "offset": 1,
                        },
                      },
                      "type": "text",
                      "value": "empty",
                    },
                  ],
                  "position": {
                    "end": {
                      "column": 10,
                      "line": 1,
                      "offset": 9,
                    },
                    "start": {
                      "column": 1,
                      "line": 1,
                      "offset": 0,
                    },
                  },
                  "title": "fixed link title",
                  "type": "link",
                  "url": "/404",
                },
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx",
                "url": "",
              },
            ],
          ]
        `);
      });

      it('if file with site alias does not exist', async () => {
        using log = vi.spyOn(console, 'log');
        const result = await processWarn(fixtures.fileDoesNotExistSiteAlias);
        expect(result).toMatchInlineSnapshot(
          `"[file](/404 "fixed link title")"`,
        );
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onBrokenMarkdownLinks called with",
              {
                "node": {
                  "children": [
                    {
                      "position": {
                        "end": {
                          "column": 6,
                          "line": 1,
                          "offset": 5,
                        },
                        "start": {
                          "column": 2,
                          "line": 1,
                          "offset": 1,
                        },
                      },
                      "type": "text",
                      "value": "file",
                    },
                  ],
                  "position": {
                    "end": {
                      "column": 23,
                      "line": 1,
                      "offset": 22,
                    },
                    "start": {
                      "column": 1,
                      "line": 1,
                      "offset": 0,
                    },
                  },
                  "title": "fixed link title",
                  "type": "link",
                  "url": "/404",
                },
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx",
                "url": "@site/file.zip",
              },
            ],
          ]
        `);
      });

      it('if site alias points to a directory with a dot', async () => {
        using log = vi.spyOn(console, 'log');
        const result = await processWarn(fixtures.directoryWithDotSiteAlias);
        expect(result).toMatchInlineSnapshot(
          `"[dir](/404 "fixed link title")"`,
        );
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "onBrokenMarkdownLinks called with",
              {
                "node": {
                  "children": [
                    {
                      "position": {
                        "end": {
                          "column": 5,
                          "line": 1,
                          "offset": 4,
                        },
                        "start": {
                          "column": 2,
                          "line": 1,
                          "offset": 1,
                        },
                      },
                      "type": "text",
                      "value": "dir",
                    },
                  ],
                  "position": {
                    "end": {
                      "column": 39,
                      "line": 1,
                      "offset": 38,
                    },
                    "start": {
                      "column": 1,
                      "line": 1,
                      "offset": 0,
                    },
                  },
                  "title": "fixed link title",
                  "type": "link",
                  "url": "/404",
                },
                "sourceFilePath": "packages/docusaurus-mdx-loader/src/remark/transformLinks/__tests__/__fixtures__/docs/myFile.mdx",
                "url": "@site/dotted-directory.whatever",
              },
            ],
          ]
        `);
      });
    });
  });
});
