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
  type PluginOptions,
  type Options,
  DEFAULT_OPTIONS,
} from '../options';
import type {Validate} from '@docusaurus/types';

function testValidateOptions(options: Options) {
  return validateOptions({
    validate: normalizePluginOptions as Validate<Options, PluginOptions>,
    options,
  });
}

describe('validateOptions', () => {
  it('accepts undefined options', () => {
    // @ts-expect-error: should error
    expect(testValidateOptions(undefined)).toEqual(DEFAULT_OPTIONS);
  });

  it('accepts empty options', () => {
    expect(testValidateOptions({})).toEqual(DEFAULT_OPTIONS);
  });

  describe('layers', () => {
    it('accepts empty layers', () => {
      expect(testValidateOptions({layers: {}})).toEqual({
        ...DEFAULT_OPTIONS,
        layers: {},
      });
    });

    it('accepts undefined layers', () => {
      const config: Options = {
        layers: undefined,
      };
      expect(testValidateOptions(config)).toEqual(DEFAULT_OPTIONS);
    });

    it('accepts custom layers', () => {
      const config: Options = {
        layers: {
          layer1: (filePath: string) => {
            return !!filePath;
          },
          layer2: (filePath: string) => {
            return !!filePath;
          },
        },
      };
      expect(testValidateOptions(config)).toEqual({
        ...DEFAULT_OPTIONS,
        layers: config.layers,
      });
    });

    it('rejects layer with bad name', () => {
      const config: Options = {
        layers: {
          'layer 1': (filePath) => !!filePath,
        },
      };
      expect(() =>
        testValidateOptions(config),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "layers.layer 1" is not allowed]`,
      );
    });

    it('rejects layer with bad value', () => {
      const config: Options = {
        layers: {
          // @ts-expect-error: should error
          layer1: 'bad value',
        },
      };
      expect(() =>
        testValidateOptions(config),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "layers.layer1" must be of type function]`,
      );
    });

    it('rejects layer with bad function arity', () => {
      const config: Options = {
        layers: {
          // @ts-expect-error: should error
          layer1: () => {},
        },
      };
      expect(() =>
        testValidateOptions(config),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValidationError: "layers.layer1" must have an arity of 1]`,
      );
    });
  });
});
