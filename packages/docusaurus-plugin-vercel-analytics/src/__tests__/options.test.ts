/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {normalizePluginOptions} from '@docusaurus/utils-validation';
import {validateOptions, type PluginOptions, type Options} from '../options';
import type {Validate} from '@docusaurus/types';

function testValidateOptions(options: Options) {
  return validateOptions({
    validate: normalizePluginOptions as Validate<Options, PluginOptions>,
    options,
  });
}

function validationResult(options: Options) {
  return {
    id: 'default',
    ...options,
  };
}

describe('validateOptions', () => {
  it('accepts for undefined options', () => {
    // @ts-expect-error: TS should error
    expect(testValidateOptions(undefined)).toEqual(validationResult(undefined));
  });

  it('throws for custom id', () => {
    const config: Options = {id: 'custom', mode: 'auto', debug: false};
    expect(() => testValidateOptions(config))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: You site uses the Vercel Analytics plugin with a custom plugin id (custom).
              But this plugin is only supposed to be used at most once per site. Therefore providing a custom plugin id is unsupported.]
      `);
  });

  it('accept for default id', () => {
    const config: Options = {id: 'default', mode: 'auto', debug: false};
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('throws for null options', () => {
    // @ts-expect-error: TS should error
    expect(() => testValidateOptions(null)).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "value" must be of type object]`,
    );
  });

  it('accept for empty object options', () => {
    const config: Options = {};
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('throws for number options', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions(42),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "value" must be of type object]`,
    );
  });

  it('throws for null mode', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions({mode: null}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "mode" must be one of [auto, production, development]]`,
    );
  });
  it('throws for number mode', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions({mode: 42}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "mode" must be one of [auto, production, development]]`,
    );
  });
  it('throws for empty mode', () => {
    expect(() =>
      // @ts-expect-error: TS should error
      testValidateOptions({mode: ''}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "mode" must be one of [auto, production, development]]`,
    );
  });

  it('accepts debug true', () => {
    const config: Options = {
      debug: true,
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('accepts debug false', () => {
    const config: Options = {
      debug: false,
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('accepts mode prod', () => {
    const config: Options = {
      mode: 'production',
      debug: false,
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('accepts mode dev', () => {
    const config: Options = {
      mode: 'development',
      debug: false,
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('accepts mode prod with debug', () => {
    const config: Options = {
      mode: 'production',
      debug: true,
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('accepts mode dev with debug', () => {
    const config: Options = {
      mode: 'development',
      debug: true,
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });
});
