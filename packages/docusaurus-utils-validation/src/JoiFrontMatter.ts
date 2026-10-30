/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Joi from './Joi';

const JoiFrontMatterString: Joi.Extension = {
  type: 'string',
  base: Joi.string(),
  // Fix Yaml that tries to auto-convert many things to string out of the box
  prepare: (value: unknown) => {
    if (typeof value === 'number' || value instanceof Date) {
      return {value: value.toString()};
    }
    return {value};
  },
};

/**
 * Enhance the default `Joi.string()` type so that it can convert number to
 * strings. If user use front matter "tag: 2021", we shouldn't need to ask her
 * to write "tag: '2021'". Also yaml tries to convert patterns like "2019-01-01"
 * to dates automatically.
 *
 * @see https://github.com/meta/docusaurus/issues/4642
 * @see https://github.com/sideway/joi/issues/1442#issuecomment-823997884
 */
export const JoiFrontMatter = Joi.extend(JoiFrontMatterString) as typeof Joi;
