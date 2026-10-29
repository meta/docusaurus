/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {validateBlogPostFrontMatter} from '../frontMatter';
import type {BlogPostFrontMatter} from '@docusaurus/plugin-content-blog';

// TODO this abstraction reduce verbosity but it makes it harder to debug
// It would be preferable to just expose helper methods
function testField(params: {
  prefix: string;
  validFrontMatters: BlogPostFrontMatter[];
  convertibleFrontMatter?: [
    ConvertibleFrontMatter: {[key: string]: unknown},
    ConvertedFrontMatter: BlogPostFrontMatter,
  ][];
  invalidFrontMatters?: [
    InvalidFrontMatter: {[key: string]: unknown},
    ErrorMessage: string,
  ][];
}) {
  describe(`"${params.prefix}" field`, () => {
    it('accept valid values', () => {
      params.validFrontMatters.forEach((frontMatter) => {
        expect(validateBlogPostFrontMatter(frontMatter)).toEqual(frontMatter);
      });
    });

    it('convert valid values', () => {
      params.convertibleFrontMatter?.forEach(
        ([convertibleFrontMatter, convertedFrontMatter]) => {
          expect(validateBlogPostFrontMatter(convertibleFrontMatter)).toEqual(
            convertedFrontMatter,
          );
        },
      );
    });

    it('throw error for values', () => {
      params.invalidFrontMatters?.forEach(([frontMatter, message]) => {
        try {
          validateBlogPostFrontMatter(frontMatter);
          throw new Error(
            `Blog front matter is expected to be rejected, but was accepted successfully:\n ${JSON.stringify(
              frontMatter,
              null,
              2,
            )}`,
          );
        } catch (err) {
          // eslint-disable-next-line vitest/no-conditional-expect
          expect((err as Error).message).toMatch(
            new RegExp(RegExp.escape(message)),
          );
        }
      });
    });
  });
}

describe('validateBlogPostFrontMatter', () => {
  it('accept empty object', () => {
    const frontMatter = {};
    expect(validateBlogPostFrontMatter(frontMatter)).toEqual(frontMatter);
  });

  it('accept unknown field', () => {
    const frontMatter = {abc: '1'};
    expect(validateBlogPostFrontMatter(frontMatter)).toEqual(frontMatter);
  });
});

describe('validateBlogPostFrontMatter description', () => {
  testField({
    prefix: 'description',
    validFrontMatters: [
      // See https://github.com/facebook/docusaurus/issues/4591#issuecomment-822372398
      {description: undefined},
      {description: ''},
      {description: 'description'},
    ],
  });
});

describe('validateBlogPostFrontMatter title', () => {
  testField({
    prefix: 'title',
    validFrontMatters: [
      // See https://github.com/facebook/docusaurus/issues/4591#issuecomment-822372398
      {title: undefined},
      {title: ''},
      {title: 'title'},
    ],
    invalidFrontMatters: [
      [{title: null}, 'must be a string'],
      [{title: false}, 'must be a string'],
    ],
  });
});

describe('validateBlogPostFrontMatter title_meta', () => {
  testField({
    prefix: 'title_meta',
    validFrontMatters: [
      {title_meta: undefined},
      {title_meta: ''},
      {title_meta: 'title'},
    ],
    invalidFrontMatters: [
      [{title_meta: null}, 'must be a string'],
      [{title_meta: false}, 'must be a string'],
    ],
  });
});

describe('validateBlogPostFrontMatter sidebar_label', () => {
  testField({
    prefix: 'title_meta',
    validFrontMatters: [
      {sidebar_label: undefined},
      {sidebar_label: ''},
      {sidebar_label: 'title'},
    ],
    invalidFrontMatters: [
      [{sidebar_label: null}, 'must be a string'],
      [{sidebar_label: false}, 'must be a string'],
    ],
  });
});

describe('validateBlogPostFrontMatter legacy author front matter', () => {
  it('rejects legacy author front matter', () => {
    expect(() =>
      validateBlogPostFrontMatter({author: 'Sébastien Lorber'}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "author" blog post front matter is not supported anymore. Use the "authors" front matter instead, with an inline author object (with name, title, url and imageURL attributes) or an author key declared in the authors map file (authors.yml).]`,
    );
  });

  it.each([
    'author_title',
    'authorTitle',
    'author_url',
    'authorURL',
    'author_image_url',
    'authorImageURL',
  ])('rejects legacy %s front matter', (key) => {
    expect(() => validateBlogPostFrontMatter({[key]: 'value'})).toThrow(
      `"${key}" blog post front matter is not supported anymore.`,
    );
  });
});

describe('validateBlogPostFrontMatter new authors front matter', () => {
  it('allow new authors front matter', () => {
    const frontMatter: BlogPostFrontMatter = {
      authors: [
        'slorber',
        {name: 'Yangshun'},
        {key: 'JMarcey', title: 'creator', random: '42'},
      ],
    };
    expect(validateBlogPostFrontMatter(frontMatter)).toEqual(frontMatter);
  });
});

describe('validateBlogPostFrontMatter authors', () => {
  testField({
    prefix: 'author',
    validFrontMatters: [
      {authors: []},
      {authors: 'authorKey'},
      {authors: ['authorKey1', 'authorKey2']},
      {
        authors: {
          name: 'Author Name',
          imageURL: '/absolute',
        },
      },
      {
        authors: {
          key: 'authorKey',
          title: 'Author title',
        },
      },
      {
        authors: [
          'authorKey1',
          {key: 'authorKey3'},
          'authorKey3',
          {name: 'Author Name 4'},
          {key: 'authorKey5'},
        ],
      },
    ],

    invalidFrontMatters: [
      [{authors: ''}, '"authors" is not allowed to be empty'],
      [
        {authors: [undefined]},
        '"authors[0]" does not look like a valid blog post author. Please use an author key or an author object (with a key and/or name).',
      ],
      [
        {authors: [null]},
        '"authors[0]" does not look like a valid blog post author. Please use an author key or an author object (with a key and/or name).',
      ],
      [
        {authors: [{}]},
        '"authors[0]" does not look like a valid blog post author. Please use an author key or an author object (with a key and/or name).',
      ],
    ],
  });
});

describe('validateBlogPostFrontMatter slug', () => {
  testField({
    prefix: 'slug',
    validFrontMatters: [
      {slug: 'blog/'},
      {slug: '/blog'},
      {slug: '/blog/'},
      {slug: './blog'},
      {slug: '../blog'},
      {slug: '../../blog'},
      {slug: '/api/plugins/@docusaurus/plugin-debug'},
      {slug: '@site/api/asset/image.png'},
    ],
    invalidFrontMatters: [[{slug: ''}, 'not allowed to be empty']],
  });
});

describe('validateBlogPostFrontMatter image', () => {
  testField({
    prefix: 'image',
    validFrontMatters: [
      {image: 'https://docusaurus.io/image.png'},
      {image: 'blog/'},
      {image: '/blog'},
      {image: '/blog/'},
      {image: './blog'},
      {image: '../blog'},
      {image: '../../blog'},
      {image: '/api/plugins/@docusaurus/plugin-debug'},
      {image: '@site/api/asset/image.png'},
    ],
    invalidFrontMatters: [
      [{image: ''}, '"image" does not look like a valid url (value=\'\')'],
    ],
  });
});

describe('validateBlogPostFrontMatter tags', () => {
  testField({
    prefix: 'tags',
    validFrontMatters: [
      {tags: []},
      {tags: ['hello']},
      {tags: ['hello', 'world']},
      {tags: ['hello', 'world']},
    ],
    invalidFrontMatters: [
      [
        {tags: ''},
        '"tags" does not look like a valid front matter Yaml array.',
      ],
      [{tags: ['']}, 'not allowed to be empty'],
      [
        {tags: ['hello', {label: 'tagLabel', permalink: '/tagPermalink'}]},
        '"tags[1]" does not look like a valid tag: front matter tags must be strings.',
      ],
    ],
    // See https://github.com/facebook/docusaurus/issues/4642
    convertibleFrontMatter: [[{tags: [42]}, {tags: ['42']}]],
  });
});

describe('validateBlogPostFrontMatter keywords', () => {
  testField({
    prefix: 'keywords',
    validFrontMatters: [
      {keywords: ['hello']},
      {keywords: ['hello', 'world']},
      {keywords: ['hello', 'world']},
      {keywords: ['hello']},
    ],
    invalidFrontMatters: [
      [{keywords: ''}, 'must be an array'],
      [{keywords: ['']}, 'not allowed to be empty'],
      [{keywords: []}, 'does not contain 1 required value(s)'],
    ],
  });
});

describe('validateBlogPostFrontMatter draft', () => {
  testField({
    prefix: 'draft',
    validFrontMatters: [{draft: true}, {draft: false}],
    convertibleFrontMatter: [
      [{draft: 'true'}, {draft: true}],
      [{draft: 'false'}, {draft: false}],
    ],
    invalidFrontMatters: [
      [{draft: 'yes'}, 'must be a boolean'],
      [{draft: 'no'}, 'must be a boolean'],
    ],
  });
});

describe('validateBlogPostFrontMatter unlisted', () => {
  testField({
    prefix: 'unlisted',
    validFrontMatters: [{unlisted: true}, {unlisted: false}],
    convertibleFrontMatter: [
      [{unlisted: 'true'}, {unlisted: true}],
      [{unlisted: 'false'}, {unlisted: false}],
    ],
    invalidFrontMatters: [
      [{unlisted: 'yes'}, 'must be a boolean'],
      [{unlisted: 'no'}, 'must be a boolean'],
    ],
  });
});

describe('validateDocFrontMatter draft XOR unlisted', () => {
  testField({
    prefix: 'draft XOR unlisted',
    validFrontMatters: [
      {draft: false},
      {unlisted: false},
      {draft: false, unlisted: false},
      {draft: true, unlisted: false},
      {draft: false, unlisted: true},
    ],
    invalidFrontMatters: [
      [
        {draft: true, unlisted: true},
        "Can't be draft and unlisted at the same time.",
      ],
    ],
  });
});

describe('validateBlogPostFrontMatter hide_table_of_contents', () => {
  testField({
    prefix: 'hide_table_of_contents',
    validFrontMatters: [
      {hide_table_of_contents: true},
      {hide_table_of_contents: false},
    ],
    convertibleFrontMatter: [
      [{hide_table_of_contents: 'true'}, {hide_table_of_contents: true}],
      [{hide_table_of_contents: 'false'}, {hide_table_of_contents: false}],
    ],
    invalidFrontMatters: [
      [{hide_table_of_contents: 'yes'}, 'must be a boolean'],
      [{hide_table_of_contents: 'no'}, 'must be a boolean'],
    ],
  });
});

describe('validateBlogPostFrontMatter date', () => {
  testField({
    prefix: 'date',
    validFrontMatters: [
      {date: new Date('2020-01-01')},
      {date: '2020-01-01'},
      {date: '2020'},
    ],
    invalidFrontMatters: [
      [{date: 'abc'}, 'must be a valid date'],
      [{date: ''}, 'must be a valid date'],
    ],
  });
});
