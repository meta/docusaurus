/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {resolveMarkdownLinkPathname} from '../markdownLinks';

describe('resolveMarkdownLinkPathname', () => {
  type Context = Parameters<typeof resolveMarkdownLinkPathname>[1];

  it('does basic replace', () => {
    const context: Context = {
      siteDir: '.',
      sourceFilePath: 'docs/intro.md',
      contentPaths: {
        contentPath: 'docs',
        contentPathLocalized: 'i18n/docs-localized',
      },
      sourceToPermalink: new Map(
        Object.entries({
          '@site/docs/intro.md': '/docs/intro',
          '@site/docs/foo.md': '/doc/foo',
          '@site/docs/bar/baz.md': '/doc/baz',
          '@site/docs/http.foo.md': '/doc/http',
        }),
      ),
    };

    function test(linkPathname: string, expectedOutput: string | null) {
      const output = resolveMarkdownLinkPathname(linkPathname, context);
      expect(output).toEqual(expectedOutput);
    }

    test('./foo.md', '/doc/foo');
    test('foo.md', '/doc/foo');
    test('./bar/baz.md', '/doc/baz');
    test('http.foo.md', '/doc/http');
    test('@site/docs/_partial.md', null);
    test('foo.js', null);
    test('nonexistent.md', null);
    test('https://github.com/facebook/docusaurus/README.md', null);
  });

  it('resolves absolute and relative links differently', () => {
    const context: Context = {
      siteDir: '.',
      sourceFilePath: 'docs/intro/intro.md',
      contentPaths: {
        contentPath: 'docs',
        contentPathLocalized: 'i18n/docs-localized',
      },

      sourceToPermalink: new Map(
        Object.entries({
          '@site/docs/intro/intro.md': '/docs/intro',
          '@site/docs/intro/another.md': '/docs/another',
          '@site/docs/api/classes/divine_uri.URI.md': '/docs/api/classes/uri',
        }),
      ),
    };

    function test(linkPathname: string, expectedOutput: string | null) {
      const output = resolveMarkdownLinkPathname(linkPathname, context);
      expect(output).toEqual(expectedOutput);
    }

    test('./another.md', '/docs/another');
    test('../api/classes/divine_uri.URI.md', '/docs/api/classes/uri');
    test('./api/classes/divine_uri.URI.md', null);
    test('/api/classes/divine_uri.URI.md', '/docs/api/classes/uri');
    test('/docs/api/classes/divine_uri.URI.md', '/docs/api/classes/uri');
    test('/another.md', null);
    test('api/classes/divine_uri.URI.md', '/docs/api/classes/uri');
    test('another.md', '/docs/another');
  });

  it('uses relative file paths in priority - Fix #11099', () => {
    // Unit test to fix bug https://github.com/facebook/docusaurus/issues/11099

    const context: Context = {
      siteDir: '.',
      sourceFilePath: 'docs/test/file.mdx',
      contentPaths: {
        contentPath: 'docs',
        contentPathLocalized: 'i18n/docs-localized',
      },
      sourceToPermalink: new Map(
        Object.entries({
          '@site/docs/file.mdx': '/docs/file',
          '@site/docs/test/file.mdx': '/docs/test/file',
        }),
      ),
    };

    function test(linkPathname: string, expectedOutput: string | null) {
      const output = resolveMarkdownLinkPathname(linkPathname, context);
      expect(output).toEqual(expectedOutput);
    }

    test('./file.mdx', '/docs/test/file');
    test('file.mdx', '/docs/test/file');
  });

  it('can resolve @site/ links', () => {
    const context: Context = {
      siteDir: '.',
      sourceFilePath: 'docs/test/file.mdx',
      contentPaths: {
        contentPath: 'docs',
        contentPathLocalized: 'i18n/docs-localized',
      },
      sourceToPermalink: new Map(
        Object.entries({
          '@site/docs/file.mdx': '/docs/file',
          '@site/docs/dir with spaces/file.mdx': '/docs/dir-with-spaces/file',
        }),
      ),
    };

    function test(linkPathname: string, expectedOutput: string | null) {
      const output = resolveMarkdownLinkPathname(linkPathname, context);
      expect(output).toEqual(expectedOutput);
    }

    test('@site/docs/file.mdx', '/docs/file');
    test('@site/docs/dir with spaces/file.mdx', '/docs/dir-with-spaces/file');
    test(
      '@site/docs/dir%20with%20spaces/file.mdx',
      '/docs/dir-with-spaces/file',
    );
  });
});
