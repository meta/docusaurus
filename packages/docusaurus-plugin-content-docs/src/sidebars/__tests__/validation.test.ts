/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {validateSidebars, validateCategoryMetadataFile} from '../validation';
import type {SidebarsConfig, CategoryMetadataFile} from '../types';

describe('validateSidebars', () => {
  it('throw for bad value', () => {
    expect(() => validateSidebars({sidebar: [{type: 42}]}))
      .toThrowErrorMatchingInlineSnapshot(`
        [ValidationError: {
          "type": 42,
          "undefined" [1]: -- missing --
        }

        [1] Unknown sidebar item type "42".]
      `);
  });

  it('accept empty object', () => {
    const sidebars: SidebarsConfig = {};
    validateSidebars(sidebars);
  });

  it('accept valid values', () => {
    const sidebars: SidebarsConfig = {
      sidebar1: [
        {type: 'doc', id: 'doc1', key: 'key-doc1'},
        {type: 'doc', id: 'doc2'},
        {type: 'ref', id: 'doc2', key: 'ref-doc2'},
        {
          type: 'category',
          key: 'key-cat',
          label: 'Category',
          items: [{type: 'doc', id: 'doc3'}],
        },
      ],
    };
    validateSidebars(sidebars);
  });

  it('sidebar category wrong label', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'category',
            label: true,
            items: [{type: 'doc', id: 'doc1'}],
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "category",
        "items": [
          {
            "type": "doc",
            "id": "doc1"
          }
        ],
        "label" [1]: true
      }

      [1] "label" must be a string]
    `);
  });

  it('sidebar category wrong key', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'category',
            key: '',
            items: [{type: 'doc', id: 'doc1'}],
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "category",
        "items": [
          {
            "type": "doc",
            "id": "doc1"
          }
        ],
        "key" [1]: ""
      }

      [1] "key" is not allowed to be empty]
    `);
  });

  it('sidebars link wrong label', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'link',
            label: false,
            href: 'https://github.com',
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "link",
        "href": "https://github.com",
        "label" [1]: false
      }

      [1] "label" must be a string]
    `);
  });

  it('sidebars link wrong key', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'link',
            key: false,
            href: 'https://github.com',
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "link",
        "href": "https://github.com",
        "key" [1]: false
      }

      [1] "key" must be a string]
    `);
  });

  it('sidebars link wrong href', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'link',
            label: 'GitHub',
            href: ['example.com'],
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "link",
        "label": "GitHub",
        "href" [1]: [
          "example.com"
        ]
      }

      [1] "href" contains an invalid value]
    `);
  });

  it('sidebars with unknown sidebar item type', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'superman',
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "superman",
        "undefined" [1]: -- missing --
      }

      [1] Unknown sidebar item type "superman".]
    `);
  });

  it('sidebars category missing items', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'category',
            label: 'category',
          },

          {
            type: 'ref',
            id: 'hello',
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "category",
        "label": "category",
        "items" [1]: -- missing --
      }

      [1] "items" is required]
    `);
  });

  it('sidebars category wrong field', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'category',
            label: 'category',
            items: [],
            href: 'https://google.com',
          },

          {
            type: 'ref',
            id: 'hello',
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "category",
        "label": "category",
        "items": [],
        "href" [1]: "https://google.com"
      }

      [1] "href" is not allowed]
    `);
  });

  it('sidebars category wrong key', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'category',
            label: 'category',
            key: 42,
            items: [],
          },

          {
            type: 'ref',
            id: 'hello',
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "category",
        "label": "category",
        "items": [],
        "key" [1]: 42
      }

      [1] "key" must be a string]
    `);
  });

  it('sidebar category wrong items', () => {
    expect(() =>
      validateSidebars({
        docs: {
          Test: [
            {
              type: 'category',
              label: 'Category Label',
              items: 'doc1',
            },
          ],
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: sidebar.forEach is not a function]`,
    );
  });

  it('sidebars item doc but id is not a string', () => {
    expect(() =>
      validateSidebars({
        docs: [
          {
            type: 'doc',
            id: ['doc1'],
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ValidationError: {
        "type": "doc",
        "id" [1]: [
          "doc1"
        ]
      }

      [1] "id" must be a string]
    `);
  });

  it('html type requires a value', () => {
    const sidebars: SidebarsConfig = {
      sidebar1: [
        {
          type: 'html',
          // @ts-expect-error: test missing value
          value: undefined,
        },
      ],
    };
    expect(() => validateSidebars(sidebars))
      .toThrowErrorMatchingInlineSnapshot(`
        [ValidationError: {
          "type": "html",
          "value" [1]: -- missing --
        }

        [1] "value" is required]
      `);
  });

  it('html type accepts valid values', () => {
    const sidebars: SidebarsConfig = {
      sidebar1: [
        {
          type: 'html',
          key: 'html-key',
          value: '<p>Hello, World!</p>',
          defaultStyle: true,
          className: 'foo',
        },
      ],
    };
    validateSidebars(sidebars);
  });
});

describe('validateCategoryMetadataFile', () => {
  it('throw for bad value', () => {
    expect(() =>
      validateCategoryMetadataFile(42),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "value" must be of type object]`,
    );
  });

  it('accept empty object', () => {
    const content: CategoryMetadataFile = {};
    expect(validateCategoryMetadataFile(content)).toEqual(content);
  });

  it('accept valid values', () => {
    const content: CategoryMetadataFile = {
      className: 'className',
      label: 'Category Label',
      key: 'category-key',
      description: 'Category Description',
      link: {
        type: 'generated-index',
        slug: 'slug',
        title: 'title',
        description: 'description',
      },
      collapsible: true,
      collapsed: true,
      position: 3,
    };
    expect(validateCategoryMetadataFile(content)).toEqual(content);
  });

  describe('label', () => {
    it('accepts valid label', () => {
      const content: CategoryMetadataFile = {label: 'Category label'};
      expect(validateCategoryMetadataFile(content)).toEqual(content);
    });

    it('throws for number label', () => {
      expect(() =>
        validateCategoryMetadataFile({label: 42}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "label" must be a string]`,
      );
    });
  });

  describe('key', () => {
    it('accepts valid key', () => {
      const content: CategoryMetadataFile = {key: 'Category key'};
      expect(validateCategoryMetadataFile(content)).toEqual(content);
    });

    it('throws for number key', () => {
      expect(() =>
        validateCategoryMetadataFile({key: 42}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "key" must be a string]`,
      );
    });
  });

  describe('className', () => {
    it('accepts valid className', () => {
      const content: CategoryMetadataFile = {className: 'category-className'};
      expect(validateCategoryMetadataFile(content)).toEqual(content);
    });

    it('throws for number key', () => {
      expect(() =>
        validateCategoryMetadataFile({className: 42}),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "className" must be a string]`,
      );
    });
  });

  describe('link', () => {
    it('accepts valid link', () => {
      const content: CategoryMetadataFile = {
        link: {
          type: 'generated-index',
          slug: 'slug',
          title: 'title',
          description: 'desc',
        },
      };
      expect(validateCategoryMetadataFile(content)).toEqual(content);
    });

    it('rejects link permalink', () => {
      const content: CategoryMetadataFile = {
        link: {
          type: 'generated-index',
          slug: 'slug',
          // @ts-expect-error: rejected on purpose
          permalink: 'somePermalink',
        },
      };
      expect(() =>
        validateCategoryMetadataFile(content),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "link.permalink" is not allowed]`,
      );
    });
  });
});
