/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import DefaultSSGTemplate from '../ssgTemplate.html';
import {
  compileSSGTemplate,
  renderHashRouterTemplate,
  renderSSGTemplate,
} from '../ssgTemplate';
import type {SSGParams} from '../ssgParams';
import type {AppRenderResult} from '../../common';
import type {Manifest} from 'react-loadable-ssr-addon-v5-slorber';

// The Manifest type of deps.d.ts doesn't match the runtime data structure
const manifest = {
  entrypoints: ['main'],
  origins: {main: [1], './src/pages/index.js': [2]},
  assets: {
    1: {
      js: [{file: 'assets/js/main.js'}],
      css: [{file: 'assets/css/styles.css'}],
    },
    2: {js: [{file: 'assets/js/index.js'}]},
  },
} as unknown as Manifest;

function createParams(overrides: Partial<SSGParams> = {}): SSGParams {
  return {
    trailingSlash: undefined,
    manifest,
    headTags: '<link rel="preconnect" href="https://example.com">',
    preBodyTags: '<script>/* pre-body */</script>',
    postBodyTags: '<script>/* post-body */</script>',
    outDir: '/build',
    baseUrl: '/base/',
    DOCUSAURUS_VERSION: '4.0.0',
    serverBundlePath: '/server.js',
    ssgTemplateContent: DefaultSSGTemplate,
    ...overrides,
  };
}

const result: AppRenderResult = {
  html: '<main>Hello</main>',
  collectedData: {
    metadata: {
      public: {noIndex: false},
      internal: {
        htmlAttributes: 'lang="en" dir="ltr"',
        bodyAttributes: 'class="navigation-with-keyboard"',
        title: '<title data-rh="true">Hello</title>',
        meta: '<meta data-rh="true" name="description" content="Hello">',
        link: '<link data-rh="true" rel="canonical" href="https://example.com/base/">',
        script: '',
      },
    },
    modules: ['./src/pages/index.js'],
    links: [],
    anchors: [],
  },
};

describe('renderSSGTemplate', () => {
  it('renders the default template', async () => {
    const ssgTemplate = await compileSSGTemplate(DefaultSSGTemplate);
    expect(renderSSGTemplate({params: createParams(), result, ssgTemplate}))
      .toMatchInlineSnapshot(`
      "<!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
      <meta charset="UTF-8">
      <meta name="generator" content="Docusaurus v<CURRENT_VERSION>">
      <title data-rh="true">Hello</title><meta data-rh="true" name="description" content="Hello"><link data-rh="true" rel="canonical" href="https://example.com/base/"><link rel="preconnect" href="https://example.com"><link rel="stylesheet" href="/base/assets/css/styles.css" />
      <script src="/base/assets/js/main.js" defer></script>
      <script src="/base/assets/js/index.js" defer></script>
      </head>
      <body class="navigation-with-keyboard">
      <script>/* pre-body */</script><div id="__docusaurus"><main>Hello</main></div>
      <script>/* post-body */</script></body>
      </html>"
    `);
  });
});

describe('renderHashRouterTemplate', () => {
  it('renders the default template', async () => {
    await expect(renderHashRouterTemplate({params: createParams()})).resolves
      .toMatchInlineSnapshot(`
      "<!DOCTYPE html>
      <html >
      <head>
      <meta charset="UTF-8">
      <meta name="generator" content="Docusaurus v<CURRENT_VERSION>">
      <link rel="preconnect" href="https://example.com"><link rel="stylesheet" href="./assets/css/styles.css" />
      <script src="./assets/js/main.js" defer></script>
      </head>
      <body >
      <script>/* pre-body */</script><div id="__docusaurus"></div>
      <script>/* post-body */</script></body>
      </html>"
    `);
  });
});
