/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  validateThemeConfig,
  DEFAULT_THEME_CONFIG,
} from '../validateThemeConfig';
import type {Joi} from '@docusaurus/utils-validation';
import type {ThemeConfig, UserThemeConfig} from '@docusaurus/theme-mermaid';

function testValidateThemeConfig(themeConfig: UserThemeConfig) {
  function validate(
    schema: Joi.ObjectSchema<ThemeConfig>,
    cfg: UserThemeConfig,
  ) {
    const {value, error} = schema.validate(cfg, {
      convert: false,
    });
    if (error) {
      throw error;
    }
    return value;
  }

  return validateThemeConfig({validate, themeConfig});
}

describe('validateThemeConfig', () => {
  it('undefined config', () => {
    const mermaid = undefined;
    expect(testValidateThemeConfig({mermaid})).toEqual(DEFAULT_THEME_CONFIG);
  });

  it('nonexistent config', () => {
    expect(testValidateThemeConfig({})).toEqual(DEFAULT_THEME_CONFIG);
  });

  it('empty config', () => {
    const mermaid = {};
    expect(testValidateThemeConfig({mermaid})).toEqual(DEFAULT_THEME_CONFIG);
  });

  it('theme', () => {
    const mermaid = {
      theme: {
        light: 'default',
        dark: 'dark',
      },
    } satisfies UserThemeConfig['mermaid'];
    expect(testValidateThemeConfig({mermaid})).toEqual({
      mermaid: {
        ...DEFAULT_THEME_CONFIG.mermaid,
        ...mermaid,
      },
    });
  });

  it.each(['dagre', 'elk'])('mermaid options with %s layout', (layout) => {
    const mermaid = {
      options: {
        fontFamily: 'Ariel',
        layout,
        look: 'classic',
      },
    } satisfies UserThemeConfig['mermaid'];
    expect(testValidateThemeConfig({mermaid})).toEqual({
      mermaid: {
        ...DEFAULT_THEME_CONFIG.mermaid,
        ...mermaid,
      },
    });
  });
});
