/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {Joi} from '@docusaurus/utils-validation';
import type {OptionValidationContext} from '@docusaurus/types';

export type PluginOptions = {
  rsdoctorOptions: Record<string, unknown>;
};

export type Options = {
  rsdoctorOptions?: Record<string, unknown>;
};

export const DEFAULT_OPTIONS: Partial<PluginOptions> = {
  rsdoctorOptions: {},
};

const pluginOptionsSchema = Joi.object<PluginOptions>({
  rsdoctorOptions: Joi.object()
    .pattern(Joi.string(), Joi.any())
    .optional()
    .default(DEFAULT_OPTIONS.rsdoctorOptions),
}).default(DEFAULT_OPTIONS);

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options | undefined, PluginOptions>): PluginOptions {
  return validate(pluginOptionsSchema, options);
}
