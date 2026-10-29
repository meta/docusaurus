/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Eta} from 'eta';
import {getBundles} from 'react-loadable-ssr-addon-v5-slorber';
import {PerfLogger} from '@docusaurus/logger';
import type {SSGParams} from './ssgParams';
import type {AppRenderResult} from '../common';
import type {Manifest} from 'react-loadable-ssr-addon-v5-slorber';

/**
 * The data that the `siteConfig.ssgTemplate` receives as the `it` variable.
 * Changing it is a breaking change because the template is configurable.
 * Attributes and tags are pre-rendered HTML strings.
 */
type SSGTemplateData = {
  /** The Docusaurus version */
  version: string;
  /** The site base URL, or `./` with the hash router */
  baseUrl: string;
  html: {
    /** The `<html>` attributes, set by the page with `<Head>` */
    attributes: string;
  };
  head: {
    /** The `<head>` tags set by the page with `<Head>` */
    pageTags: string;
    /** The `headTags` of the plugins `injectHtmlTags()` lifecycle */
    pluginTags: string;
  };
  body: {
    /** The `<body>` attributes, set by the page with `<Head>` */
    attributes: string;
    /** The `preBodyTags` of the plugins `injectHtmlTags()` lifecycle */
    preTags: string;
    /** The server-side rendered React app */
    appHtml: string;
    /** The `postBodyTags` of the plugins `injectHtmlTags()` lifecycle */
    postTags: string;
  };
  assets: {
    /** The URLs of the CSS files the page needs */
    stylesheets: string[];
    /** The URLs of the JS files the page needs */
    scripts: string[];
  };
};

export type SSGTemplateCompiled = (data: SSGTemplateData) => string;

export async function compileSSGTemplate(
  template: string,
): Promise<SSGTemplateCompiled> {
  const eta = new Eta({rmWhitespace: true});
  const compiledTemplate = eta.compile(template.trim());

  return (data: SSGTemplateData) => eta.render(compiledTemplate, data);
}

/**
 * Returns the URLs of the JS/CSS assets required to render a page, based on
 * the modules that were server-side rendered and the client manifest.
 */
function getAssets({
  baseUrl,
  modules,
  manifest,
}: {
  baseUrl: string;
  modules: string[];
  manifest: Manifest;
}): SSGTemplateData['assets'] {
  const modulesToBeLoaded = [...manifest.entrypoints, ...modules];
  const bundles = getBundles(manifest, modulesToBeLoaded);
  const toUrl = (bundle: {file: string}) => `${baseUrl}${bundle.file}`;
  return {
    stylesheets: (bundles.css ?? []).map(toUrl),
    scripts: (bundles.js ?? []).map(toUrl),
  };
}

export function renderSSGTemplate({
  params,
  result,
  ssgTemplate,
}: {
  params: SSGParams;
  result: AppRenderResult;
  ssgTemplate: SSGTemplateCompiled;
}): string {
  const {
    baseUrl,
    headTags,
    preBodyTags,
    postBodyTags,
    manifest,
    DOCUSAURUS_VERSION,
  } = params;
  const {
    html: appHtml,
    collectedData: {modules, metadata},
  } = result;
  const {htmlAttributes, bodyAttributes, title, meta, link, script} =
    metadata.internal;

  const data: SSGTemplateData = {
    version: DOCUSAURUS_VERSION,
    baseUrl,
    html: {attributes: htmlAttributes},
    head: {
      pageTags: [title, meta, link, script].join(''),
      pluginTags: headTags,
    },
    body: {
      attributes: bodyAttributes,
      preTags: preBodyTags,
      appHtml,
      postTags: postBodyTags,
    },
    assets: getAssets({baseUrl, manifest, modules}),
  };

  return ssgTemplate(data);
}

export async function renderHashRouterTemplate({
  params,
}: {
  params: SSGParams;
}): Promise<string> {
  const {
    headTags,
    preBodyTags,
    postBodyTags,
    manifest,
    DOCUSAURUS_VERSION,
    ssgTemplateContent,
  } = params;

  const ssgTemplate = await PerfLogger.async('Compile SSG template', () =>
    compileSSGTemplate(ssgTemplateContent),
  );

  // The hash router site can be opened from the file system: use relative URLs
  const baseUrl = './';

  const data: SSGTemplateData = {
    version: DOCUSAURUS_VERSION,
    baseUrl,
    html: {attributes: ''},
    head: {pageTags: '', pluginTags: headTags},
    body: {
      attributes: '',
      preTags: preBodyTags,
      appHtml: '',
      postTags: postBodyTags,
    },
    assets: getAssets({baseUrl, manifest, modules: []}),
  };

  return ssgTemplate(data);
}
