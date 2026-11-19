/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  createSiteMarkdownLinks,
  updateSiteMarkdownLinks,
} from '../siteMarkdownLinks';
import type {RouteConfig} from '@docusaurus/types';

function route(
  path: string,
  sourceFilePath?: string,
  routes?: RouteConfig[],
): RouteConfig {
  return {
    path,
    component: '@theme/Component',
    ...(sourceFilePath && {metadata: {sourceFilePath}}),
    ...(routes && {routes}),
  };
}

function createRegistry(routes: RouteConfig[], siteDir: string = '.') {
  const siteMarkdownLinks = createSiteMarkdownLinks({siteDir});
  updateSiteMarkdownLinks({siteMarkdownLinks, routes});
  return siteMarkdownLinks;
}

describe('updateSiteMarkdownLinks', () => {
  it('collects the Markdown files of all the plugins', () => {
    const {sourceToPermalink} = createRegistry([
      route('/docs', undefined, [
        route('/docs/intro', 'docs/intro.md'),
        route('/docs/api', 'docs/api.mdx'),
      ]),
      route('/blog/hello', 'blog/hello.md'),
      route('/about', 'src/pages/about.md'),
    ]);

    expect(sourceToPermalink).toEqual(
      new Map(
        Object.entries({
          '@site/docs/intro.md': '/docs/intro',
          '@site/docs/api.mdx': '/docs/api',
          '@site/blog/hello.md': '/blog/hello',
          '@site/src/pages/about.md': '/about',
        }),
      ),
    );
  });

  it('ignores routes without Markdown source file', () => {
    const {sourceToPermalink} = createRegistry([
      route('/'),
      route('/about', 'src/pages/about.tsx'),
      route('/markdown', 'src/pages/markdown.md'),
    ]);

    expect(sourceToPermalink).toEqual(
      new Map(Object.entries({'@site/src/pages/markdown.md': '/markdown'})),
    );
  });

  it('keeps the first route for duplicated source files', () => {
    // Multiple plugin instances can read the same content dir
    const {sourceToPermalink} = createRegistry([
      route('/docs/intro', 'docs/intro.md'),
      route('/docs-copy/intro', 'docs/intro.md'),
    ]);

    expect(sourceToPermalink).toEqual(
      new Map(Object.entries({'@site/docs/intro.md': '/docs/intro'})),
    );
  });

  it('refreshes the registry in place on site reloads', () => {
    const siteMarkdownLinks = createSiteMarkdownLinks({siteDir: '.'});
    const {sourceToPermalink} = siteMarkdownLinks;

    updateSiteMarkdownLinks({
      siteMarkdownLinks,
      routes: [route('/docs/intro', 'docs/intro.md')],
    });
    updateSiteMarkdownLinks({
      siteMarkdownLinks,
      routes: [route('/docs/intro2', 'docs/intro2.md')],
    });

    // The MDX loader keeps a reference to the initial objects on reloads
    expect(siteMarkdownLinks.sourceToPermalink).toBe(sourceToPermalink);
    expect(sourceToPermalink).toEqual(
      new Map(Object.entries({'@site/docs/intro2.md': '/docs/intro2'})),
    );
  });
});

describe('createSiteMarkdownLinks - resolveMarkdownLink', () => {
  const {resolveMarkdownLink} = createRegistry([
    route('/docs/intro', 'docs/intro.md'),
    route('/docs/api/uri', 'docs/api/uri.mdx'),
    route('/blog/hello', 'blog/hello.md'),
    route('/about', 'src/pages/about.md'),
  ]);

  function test(sourceFilePath: string, linkPathname: string) {
    return resolveMarkdownLink({sourceFilePath, linkPathname});
  }

  it('resolves cross-plugin relative links', () => {
    expect(test('docs/intro.md', '../blog/hello.md')).toBe('/blog/hello');
    expect(test('blog/hello.md', '../docs/intro.md')).toBe('/docs/intro');
    expect(test('docs/api/uri.mdx', '../../src/pages/about.md')).toBe('/about');
  });

  it('resolves same-plugin relative links', () => {
    expect(test('docs/intro.md', './api/uri.mdx')).toBe('/docs/api/uri');
    expect(test('docs/api/uri.mdx', '../intro.md')).toBe('/docs/intro');
  });

  it('resolves site absolute links', () => {
    expect(test('docs/intro.md', '/blog/hello.md')).toBe('/blog/hello');
    expect(test('blog/hello.md', '/docs/api/uri.mdx')).toBe('/docs/api/uri');
  });

  it('resolves @site aliased links', () => {
    expect(test('docs/intro.md', '@site/blog/hello.md')).toBe('/blog/hello');
  });

  it('returns null for unresolvable links', () => {
    expect(test('docs/intro.md', './doesNotExist.md')).toBeNull();
    expect(test('docs/intro.md', '../blog/hello.js')).toBeNull();
  });
});
