/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {renderDevHtml} from '../dev.html.template';

describe('renderDevHtml', () => {
  it('renders dev html', () => {
    expect(
      renderDevHtml({
        lang: 'fr-FR',
        title: 'My <Site> & "co"',
        headTags: '<meta name="head">',
        preBodyTags: '<div id="pre"></div>',
        postBodyTags: '<div id="post"></div>',
        scripts: ['/base/runtime~main.js', '/base/main.js'],
        stylesheets: ['/base/styles.css'],
      }),
    ).toMatchInlineSnapshot(`
      "<!DOCTYPE html>
      <html lang="fr-FR">
        <head>
          <meta charset="utf-8">
          <meta name="generator" content="Docusaurus">
          <title>My &lt;Site&gt; &amp; &quot;co&quot;</title>
          <meta name="head">
          <script defer src="/base/runtime~main.js"></script><script defer src="/base/main.js"></script>
          <link href="/base/styles.css" rel="stylesheet">
        </head>
        <body>
          <div id="pre"></div>
          <div id="__docusaurus"></div>
          <div id="post"></div>
        </body>
      </html>
      "
    `);
  });
});
