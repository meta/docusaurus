/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import Joi from '../Joi';
import {JoiFrontMatter} from '../JoiFrontMatter';
import {
  normalizePluginOptions,
  normalizeThemeConfig,
  validateFrontMatter,
} from '../validationUtils';

describe('normalizePluginOptions', () => {
  it('always adds an "id" field', () => {
    const options = {id: 'a'};
    expect(
      normalizePluginOptions(
        // "Malicious" schema that tries to forbid "id"
        Joi.object({id: Joi.any().forbidden()}),
        options,
      ),
    ).toEqual(options);
    expect(
      normalizePluginOptions(Joi.object({foo: Joi.string()}), undefined),
    ).toEqual({id: 'default'});
  });

  it('normalizes plugin options', () => {
    const options = {};
    expect(
      normalizePluginOptions(
        Joi.object({foo: Joi.string().default('a')}),
        options,
      ),
    ).toEqual({foo: 'a', id: 'default'});
  });

  it('throws for invalid options', () => {
    const options = {foo: 1};
    expect(() =>
      normalizePluginOptions(Joi.object<object>({foo: Joi.string()}), options),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "foo" must be a string]`,
    );
  });

  it('warns', () => {
    using warn = vi.spyOn(console, 'warn');

    const options = {foo: 'a'};
    expect(
      normalizePluginOptions(
        Joi.object({foo: Joi.string().warning('deprecated', {})}).messages({
          deprecated: '{#label} deprecated',
        }),
        options,
      ),
    ).toEqual({foo: 'a', id: 'default'});
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/"foo" deprecated/),
    );
  });
});

describe('normalizeThemeConfig', () => {
  it('always allows unknown attributes', () => {
    const themeConfig = {foo: 'a', bar: 1};
    expect(
      normalizeThemeConfig(
        // "Malicious" schema that tries to forbid extra properties
        Joi.object({foo: Joi.string()}).unknown(false),
        themeConfig,
      ),
    ).toEqual(themeConfig);
  });

  it('normalizes theme config', () => {
    const themeConfig = {bar: 1};
    expect(
      normalizeThemeConfig(
        Joi.object({foo: Joi.string().default('a')}),
        themeConfig,
      ),
    ).toEqual({bar: 1, foo: 'a'});
  });

  it('throws for invalid options', () => {
    const themeConfig = {foo: 1, bar: 1};
    expect(() =>
      normalizeThemeConfig(
        Joi.object<object>({foo: Joi.string()}),
        themeConfig,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "foo" must be a string]`,
    );
  });

  it('warns', () => {
    using warn = vi.spyOn(console, 'warn');

    const themeConfig = {foo: 'a', bar: 1};
    expect(
      normalizeThemeConfig(
        Joi.object({foo: Joi.string().warning('deprecated', {})}).messages({
          deprecated: '{#label} deprecated',
        }),
        themeConfig,
      ),
    ).toEqual(themeConfig);
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/"foo" deprecated/),
    );
  });
});

describe('validateFrontMatter', () => {
  it('accepts good values', () => {
    const schema = Joi.object<{test: string}>({
      test: Joi.string(),
    });
    const frontMatter = {
      test: 'hello',
    };
    expect(validateFrontMatter(frontMatter, schema)).toEqual(frontMatter);
  });

  it('rejects bad values', () => {
    using error = vi.spyOn(console, 'error');

    const schema = Joi.object<{test: string}>({
      test: Joi.string(),
    });
    const frontMatter = {
      test: true,
    };
    expect(() =>
      validateFrontMatter(frontMatter, schema),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "test" must be a string]`,
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('The following front matter'),
    );
  });

  it('does not convert simple values', () => {
    const schema = Joi.object({
      test: JoiFrontMatter.string(),
    });
    const frontMatter = {
      test: 'foo',
      tags: ['foo', 'bar'],
    };
    expect(validateFrontMatter(frontMatter, schema)).toEqual(frontMatter);
  });

  // Fix Yaml trying to convert strings to numbers automatically
  // We only want to deal with a single type in the final front matter
  // (not string | number)
  it('converts number values to string when string schema', () => {
    const schema = Joi.object<{test: string}>({
      test: JoiFrontMatter.string(),
    });
    const frontMatter = {
      test: 42,
    };
    expect(validateFrontMatter(frontMatter, schema)).toEqual({test: '42'});
  });

  // Helps to fix Yaml trying to convert strings to dates automatically
  // We only want to deal with a single type in the final front matter
  // (not string | Date)
  it('converts date values when string schema', () => {
    const schema = Joi.object<{test: string}>({
      test: JoiFrontMatter.string(),
    });
    const date = new Date();
    const frontMatter = {
      test: date,
    };
    expect(validateFrontMatter(frontMatter, schema)).toEqual({
      test: date.toString(),
    });
  });
});
