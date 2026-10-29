/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {reportDuplicateAuthors, reportInlineAuthors} from '../authorsProblems';
import type {Author} from '@docusaurus/plugin-content-blog';

const blogSourceRelative = 'doc.md';

describe('duplicate authors', () => {
  function testReport({authors}: {authors: Author[]}) {
    reportDuplicateAuthors({
      authors,
      blogSourceRelative,
    });
  }

  it('allows duplicated inline authors', () => {
    const authors: Author[] = [
      {
        name: 'Sébastien Lorber',
        key: null,
        page: null,
      },
      {
        name: 'Sébastien Lorber',
        key: null,
        page: null,
      },
    ];

    expect(() =>
      testReport({
        authors,
      }),
    ).not.toThrow();
  });

  it('rejects duplicated key authors', () => {
    const authors: Author[] = [
      {
        key: 'slorber',
        name: 'Sébastien Lorber 1',
        title: 'some title',
        page: null,
      },
      {
        key: 'slorber',
        name: 'Sébastien Lorber 2',
        imageURL: '/slorber.png',
        page: null,
      },
    ];

    expect(() =>
      testReport({
        authors,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Duplicate blog post authors were found in blog post "doc.md" front matter:
      - {"key":"slorber","name":"Sébastien Lorber 2","imageURL":"/slorber.png","page":null}]
    `);
  });
});

describe('inline authors', () => {
  type Options = Parameters<typeof reportInlineAuthors>[0]['options'];

  function testReport({
    authors,
    options = {},
  }: {
    authors: Author[];
    options?: Partial<Options>;
  }) {
    const defaultOptions: Options = {
      onInlineAuthors: 'throw',
      authorsMapPath: 'authors.yml',
    };

    reportInlineAuthors({
      authors,
      options: {
        ...defaultOptions,
        ...options,
      },
      blogSourceRelative,
    });
  }

  it('allows predefined authors', () => {
    const authors: Author[] = [
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        page: null,
      },
      {
        key: 'ozaki',
        name: 'Clément Couriol',
        page: null,
      },
    ];

    expect(() =>
      testReport({
        authors,
      }),
    ).not.toThrow();
  });

  it('rejects inline authors', () => {
    const authors: Author[] = [
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        page: null,
      },
      {name: 'Inline author 1', page: null, key: null},
      {
        key: 'ozaki',
        name: 'Clément Couriol',
        page: null,
      },
      {imageURL: '/inline-author2.png', page: null, key: null},
    ];

    expect(() =>
      testReport({
        authors,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Some blog authors used in "doc.md" are not defined in "authors.yml":
      - {"name":"Inline author 1","page":null,"key":null}
      - {"imageURL":"/inline-author2.png","page":null,"key":null}

      Note that we recommend to declare authors once in a "authors.yml" file and reference them by key in blog posts front matter to avoid author info duplication.
      But if you want to allow inline blog authors, you can disable this message by setting onInlineAuthors: 'ignore' in your blog plugin options.
      More info at https://docusaurus.io/docs/blog
      ]
    `);
  });
});
