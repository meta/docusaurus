/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import * as Yaml from 'js-yaml';
import {PluginIdSchema} from './validationSchemas';
import type {ValidationOptions} from 'joi';
import type Joi from './Joi';

/** Print warnings returned from Joi validation. */
export function printWarning(warning?: Joi.ValidationError): void {
  if (warning) {
    const warningMessages = warning.details
      .map(({message}) => message)
      .join('\n');
    logger.warn(warningMessages);
  }
}

/**
 * The callback that should be used to validate plugin options. Handles plugin
 * IDs on a generic level: no matter what the schema declares, this callback
 * would require a string ID or default to "default".
 */
export function normalizePluginOptions<T extends {id?: string}>(
  schema: Joi.ObjectSchema<T>,
  // This allows us to automatically normalize undefined to { id: "default" }
  options: Partial<T> = {},
): T {
  // All plugins can be provided an "id" option (multi-instance support)
  // we add schema validation automatically
  const finalSchema = schema.append({
    id: PluginIdSchema,
  });
  const {error, warning, value} = finalSchema.validate(options, {
    convert: false,
  });

  printWarning(warning);

  if (error) {
    throw error;
  }

  return value;
}

/**
 * The callback that should be used to validate theme config. No matter what the
 * schema declares, this callback would allow unknown attributes.
 */
export function normalizeThemeConfig<T>(
  schema: Joi.ObjectSchema<T>,
  themeConfig: Partial<T>,
): T {
  // A theme should only validate its "slice" of the full themeConfig,
  // not the whole object, so we allow unknown attributes
  // otherwise one theme would fail validating the data of another theme
  const finalSchema = schema.unknown();

  const {error, warning, value} = finalSchema.validate(themeConfig, {
    convert: false,
  });

  printWarning(warning);

  if (error) {
    throw error;
  }
  return value;
}

/**
 * Validate front matter with better error message
 */
export function validateFrontMatter<T>(
  frontMatter: unknown,
  schema: Joi.ObjectSchema<T>,
  options?: ValidationOptions,
): T {
  const {value, error, warning} = schema.validate(frontMatter, {
    convert: true,
    allowUnknown: true,
    abortEarly: false,
    ...options,
  });

  printWarning(warning);

  if (error) {
    const errorDetails = error.details;
    const invalidFields = errorDetails.map(({path}) => path).join(', ');

    logger.error`The following front matter:
---
${Yaml.dump(frontMatter)}---
contains invalid values for field(s): code=${invalidFields}.
${errorDetails.map(({message}) => message)}
`;
    throw error;
  }

  return value;
}
