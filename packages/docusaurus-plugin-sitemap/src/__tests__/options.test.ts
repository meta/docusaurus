/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {normalizePluginOptions} from '@docusaurus/utils-validation';
import {
  validateOptions,
  DEFAULT_OPTIONS,
  type Options,
  type PluginOptions,
} from '../options';
import type {Validate} from '@docusaurus/types';

function testValidate(options: Options) {
  return validateOptions({
    validate: normalizePluginOptions as Validate<Options, PluginOptions>,
    options,
  });
}

const defaultOptions = {
  ...DEFAULT_OPTIONS,
  id: 'default',
};

describe('validateOptions', () => {
  it('returns default values for empty user options', () => {
    expect(testValidate({})).toEqual(defaultOptions);
  });

  it('accepts correctly defined user options', () => {
    const userOptions: Options = {
      ignorePatterns: ['/search/**'],
      lastmod: 'datetime',
    };
    expect(testValidate(userOptions)).toEqual({
      ...defaultOptions,
      ...userOptions,
    });
  });

  describe('lastmod', () => {
    it('accepts lastmod undefined', () => {
      const userOptions: Options = {
        lastmod: undefined,
      };
      expect(testValidate(userOptions)).toEqual(defaultOptions);
      expect(testValidate(userOptions).lastmod).toBe('date');
    });

    it('accepts lastmod null', () => {
      const userOptions: Options = {
        lastmod: null,
      };
      expect(testValidate(userOptions)).toEqual({
        ...defaultOptions,
        ...userOptions,
      });
    });

    it('accepts lastmod datetime', () => {
      const userOptions: Options = {
        lastmod: 'datetime',
      };
      expect(testValidate(userOptions)).toEqual({
        ...defaultOptions,
        ...userOptions,
      });
    });

    it('rejects lastmod bad input', () => {
      const userOptions: Options = {
        // @ts-expect-error: bad value on purpose
        lastmod: 'dateTimeZone',
      };
      expect(() =>
        testValidate(userOptions),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "lastmod" must be one of [null, date, datetime]]`,
      );
    });
  });

  describe('removed options', () => {
    it('rejects changefreq', () => {
      const userOptions = {changefreq: 'weekly'} as Options;
      expect(() => testValidate(userOptions))
        .toThrowErrorMatchingInlineSnapshot(`
        [ValidationError: The sitemap plugin \`changefreq\` option has been removed in Docusaurus v4. Please remove it from your config.
        If you still want to emit this sitemap tag, use the \`createSitemapItems\` option instead: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap#changefreq-priority]
      `);
    });

    it('rejects changefreq null', () => {
      const userOptions = {changefreq: null} as Options;
      expect(() => testValidate(userOptions))
        .toThrowErrorMatchingInlineSnapshot(`
        [ValidationError: The sitemap plugin \`changefreq\` option has been removed in Docusaurus v4. Please remove it from your config.
        If you still want to emit this sitemap tag, use the \`createSitemapItems\` option instead: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap#changefreq-priority]
      `);
    });

    it('rejects priority', () => {
      const userOptions = {priority: 0.5} as Options;
      expect(() => testValidate(userOptions))
        .toThrowErrorMatchingInlineSnapshot(`
        [ValidationError: The sitemap plugin \`priority\` option has been removed in Docusaurus v4. Please remove it from your config.
        If you still want to emit this sitemap tag, use the \`createSitemapItems\` option instead: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap#changefreq-priority]
      `);
    });

    it('rejects priority null', () => {
      const userOptions = {priority: null} as Options;
      expect(() => testValidate(userOptions))
        .toThrowErrorMatchingInlineSnapshot(`
        [ValidationError: The sitemap plugin \`priority\` option has been removed in Docusaurus v4. Please remove it from your config.
        If you still want to emit this sitemap tag, use the \`createSitemapItems\` option instead: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap#changefreq-priority]
      `);
    });
  });

  describe('ignorePatterns', () => {
    it('accept ignorePatterns undefined', () => {
      const userOptions: Options = {
        ignorePatterns: undefined,
      };
      expect(testValidate(userOptions)).toEqual(defaultOptions);
    });

    it('accept ignorePatterns empty', () => {
      const userOptions: Options = {
        ignorePatterns: [],
      };
      expect(testValidate(userOptions)).toEqual({
        ...defaultOptions,
        ...userOptions,
      });
    });

    it('accept ignorePatterns valid', () => {
      const userOptions: Options = {
        ignorePatterns: ['/tags/**'],
      };
      expect(testValidate(userOptions)).toEqual({
        ...defaultOptions,
        ...userOptions,
      });
    });

    it('rejects ignorePatterns bad input array', () => {
      const userOptions: Options = {
        // @ts-expect-error: test
        ignorePatterns: '/search',
      };
      expect(() =>
        testValidate(userOptions),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "ignorePatterns" must be an array]`,
      );
    });

    it('rejects ignorePatterns bad input item string', () => {
      const userOptions: Options = {
        // @ts-expect-error: test
        ignorePatterns: [/^\/search/],
      };
      expect(() =>
        testValidate(userOptions),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "ignorePatterns[0]" must be a string]`,
      );
    });
  });

  describe('createSitemapItems', () => {
    it('accept createSitemapItems undefined', () => {
      const userOptions: Options = {
        createSitemapItems: undefined,
      };
      expect(testValidate(userOptions)).toEqual(defaultOptions);
    });

    it('accept createSitemapItems valid', () => {
      const userOptions: Options = {
        createSitemapItems: async (params) => {
          const {defaultCreateSitemapItems, ...rest} = params;
          const sitemapItems = await defaultCreateSitemapItems(rest);
          const sitemapsWithoutPageAndTags = sitemapItems.filter(
            (sitemapItem) =>
              !sitemapItem.url.includes('/tags/') &&
              !sitemapItem.url.includes('/page/'),
          );
          return sitemapsWithoutPageAndTags;
        },
      };
      expect(testValidate(userOptions)).toEqual({
        ...defaultOptions,
        ...userOptions,
      });
    });

    it('rejects createSitemapItems bad input type', () => {
      const userOptions: Options = {
        // @ts-expect-error: test
        createSitemapItems: 'not a function',
      };
      expect(() =>
        testValidate(userOptions),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "createSitemapItems" must be of type function]`,
      );
    });
  });
});
