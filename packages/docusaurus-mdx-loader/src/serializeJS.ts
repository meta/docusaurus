/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {generate} from 'astring';
import {valueToEstree} from 'estree-util-value-to-estree';

/**
 * Serializes a value to a JS expression string, that can be inlined in the
 * code of a generated JS module, such as the front matter of an MDX file:
 *
 * `export const frontMatter = ${serializeJS(frontMatter)};`
 *
 * Contrary to JSON, the output preserves values such as `undefined`, `NaN`,
 * `Infinity` or `Date` instances.
 */
export function serializeJS(value: unknown): string {
  return generate(valueToEstree(value, {instanceAsObject: true}));
}
