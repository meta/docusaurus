/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import escapeHTML from 'escape-html';
import type {DevHtmlAssets} from '../plugins/DevHtmlPlugin';

export type DevHtmlTemplateParams = DevHtmlAssets & {
  lang: string;
  title: string;
  headTags: string;
  preBodyTags: string;
  postBodyTags: string;
};

// HTML page served by "docusaurus start", the app is only rendered client-side
export function renderDevHtml({
  lang,
  title,
  headTags,
  preBodyTags,
  postBodyTags,
  scripts,
  stylesheets,
}: DevHtmlTemplateParams): string {
  return `<!DOCTYPE html>
<html lang="${escapeHTML(lang)}">
  <head>
    <meta charset="utf-8">
    <meta name="generator" content="Docusaurus">
    <title>${escapeHTML(title)}</title>
    ${headTags}
    ${scripts.map((src) => `<script defer src="${escapeHTML(src)}"></script>`).join('')}
    ${stylesheets.map((href) => `<link href="${escapeHTML(href)}" rel="stylesheet">`).join('')}
  </head>
  <body>
    ${preBodyTags}
    <div id="__docusaurus"></div>
    ${postBodyTags}
  </body>
</html>
`;
}
