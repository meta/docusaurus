/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {validateThemeConfig, DEFAULT_CONFIG} from '../validateThemeConfig';
import type {Joi} from '@docusaurus/utils-validation';
import type {ThemeConfig} from '@docusaurus/theme-live-codeblock';

function testValidateThemeConfig(themeConfig: {[key: string]: unknown}) {
  function validate(schema: Joi.ObjectSchema<ThemeConfig>, cfg: ThemeConfig) {
    const {value, error} = schema.validate(cfg, {
      convert: false,
    });
    if (error) {
      throw error;
    }
    return value;
  }

  // Some tests pass invalid theme configs on purpose
  return validateThemeConfig({
    validate,
    themeConfig: themeConfig as ThemeConfig,
  });
}

describe('validateThemeConfig', () => {
  it('undefined config', () => {
    const liveCodeBlock = undefined;
    expect(testValidateThemeConfig({liveCodeBlock})).toEqual({
      liveCodeBlock: {
        ...DEFAULT_CONFIG,
      },
    });
  });

  it('nonexistent config', () => {
    expect(testValidateThemeConfig({})).toEqual({
      liveCodeBlock: {
        ...DEFAULT_CONFIG,
      },
    });
  });

  it('empty config', () => {
    const liveCodeBlock = {};
    expect(testValidateThemeConfig({liveCodeBlock})).toEqual({
      liveCodeBlock: {
        ...DEFAULT_CONFIG,
      },
    });
  });

  it('playgroundPosition top', () => {
    const liveCodeBlock = {
      playgroundPosition: 'top',
    };
    expect(testValidateThemeConfig({liveCodeBlock})).toEqual({
      liveCodeBlock: {
        ...DEFAULT_CONFIG,
        ...liveCodeBlock,
      },
    });
  });

  it('playgroundPosition bottom', () => {
    const liveCodeBlock = {
      playgroundPosition: 'bottom',
    };
    expect(testValidateThemeConfig({liveCodeBlock})).toEqual({
      liveCodeBlock: {
        ...DEFAULT_CONFIG,
        ...liveCodeBlock,
      },
    });
  });

  it('playgroundPosition invalid string', () => {
    const liveCodeBlock = {playgroundPosition: 'invalid'};
    expect(() =>
      testValidateThemeConfig({liveCodeBlock}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "liveCodeBlock.playgroundPosition" must be one of [top, bottom]]`,
    );
  });
  it('playgroundPosition invalid boolean', () => {
    const liveCodeBlock = {playgroundPosition: true};
    expect(() =>
      testValidateThemeConfig({liveCodeBlock}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "liveCodeBlock.playgroundPosition" must be one of [top, bottom]]`,
    );
  });
});
