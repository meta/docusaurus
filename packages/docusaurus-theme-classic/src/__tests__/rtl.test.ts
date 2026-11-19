/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import pluginCssCascadeLayers from '@docusaurus/plugin-css-cascade-layers';
import themeClassic from '../index';
import {DEFAULT_CONFIG} from '../options';
import type {LoadContext, PostCssOptions} from '@docusaurus/types';
import type {PluginOptions} from '@docusaurus/theme-classic';

const context = {
  siteDir: '/site',
  generatedFilesDir: '/site/.docusaurus',
  siteConfig: {themeConfig: DEFAULT_CONFIG},
  i18n: {
    currentLocale: 'fa',
    localeConfigs: {fa: {direction: 'rtl'}},
  },
} as unknown as LoadContext;

const options = {customCss: []} as unknown as PluginOptions;

// Same plugin order as a site using the classic preset
async function processRtlCss(css: string) {
  let postCssOptions: PostCssOptions = {
    // Part of the browserslist defaults: preset-env adds var() fallbacks
    plugins: [postcssPresetEnv({browsers: 'op_mini all'})],
  };
  postCssOptions = pluginCssCascadeLayers(context, {
    id: 'default',
    layers: {'docusaurus.infima': () => true},
  })!.configurePostCss!(postCssOptions);
  postCssOptions = themeClassic(context, options).configurePostCss!(
    postCssOptions,
  );
  const result = await postcss(
    postCssOptions.plugins as postcss.AcceptedPlugin[],
  ).process(css, {from: '/site/infima.css'});
  return result.css;
}

describe('theme-classic RTL', () => {
  it('flips the var() fallbacks of postcss-preset-env in cascade layers', async () => {
    await expect(
      processRtlCss(
        ':root{--list-padding:2rem}ul{padding-left:var(--list-padding)}',
      ),
    ).resolves.toMatchInlineSnapshot(
      `":root:not(#/#):not(#/#){--list-padding:2rem}ul:not(#/#):not(#/#){padding-right:2rem;padding-right:var(--list-padding)}"`,
    );
  });
});
