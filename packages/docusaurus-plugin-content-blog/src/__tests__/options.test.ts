/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {normalizePluginOptions} from '@docusaurus/utils-validation';
import {validateOptions, DEFAULT_OPTIONS, XSLTBuiltInPaths} from '../options';
import type {
  Options,
  PluginOptions,
  UserFeedOptions,
} from '@docusaurus/plugin-content-blog';
import type {Validate} from '@docusaurus/types';

function testValidate(options?: Options) {
  return validateOptions({
    validate: normalizePluginOptions as Validate<
      Options | undefined,
      PluginOptions
    >,
    options,
  });
}

// The type of remark/rehype plugins can be either function, object or array
const markdownPluginsFunctionStub = () => {};
const markdownPluginsObjectStub = {};

const defaultOptions = {...DEFAULT_OPTIONS, id: 'default'};

describe('validateOptions', () => {
  it('returns default options for undefined user options', () => {
    expect(testValidate(undefined)).toEqual(defaultOptions);
  });

  it('returns default options for empty user options', () => {
    expect(testValidate({})).toEqual(defaultOptions);
  });

  it('accepts correctly defined user options', () => {
    const userOptions: Options = {
      ...defaultOptions,
      feedOptions: {
        type: 'rss' as const,
        title: 'myTitle',
      },
      path: 'not_blog',
      routeBasePath: '/myBlog',
      postsPerPage: 5,
      include: ['api/*', 'docs/*'],
      tags: 'customTags.yml',
      onInlineTags: 'warn',
    };
    expect(testValidate(userOptions)).toEqual({
      ...userOptions,
      feedOptions: {
        type: ['rss'],
        title: 'myTitle',
        copyright: '',
        limit: 20,
        xslt: {rss: null, atom: null},
      },
    });
  });

  it('accepts valid user options', () => {
    const userOptions: Options = {
      ...defaultOptions,
      routeBasePath: '/myBlog',
      beforeDefaultRemarkPlugins: [],
      beforeDefaultRehypePlugins: [markdownPluginsFunctionStub],
      remarkPlugins: [[markdownPluginsFunctionStub, {option1: '42'}]],
      rehypePlugins: [
        markdownPluginsObjectStub,
        [markdownPluginsFunctionStub, {option1: '42'}],
      ],
      recmaPlugins: [markdownPluginsFunctionStub],
    };
    expect(testValidate(userOptions)).toEqual(userOptions);
  });

  it('throws Error in case of invalid options', () => {
    expect(() =>
      testValidate({
        path: 'not_blog',
        postsPerPage: -1,
        include: ['api/*', 'docs/*'],
        routeBasePath: 'not_blog',
      }),
    ).toThrowErrorMatchingSnapshot();
  });

  describe('feed', () => {
    it('throws Error in case of invalid feed type', () => {
      expect(() =>
        testValidate({
          feedOptions: {
            // @ts-expect-error: test
            type: 'none',
          },
        }),
      ).toThrowErrorMatchingSnapshot();
    });

    it('converts all feed type to array with other feed type', () => {
      expect(
        testValidate({
          feedOptions: {type: 'all'},
        }),
      ).toEqual({
        ...defaultOptions,
        feedOptions: {
          type: ['rss', 'atom', 'json'],
          copyright: '',
          limit: 20,
          xslt: {rss: null, atom: null},
        },
      });
    });

    it('accepts null feed type and return same', () => {
      expect(
        testValidate({
          feedOptions: {type: null},
        }),
      ).toEqual({
        ...defaultOptions,
        feedOptions: {
          type: null,
          limit: 20,
          xslt: {rss: null, atom: null},
        },
      });
    });

    it('contains array with rss + atom for missing feed type', () => {
      expect(
        testValidate({
          feedOptions: {},
        }),
      ).toEqual(defaultOptions);
    });

    it('has array with rss + atom, title for missing feed type', () => {
      expect(
        testValidate({
          feedOptions: {title: 'title'},
        }),
      ).toEqual({
        ...defaultOptions,
        feedOptions: {
          type: ['rss', 'atom'],
          title: 'title',
          copyright: '',
          limit: 20,
          xslt: {rss: null, atom: null},
        },
      });
    });

    describe('feed xslt', () => {
      function testXSLT(xslt: UserFeedOptions['xslt']) {
        return testValidate({feedOptions: {xslt}}).feedOptions.xslt;
      }

      it('accepts xslt: true', () => {
        expect(testXSLT(true)).toEqual({
          rss: XSLTBuiltInPaths.rss,
          atom: XSLTBuiltInPaths.atom,
        });
      });

      it('accepts xslt: false', () => {
        expect(testXSLT(false)).toEqual({
          rss: null,
          atom: null,
        });
      });

      it('accepts xslt: null', () => {
        expect(testXSLT(null)).toEqual({
          rss: null,
          atom: null,
        });
      });

      it('accepts xslt: undefined', () => {
        expect(testXSLT(undefined)).toEqual({
          rss: null,
          atom: null,
        });
      });

      it('accepts xslt: {rss: true}', () => {
        expect(testXSLT({rss: true})).toEqual({
          rss: XSLTBuiltInPaths.rss,
          atom: null,
        });
      });

      it('accepts xslt: {atom: true}', () => {
        expect(testXSLT({atom: true})).toEqual({
          rss: null,
          atom: XSLTBuiltInPaths.atom,
        });
      });

      it('accepts xslt: {rss: true, atom: true}', () => {
        expect(testXSLT({rss: true, atom: true})).toEqual({
          rss: XSLTBuiltInPaths.rss,
          atom: XSLTBuiltInPaths.atom,
        });
      });

      it('accepts xslt: {rss: "custom-path"}', () => {
        expect(testXSLT({rss: 'custom-path'})).toEqual({
          rss: 'custom-path',
          atom: null,
        });
      });

      it('accepts xslt: {rss: true, atom: "custom-path"}', () => {
        expect(testXSLT({rss: true, atom: 'custom-path'})).toEqual({
          rss: XSLTBuiltInPaths.rss,
          atom: 'custom-path',
        });
      });

      it('accepts xslt: {rss: null, atom: true}', () => {
        expect(testXSLT({rss: null, atom: true})).toEqual({
          rss: null,
          atom: XSLTBuiltInPaths.atom,
        });
      });

      it('accepts xslt: {rss: false, atom: null}', () => {
        expect(testXSLT({rss: false, atom: null})).toEqual({
          rss: null,
          atom: null,
        });
      });

      it('rejects xslt: 42', () => {
        // @ts-expect-error: bad type
        expect(() => testXSLT(42)).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "feedOptions.xslt" must be one of [object, boolean]]`,
        );
      });
      it('rejects xslt: []', () => {
        // @ts-expect-error: bad type
        expect(() => testXSLT([])).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "feedOptions.xslt" must be one of [object, boolean]]`,
        );
      });

      it('rejects xslt: {rss: 42}', () => {
        // @ts-expect-error: bad type
        expect(() => testXSLT({rss: 42})).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "feedOptions.xslt.rss" must be one of [string, boolean]]`,
        );
      });

      it('rejects xslt: {rss: []}', () => {
        // @ts-expect-error: bad type
        expect(() => testXSLT({rss: 42})).toThrowErrorMatchingInlineSnapshot(
          `[ValidationError: "feedOptions.xslt.rss" must be one of [string, boolean]]`,
        );
      });
    });
  });

  it('accepts 0 sidebar count', () => {
    const userOptions = {blogSidebarCount: 0};
    expect(testValidate(userOptions)).toEqual({
      ...defaultOptions,
      ...userOptions,
    });
  });

  it('accepts "ALL" sidebar count', () => {
    const userOptions = {blogSidebarCount: 'ALL' as const};
    expect(testValidate(userOptions)).toEqual({
      ...defaultOptions,
      ...userOptions,
    });
  });

  it('rejects "abcdef" sidebar count', () => {
    const userOptions = {blogSidebarCount: 'abcdef'};
    // @ts-expect-error: test
    expect(() => testValidate(userOptions)).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "blogSidebarCount" must be one of [ALL, number]]`,
    );
  });

  it('accepts "all posts" sidebar title', () => {
    const userOptions = {blogSidebarTitle: 'all posts'};
    expect(testValidate(userOptions)).toEqual({
      ...defaultOptions,
      ...userOptions,
    });
  });

  it('rejects 42 sidebar title', () => {
    const userOptions = {blogSidebarTitle: 42};
    // @ts-expect-error: test
    expect(() => testValidate(userOptions)).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "blogSidebarTitle" must be a string]`,
    );
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

  describe('onUntruncatedBlogPosts', () => {
    it('accepts onUntruncatedBlogPosts - undefined', () => {
      expect(
        testValidate({onUntruncatedBlogPosts: undefined})
          .onUntruncatedBlogPosts,
      ).toBe('warn');
    });

    it('accepts onUntruncatedBlogPosts - "throw"', () => {
      expect(
        testValidate({onUntruncatedBlogPosts: 'throw'}).onUntruncatedBlogPosts,
      ).toBe('throw');
    });

    it('rejects onUntruncatedBlogPosts - "trace"', () => {
      expect(() =>
        // @ts-expect-error: test
        testValidate({onUntruncatedBlogPosts: 'trace'}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "onUntruncatedBlogPosts" must be one of [ignore, log, warn, throw]]`,
      );
    });

    it('rejects onUntruncatedBlogPosts - null', () => {
      expect(() =>
        // @ts-expect-error: test
        testValidate({onUntruncatedBlogPosts: 42}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "onUntruncatedBlogPosts" must be one of [ignore, log, warn, throw]]`,
      );
    });

    it('rejects onUntruncatedBlogPosts - 42', () => {
      expect(() =>
        // @ts-expect-error: test
        testValidate({onUntruncatedBlogPosts: 42}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "onUntruncatedBlogPosts" must be one of [ignore, log, warn, throw]]`,
      );
    });
  });
});
