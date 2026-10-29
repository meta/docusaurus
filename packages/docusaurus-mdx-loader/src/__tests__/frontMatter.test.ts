/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, test} from 'vitest';
import {
  validateMDXFrontMatter,
  DefaultMDXFrontMatter,
  type MDXFrontMatter,
} from '../frontMatter';

function testField(params: {
  prefix: string;
  validFrontMatters: MDXFrontMatter[];
  convertibleFrontMatter?: [
    ConvertibleFrontMatter: {[key: string]: unknown},
    ConvertedFrontMatter: MDXFrontMatter,
  ][];
  invalidFrontMatters?: [
    InvalidFrontMatter: {[key: string]: unknown},
    ErrorMessage: string,
  ][];
}) {
  // eslint-disable-next-line vitest/require-top-level-describe
  test(`[${params.prefix}] accept valid values`, () => {
    params.validFrontMatters.forEach((frontMatter) => {
      expect(validateMDXFrontMatter(frontMatter)).toEqual(frontMatter);
    });
  });

  // eslint-disable-next-line vitest/require-top-level-describe
  test(`[${params.prefix}] convert valid values`, () => {
    params.convertibleFrontMatter?.forEach(
      ([convertibleFrontMatter, convertedFrontMatter]) => {
        expect(validateMDXFrontMatter(convertibleFrontMatter)).toEqual(
          convertedFrontMatter,
        );
      },
    );
  });

  // eslint-disable-next-line vitest/require-top-level-describe
  test(`[${params.prefix}] throw error for values`, () => {
    params.invalidFrontMatters?.forEach(([frontMatter, message]) => {
      try {
        validateMDXFrontMatter(frontMatter);
        throw new Error(
          `MDX front matter is expected to be rejected, but was accepted successfully:\n ${JSON.stringify(
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
}

describe('MDX front matter schema', () => {
  it('accepts empty object', () => {
    const frontMatter: Partial<MDXFrontMatter> = {};
    expect(validateMDXFrontMatter(frontMatter)).toEqual(DefaultMDXFrontMatter);
  });

  it('accepts undefined object', () => {
    expect(validateMDXFrontMatter(undefined)).toEqual(DefaultMDXFrontMatter);
  });

  it('rejects unknown field', () => {
    const frontMatter = {abc: '1'};
    expect(() =>
      validateMDXFrontMatter(frontMatter),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "abc" is not allowed]`,
    );
  });
});

describe('validateDocFrontMatter format', () => {
  testField({
    prefix: 'format',
    validFrontMatters: [
      {},
      {format: undefined},
      {format: 'detect'},
      {format: 'md'},
      {format: 'mdx'},
    ],
    invalidFrontMatters: [
      [{format: 'xdm'}, '"format" must be one of [md, mdx, detect]'],
      [{format: ''}, '"format" must be one of [md, mdx, detect]'],
      [{format: null}, '"format" must be one of [md, mdx, detect]'],
      [{unknownAttribute: 'mdx'}, '"unknownAttribute" is not allowed'],
    ],
  });
});
