/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Joi} from '@docusaurus/utils-validation';
import type {ThemeConfig} from '@docusaurus/theme-live-codeblock';
import type {ThemeConfigValidationContext} from '@docusaurus/types';

export const DEFAULT_CONFIG = {
  playgroundPosition: 'bottom',
};

export const Schema = Joi.object<ThemeConfig>({
  liveCodeBlock: Joi.object({
    playgroundPosition: Joi.string()
      .equal('top', 'bottom')
      .default(DEFAULT_CONFIG.playgroundPosition),
  })
    .label('themeConfig.liveCodeBlock')
    .default(DEFAULT_CONFIG),
});

export function validateThemeConfig({
  validate,
  themeConfig,
}: ThemeConfigValidationContext<ThemeConfig>): ThemeConfig {
  return validate(Schema, themeConfig);
}
