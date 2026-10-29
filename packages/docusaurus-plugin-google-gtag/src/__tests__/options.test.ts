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
    trackingID:
      typeof options.trackingID === 'string'
        ? [options.trackingID]
        : options.trackingID,
  };
}

const MinimalConfig: Options = {
  trackingID: 'G-XYZ12345',
};

describe('validateOptions', () => {
  it('throws for undefined options', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions(undefined),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" is required]`,
    );
  });

  it('throws for null options', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions(null),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "value" must be of type object]`,
    );
  });

  it('throws for empty object options', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions({}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" is required]`,
    );
  });

  it('throws for number options', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions(42),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "value" must be of type object]`,
    );
  });

  it('throws for null trackingID', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions({trackingID: null}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" does not match any of the allowed types]`,
    );
  });
  it('throws for number trackingID', () => {
    expect(
      // @ts-expect-error: TS should error
      () => testValidateOptions({trackingID: 42}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" does not match any of the allowed types]`,
    );
  });
  it('throws for empty trackingID', () => {
    expect(() =>
      testValidateOptions({trackingID: ''}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" does not match any of the allowed types]`,
    );
  });

  it('accepts minimal config', () => {
    expect(testValidateOptions(MinimalConfig)).toEqual(
      validationResult(MinimalConfig),
    );
  });

  it('accepts single trackingID', () => {
    const config: Options = {
      trackingID: 'G-ABCDEF123',
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('accepts multiple trackingIDs', () => {
    const config: Options = {
      trackingID: ['G-ABCDEF123', 'UA-XYZ456789'],
    };
    expect(testValidateOptions(config)).toEqual(validationResult(config));
  });

  it('throws for empty trackingID arrays', () => {
    const config: Options = {
      // @ts-expect-error: TS should error
      trackingID: [],
    };
    expect(() =>
      testValidateOptions(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" does not match any of the allowed types]`,
    );
  });

  it('throws for sparse trackingID arrays', () => {
    const config: Options = {
      // @ts-expect-error: TS should error
      trackingID: ['G-ABCDEF123', null, 'UA-XYZ456789'],
    };
    expect(() =>
      testValidateOptions(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" does not match any of the allowed types]`,
    );
  });

  it('throws for bad trackingID arrays', () => {
    const config: Options = {
      // @ts-expect-error: TS should error
      trackingID: ['G-ABCDEF123', 42],
    };
    expect(() =>
      testValidateOptions(config),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "trackingID" does not match any of the allowed types]`,
    );
  });
});
