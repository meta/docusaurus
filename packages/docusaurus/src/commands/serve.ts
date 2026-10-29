/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import http from 'node:http';
import path from 'node:path';
import logger from '@docusaurus/logger';
import {DEFAULT_BUILD_DIR_NAME} from '@docusaurus/utils';
import serveHandler from 'serve-handler';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import {realpath} from '@docusaurus/fs';
import openBrowser from './utils/openBrowser/openBrowser';
import {loadSiteConfig} from '../server/config';
import {build} from './build/build';
import {getHostPort, type HostPortOptions} from '../server/getHostPort';
import {listenToServer} from './utils/listenToServer';
import type {LoadContextParams} from '../server/site';

function redirect(res: http.ServerResponse, location: string) {
  res.writeHead(302, {
    Location: location,
  });
  res.end();
}

export type ServeCLIOptions = HostPortOptions &
  Pick<LoadContextParams, 'config'> & {
    dir?: string;
    build?: boolean;
    open?: boolean;
  };

export async function serve(
  siteDirParam: string = '.',
  cliOptions: Partial<ServeCLIOptions> = {},
): Promise<void> {
  const siteDir = await realpath(siteDirParam);

  const buildDir = cliOptions.dir ?? DEFAULT_BUILD_DIR_NAME;
  const outDir = path.resolve(siteDir, buildDir);

  if (cliOptions.build) {
    await build(siteDir, {
      config: cliOptions.config,
      outDir,
    });
  }

  const {host, port} = await getHostPort(cliOptions);

  if (port === null) {
    process.exit();
  }

  const {
    siteConfig: {baseUrl, trailingSlash},
  } = await loadSiteConfig({
    siteDir,
    customConfigFilePath: cliOptions.config,
  });

  const servingUrl = `http://${host}:${port}`;

  const server = http.createServer((req, res) => {
    // Automatically redirect requests to /baseUrl/
    if (!req.url?.startsWith(baseUrl)) {
      redirect(res, baseUrl);
      return;
    }

    // We do the redirect ourselves for a good reason
    // server-handler is annoying and won't include /baseUrl/ in redirects
    // See https://github.com/facebook/docusaurus/issues/10078#issuecomment-2084932934
    if (baseUrl !== '/') {
      // Not super robust, but should be good enough for our use case
      // See https://github.com/facebook/docusaurus/pull/10090
      const looksLikeAsset = !!req.url.match(/\.[a-z\d]{1,4}$/i);
      if (!looksLikeAsset) {
        const normalizedUrl = applyTrailingSlash(req.url, {
          trailingSlash,
          baseUrl,
        });
        if (req.url !== normalizedUrl) {
          redirect(res, normalizedUrl);
          return;
        }
      }
    }

    // Remove baseUrl before calling serveHandler, because /baseUrl/ should
    // serve /build/index.html, not /build/baseUrl/index.html (does not exist)
    // Note server-handler is really annoying here:
    // - no easy way to do rewrites such as "/baseUrl/:path" => "/:path"
    // - no easy way to "reapply" the baseUrl to the redirect "Location" header
    // See also https://github.com/facebook/docusaurus/pull/10090
    req.url = req.url.replace(baseUrl, '/');

    serveHandler(req, res, {
      cleanUrls: true,
      public: outDir,
      trailingSlash,
      directoryListing: false,
    });
  });

  const url = servingUrl + baseUrl;
  logger.success`Serving path=${buildDir} directory at: url=${url}`;
  await listenToServer({server, host, port});

  if (cliOptions.open && !process.env.CI) {
    await openBrowser(url);
  }
}
