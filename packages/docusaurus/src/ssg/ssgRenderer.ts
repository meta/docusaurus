/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createRequire} from 'node:module';
import path from 'node:path';
import {compileFunction} from 'node:vm';
import pMap from 'p-map';
import logger, {PerfLogger} from '@docusaurus/logger';
import {getHtmlMinifier} from '@docusaurus/bundler';
import {fs} from '@docusaurus/fs';
import {
  compileSSGTemplate,
  renderSSGTemplate,
  type SSGTemplateCompiled,
} from './ssgTemplate';
import {SSGConcurrency} from './ssgEnv';
import {writeStaticFile} from './ssgUtils';
import type {SSGParams} from './ssgParams';
import type {
  AppRenderer,
  PageCollectedData,
  PageCollectedDataInternal,
} from '../common';
import type {HtmlMinifier} from '@docusaurus/bundler';

export type SSGSuccess = {
  success: true;
  pathname: string;
  result: {
    collectedData: PageCollectedData;
    warnings: string[];
    // html: we don't include it on purpose!
    // we don't need to aggregate all html contents in memory!
    // html contents can be GC as soon as they are written to disk
  };
};

export type SSGError = {
  success: false;
  pathname: string;
  error: Error;
};

export type SSGResult = SSGSuccess | SSGError;

// Evaluates the server bundle as a CommonJS module, like Node.js would do
// We don't use an isolated vm context on purpose: SSG runs in worker threads
// that already isolate it from the main Docusaurus process
// Running in the current context is faster and avoids reading all the globals
function evaluateServerBundle({
  source,
  serverBundlePath,
}: {
  source: string;
  serverBundlePath: string;
}): {default?: AppRenderer['render']} {
  const moduleFunction = compileFunction(
    source,
    ['exports', 'require', 'module', '__filename', '__dirname'],
    {filename: serverBundlePath},
  );
  const module = {exports: {}};
  moduleFunction.call(
    module.exports,
    module.exports,
    createRequire(serverBundlePath),
    module,
    serverBundlePath,
    path.dirname(serverBundlePath),
  );
  return module.exports;
}

async function loadAppRenderer({
  serverBundlePath,
}: {
  serverBundlePath: string;
}): Promise<AppRenderer> {
  const source = await PerfLogger.async(`Load server bundle`, () =>
    fs.readFile(serverBundlePath, 'utf8'),
  );

  const serverEntry = await PerfLogger.async(`Evaluate server bundle`, () =>
    evaluateServerBundle({source, serverBundlePath}),
  );

  if (!serverEntry?.default || typeof serverEntry.default !== 'function') {
    throw new Error(
      `Docusaurus Bug: server bundle export from "${serverBundlePath}" must be a function that renders the Docusaurus React app, not ${typeof serverEntry?.default}`,
    );
  }

  return {render: serverEntry.default};
}

export type SSGRenderer = {
  renderPathnames: (pathnames: string[]) => Promise<SSGResult[]>;
};

export async function loadSSGRenderer({
  params,
}: {
  params: SSGParams;
}): Promise<SSGRenderer> {
  const [appRenderer, htmlMinifier, ssgTemplate] = await Promise.all([
    PerfLogger.async('Load App renderer', () =>
      loadAppRenderer({
        serverBundlePath: params.serverBundlePath,
      }),
    ),
    PerfLogger.async('Load HTML minifier', () => getHtmlMinifier()),
    PerfLogger.async('Compile SSG template', () =>
      compileSSGTemplate(params.ssgTemplateContent),
    ),
  ]);

  return {
    renderPathnames: (pathnames) => {
      return pMap<string, SSGResult>(
        pathnames,
        async (pathname) =>
          generateStaticFile({
            pathname,
            appRenderer,
            params,
            htmlMinifier,
            ssgTemplate,
          }),
        {concurrency: SSGConcurrency},
      );
    },
  };
}

// We reduce the page collected data structure after the HTML file is written
// Some data (modules, metadata.internal) is only useful to create the HTML file
// It's not useful to aggregate that collected data in memory
// Keep this data structure as small as possible
// See https://github.com/facebook/docusaurus/pull/11162
function reduceCollectedData(
  pageCollectedData: PageCollectedDataInternal,
): PageCollectedData {
  // We re-create the object from scratch
  // We absolutely want to avoid TS duck typing
  return {
    anchors: pageCollectedData.anchors,
    metadata: {
      public: pageCollectedData.metadata.public,
    },
    links: pageCollectedData.links,
  };
}

async function generateStaticFile({
  pathname,
  appRenderer,
  params,
  htmlMinifier,
  ssgTemplate,
}: {
  pathname: string;
  appRenderer: AppRenderer;
  params: SSGParams;
  htmlMinifier: HtmlMinifier;
  ssgTemplate: SSGTemplateCompiled;
}): Promise<SSGResult> {
  try {
    // This only renders the app HTML
    const appRenderResult = await appRenderer.render({pathname});
    // This renders the full page HTML, including head tags...
    const fullPageHtml = renderSSGTemplate({
      params,
      result: appRenderResult,
      ssgTemplate,
    });
    const minifierResult = await htmlMinifier.minify(fullPageHtml);
    await writeStaticFile({
      pathname,
      content: minifierResult.code,
      params,
    });

    const collectedData = reduceCollectedData(appRenderResult.collectedData);

    return {
      success: true,
      pathname,
      result: {
        collectedData,
        // As of today, only the html minifier can emit SSG warnings
        warnings: minifierResult.warnings,
      },
    };
  } catch (errorUnknown) {
    const error = errorUnknown as Error;
    const tips = getSSGErrorTips(error);
    const message = logger.interpolate`Can't render static file for pathname path=${pathname}${
      tips ? `\n\n${tips}` : ''
    }`;
    return {
      success: false,
      pathname,
      error: new Error(message, {
        cause: error,
      }),
    };
  }
}

function getSSGErrorTips(error: Error): string {
  const parts = [];

  const isNotDefinedErrorRegex =
    /(?:window|document|localStorage|navigator|alert|location|buffer|self) is not defined/i;
  if (isNotDefinedErrorRegex.test(error.message)) {
    parts.push(`It looks like you are using code that should run on the client-side only.
To get around it, try using one of:
- ${logger.code('<BrowserOnly>')} (${logger.url(
      'https://docusaurus.io/docs/docusaurus-core/#browseronly',
    )})
- ${logger.code('ExecutionEnvironment')} (${logger.url(
      'https://docusaurus.io/docs/docusaurus-core/#executionenvironment',
    )}).
It might also require to wrap your client code in ${logger.code(
      'useEffect',
    )} hook and/or import a third-party library dynamically (if any).`);
  }

  return parts.join('\n');
}
