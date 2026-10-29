/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {GlobExcludeDefault} from '@docusaurus/glob';
import {normalizePluginOptions} from '@docusaurus/utils-validation';
import {validateOptions, DEFAULT_OPTIONS} from '../options';
import {DefaultSidebarItemsGenerator} from '../sidebars/generator';
import {
  DefaultNumberPrefixParser,
  DisabledNumberPrefixParser,
} from '../numberPrefix';
import type {Options, PluginOptions} from '@docusaurus/plugin-content-docs';
import type {Validate} from '@docusaurus/types';

// The type of remark/rehype plugins can be function/object
const markdownPluginsFunctionStub = () => {};
const markdownPluginsObjectStub = {};

function testValidate(options: Options) {
  return validateOptions({
    validate: normalizePluginOptions as Validate<Options, PluginOptions>,
    options,
  });
}

const defaultOptions = {
  ...DEFAULT_OPTIONS,
  id: 'default',
  // The admonitions plugin is automatically added. Not really worth testing
  remarkPlugins: expect.any(Array),
};

describe('normalizeDocsPluginOptions', () => {
  it('returns default options for undefined user options', () => {
    expect(testValidate({})).toEqual(defaultOptions);
  });

  it('accepts correctly defined user options', () => {
    const userOptions: Options = {
      path: 'my-docs', // Path to data on filesystem, relative to site dir.
      routeBasePath: '/my-docs', // URL Route.
      tagsBasePath: 'tags', // URL Tags Route.
      include: ['**/*.{md,mdx}'], // Extensions to include.
      exclude: GlobExcludeDefault,
      sidebarPath: 'my-sidebar', // Path to sidebar configuration for showing a list of markdown pages.
      sidebarItemsGenerator: DefaultSidebarItemsGenerator,
      numberPrefixParser: DefaultNumberPrefixParser,
      docsRootComponent: '@theme/DocsRoot',
      docVersionRootComponent: '@theme/DocVersionRoot',
      docRootComponent: '@theme/DocRoot',
      docItemComponent: '@theme/DocItem',
      docTagDocListComponent: '@theme/DocTagDocListPage',
      docTagsListComponent: '@theme/DocTagsListPage',
      docCategoryGeneratedIndexComponent:
        '@theme/DocCategoryGeneratedIndexPage',
      remarkPlugins: [markdownPluginsObjectStub],
      rehypePlugins: [markdownPluginsFunctionStub],
      recmaPlugins: [markdownPluginsFunctionStub],
      beforeDefaultRehypePlugins: [],
      beforeDefaultRemarkPlugins: [],
      breadcrumbs: true,
      showLastUpdateTime: true,
      showLastUpdateAuthor: true,
      admonitions: false,
      includeCurrentVersion: false,
      disableVersioning: true,
      editCurrentVersion: true,
      editLocalizedFiles: true,
      tags: 'docsTags.yml',
      onInlineTags: 'throw',
      versions: {
        current: {
          path: 'next',
          label: 'next',
        },
        version1: {
          path: 'hello',
          label: 'world',
          noIndex: true,
        },
      },
      sidebarCollapsible: false,
      sidebarCollapsed: false,
    };
    expect(testValidate(userOptions)).toEqual({
      ...defaultOptions,
      ...userOptions,
    });
  });

  it('accepts correctly defined remark and rehype plugin options', () => {
    const userOptions: Options = {
      beforeDefaultRemarkPlugins: [],
      beforeDefaultRehypePlugins: [markdownPluginsFunctionStub],
      remarkPlugins: [[markdownPluginsFunctionStub, {option1: '42'}]],
      rehypePlugins: [
        markdownPluginsObjectStub,
        [markdownPluginsFunctionStub, {option1: '42'}],
      ],
    };
    expect(testValidate(userOptions)).toEqual({
      ...defaultOptions,
      ...userOptions,
    });
  });

  it('accepts admonitions false', () => {
    const admonitionsFalse: Options = {
      admonitions: false,
    };
    expect(testValidate(admonitionsFalse)).toEqual({
      ...defaultOptions,
      ...admonitionsFalse,
    });
  });

  it('rejects admonitions array', () => {
    expect(() =>
      testValidate({
        // @ts-expect-error: rejected value
        admonitions: [],
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "admonitions" does not look like a valid admonitions config]`,
    );
  });

  it('accepts numberPrefixParser function', () => {
    function customNumberPrefixParser() {}
    expect(
      testValidate({
        numberPrefixParser:
          customNumberPrefixParser as unknown as Options['numberPrefixParser'],
      }),
    ).toEqual({
      ...defaultOptions,
      numberPrefixParser: customNumberPrefixParser,
    });
  });

  it('accepts numberPrefixParser false', () => {
    expect(testValidate({numberPrefixParser: false})).toEqual({
      ...defaultOptions,
      numberPrefixParser: DisabledNumberPrefixParser,
    });
  });

  it('accepts numberPrefixParser true', () => {
    expect(testValidate({numberPrefixParser: true})).toEqual({
      ...defaultOptions,
      numberPrefixParser: DefaultNumberPrefixParser,
    });
  });

  it('rejects invalid remark plugin options', () => {
    expect(() =>
      testValidate({
        // @ts-expect-error: test
        remarkPlugins: [[{option1: '42'}, markdownPluginsFunctionStub]],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: "remarkPlugins[0]" does not look like a valid MDX plugin config. A plugin config entry should be one of:
      - A tuple, like \`[require("rehype-katex"), { strict: false }]\`, or
      - A simple module, like \`require("remark-math")\`]
    `);
  });

  it('rejects invalid rehype plugin options', () => {
    expect(() =>
      testValidate({
        rehypePlugins: [
          [
            markdownPluginsFunctionStub,
            {option1: '42'},
            markdownPluginsFunctionStub,
          ],
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: "rehypePlugins[0]" does not look like a valid MDX plugin config. A plugin config entry should be one of:
      - A tuple, like \`[require("rehype-katex"), { strict: false }]\`, or
      - A simple module, like \`require("remark-math")\`]
    `);
  });

  it('rejects bad path inputs', () => {
    // @ts-expect-error: test
    expect(() => testValidate({path: 2})).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "path" must be a string]`,
    );
  });

  it('rejects bad include inputs', () => {
    expect(() =>
      // @ts-expect-error: test
      testValidate({include: '**/*.{md,mdx}'}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "include" must be an array]`,
    );
  });

  it('rejects bad showLastUpdateTime inputs', () => {
    expect(() =>
      // @ts-expect-error: test
      testValidate({showLastUpdateTime: 'true'}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "showLastUpdateTime" must be a boolean]`,
    );
  });

  it('rejects bad remarkPlugins input', () => {
    expect(() =>
      // @ts-expect-error: test
      testValidate({remarkPlugins: 'remark-math'}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "remarkPlugins" must be an array]`,
    );
  });

  it('rejects bad lastVersion', () => {
    expect(() =>
      // @ts-expect-error: test
      testValidate({lastVersion: false}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "lastVersion" must be a string]`,
    );
  });

  it('rejects bad versions', () => {
    expect(() =>
      testValidate({
        versions: {
          current: {
            // @ts-expect-error: test
            hey: 3,
          },

          version1: {
            path: 'hello',
            label: 'world',
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "versions.current.hey" is not allowed]`,
    );
  });

  it('handles sidebarCollapsed option inconsistencies', () => {
    expect(
      testValidate({
        sidebarCollapsible: true,
        sidebarCollapsed: undefined,
      }).sidebarCollapsed,
    ).toBe(true);

    expect(
      testValidate({
        sidebarCollapsible: false,
        sidebarCollapsed: undefined,
      }).sidebarCollapsed,
    ).toBe(false);

    expect(
      testValidate({
        sidebarCollapsible: false,
        sidebarCollapsed: true,
      }).sidebarCollapsed,
    ).toBe(false);
  });

  describe('tags', () => {
    it('accepts tags - undefined', () => {
      expect(testValidate({tags: undefined}).tags).toBeUndefined();
    });

    it('accepts tags - null', () => {
      expect(testValidate({tags: null}).tags).toBeNull();
    });

    it('accepts tags - false', () => {
      expect(testValidate({tags: false}).tags).toBeFalsy();
    });

    it('accepts tags - customTags.yml', () => {
      expect(testValidate({tags: 'customTags.yml'}).tags).toBe(
        'customTags.yml',
      );
    });

    it('rejects tags - 42', () => {
      // @ts-expect-error: test
      expect(() => testValidate({tags: 42})).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "tags" must be a string]`,
      );
    });
  });

  describe('onInlineTags', () => {
    it('accepts onInlineTags - undefined', () => {
      expect(testValidate({onInlineTags: undefined}).onInlineTags).toBe('warn');
    });

    it('accepts onInlineTags - "throw"', () => {
      expect(testValidate({onInlineTags: 'throw'}).onInlineTags).toBe('throw');
    });

    it('rejects onInlineTags - "trace"', () => {
      expect(() =>
        // @ts-expect-error: test
        testValidate({onInlineTags: 'trace'}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "onInlineTags" must be one of [ignore, log, warn, throw]]`,
      );
    });

    it('rejects onInlineTags - null', () => {
      expect(() =>
        // @ts-expect-error: test
        testValidate({onInlineTags: 42}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "onInlineTags" must be one of [ignore, log, warn, throw]]`,
      );
    });

    it('rejects onInlineTags - 42', () => {
      expect(() =>
        // @ts-expect-error: test
        testValidate({onInlineTags: 42}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "onInlineTags" must be one of [ignore, log, warn, throw]]`,
      );
    });
  });
});
