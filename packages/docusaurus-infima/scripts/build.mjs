/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Inlines the upstream postcss-preset-infima and the transformStyles gulp task
// See https://github.com/facebookincubator/infima/blob/87bc1dbfde5dfb2a70b5ff105b5f2f5ee130c2ab/packages/postcss-preset-infima/index.js

import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import postcssColorModFunction from 'postcss-color-mod-function';
import postcssCombineDuplicatedSelectors from 'postcss-combine-duplicated-selectors';
import postcssEach from 'postcss-each';
import postcssFor from 'postcss-for';
import postcssImport from 'postcss-import';
import postcssMixins from 'postcss-mixins';
import postcssNested from 'postcss-nested';
import postcssNestedAncestors from 'postcss-nested-ancestors';
import postcssPresetEnv from 'postcss-preset-env-v7';
import postcssSortMediaQueries from 'postcss-sort-media-queries';

const packageDir = path.dirname(import.meta.dirname);
const entryFile = path.join(packageDir, 'styles/themes/default/default.pcss');
const outputFile = path.join(packageDir, 'dist/infima.css');

async function main() {
  const source = await fs.readFile(entryFile, 'utf8');
  const css = await compileInfima(source, entryFile);
  await fs.mkdir(path.dirname(outputFile), {recursive: true});
  await fs.writeFile(outputFile, css);
}

async function compileInfima(source, from) {
  const result = await postcss(getPlugins()).process(source, {from});
  return result.css;
}

// The plugin order matters
function getPlugins() {
  return [
    postcssImport,
    // TODO postcss-each v1 doesn't seem to be compatible due to color-mod.
    // Need to upgrade later
    postcssEach,
    postcssFor,
    postcssMixins({mixins: {transition: transitionMixin}}),
    postcssNestedAncestors,
    postcssNested,
    // color-mod has been removed from the spec, so it's not included in
    // preset-env. Using a separate plugin instead. We probably would eventually
    // get rid of color-mod
    postcssColorModFunction({unresolved: 'ignore'}),
    postcssPresetEnv({
      stage: 1,
      features: {
        'custom-properties': false,
      },
    }),
    postcssSortMediaQueries,
    postcssCombineDuplicatedSelectors,
  ];
}

// @mixin transition opacity visibility, var(--ifm-transition-fast), linear;
function transitionMixin(
  _mixin,
  properties,
  duration = 'var(--ifm-transition-fast)',
  timing = 'var(--ifm-transition-timing-default)',
) {
  if (properties.includes(' ')) {
    return {
      'transition-property': properties.replace(/\s/g, ', '),
      'transition-duration': duration,
      'transition-timing-function': timing,
    };
  }
  return {transition: [properties, duration, timing].join(' ')};
}

await main();
