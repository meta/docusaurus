/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import serveHandler from 'serve-handler';
import {fs, pathExists} from '@docusaurus/fs';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import {parseURLPath, serializeURLPath} from '@docusaurus/utils';
import type {URLPath} from '@docusaurus/utils';
import type http from 'node:http';
import type {DocusaurusConfig} from '@docusaurus/types';

type ServeRequestHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => Promise<void>;

export function createServeRequestHandler({
  outDir,
  baseUrl: configBaseUrl,
  trailingSlash,
}: {outDir: string} & Pick<
  DocusaurusConfig,
  'baseUrl' | 'trailingSlash'
>): ServeRequestHandler {
  // Browsers send the baseUrl percent-encoded, like "/caf%C3%A9/"
  // A baseUrl already percent-encoded in the config stays the same
  const baseUrl = parseURLPath(configBaseUrl).pathname;

  return async (req, res) => {
    // Browsers must revalidate every response, so that a rebuild or a config
    // change never leaves a stale page or redirect in their cache
    // Set here because serve-handler doesn't apply `headers` to its redirects
    // See https://github.com/meta/docusaurus/pull/12903
    res.setHeader('Cache-Control', 'no-cache');

    // Automatically redirect requests to /baseUrl/
    // Temporary: this redirect only exists in docusaurus serve, not on hosts
    if (!req.url?.startsWith(baseUrl)) {
      redirect(res, 302, baseUrl);
      return;
    }

    // serve-handler answers 500 to null bytes, its file system calls throw
    // Answer 400 instead, like serve-handler does to malformed encodings
    if (hasNullByte(req.url)) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    const redirectLocation = await getRedirectLocation(req.url, {
      outDir,
      baseUrl,
      trailingSlash,
    });
    if (redirectLocation !== undefined) {
      // Permanent, like the serve-handler redirects and most static hosts
      // See https://github.com/meta/docusaurus/pull/12907
      redirect(res, 301, redirectLocation);
      return;
    }

    // Remove baseUrl before calling serveHandler, because /baseUrl/ should
    // serve /build/index.html, not /build/baseUrl/index.html (does not exist)
    // Note server-handler is really annoying here:
    // - no easy way to do rewrites such as "/baseUrl/:path" => "/:path"
    // - no easy way to "reapply" the baseUrl to the redirect "Location" header
    // See also https://github.com/meta/docusaurus/pull/10090
    // Requests without url were redirected to the baseUrl
    req.url = req.url!.replace(baseUrl, '/');

    // serve-handler can't serve these pages: cleanUrls would redirect them
    req.url = (await getHtmlPathPageFileUrl(outDir, req.url)) ?? req.url;

    await serveHandler(
      req,
      res,
      {
        // cleanUrls serves /file with file.html, but also redirects /file.html
        // to /file, even when the file exists, and drops the baseUrl
        // We already did our clean URL redirects: only existing .html files and
        // paths with an encoded ".html" or "/index" get there
        // See https://github.com/meta/docusaurus/pull/12916
        cleanUrls: !hasCleanUrlSuffix(req.url),
        public: outDir,
        // We do the trailing slash redirects: serve-handler would decode
        // encoded slashes, merge them and drop the baseUrl
        trailingSlash: undefined,
        directoryListing: false,
        // serve-handler only answers 304 to an ETag revalidation, and the ETag
        // stays the same when a rebuild doesn't change the file content
        etag: true,
        headers: [
          // The default value has the file name, which crashes Node.js when it
          // has Latin-1 characters like "café.html"
          // See https://github.com/vercel/serve-handler/issues/205
          {
            source: '**',
            headers: [{key: 'Content-Disposition', value: 'inline'}],
          },
          // The bundler adds a content hash to the names of these files
          // Overrides the Cache-Control set above, only for existing files
          {
            source: 'assets/**',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
        ],
      },
      {
        // serve-handler only calls it for 404 errors
        sendError: (absolutePath) =>
          sendNotFoundPage(res, outDir, absolutePath!),
      },
    );
  };
}

async function getRedirectLocation(
  url: string,
  {
    outDir,
    baseUrl,
    trailingSlash,
  }: {outDir: string} & Pick<DocusaurusConfig, 'baseUrl' | 'trailingSlash'>,
): Promise<string | undefined> {
  // We do all the redirects ourselves for a good reason
  // serve-handler redirects drop the /baseUrl/ and the query string
  // See https://github.com/meta/docusaurus/issues/10078#issuecomment-2084932934
  const urlPath = parseRootURLPath(url);
  // ".." can resolve outside of the baseUrl
  // Like serve-handler, answer 400 to these paths
  if (!urlPath?.pathname.startsWith(baseUrl)) {
    return undefined;
  }
  const {pathname, search} = urlPath;

  // Merge repeated slashes, like the serve-handler redirects
  const mergedPathname = pathname.replace(/\/{2,}/g, '/');
  if (pathname !== mergedPathname) {
    return serializeURLPath({pathname: mergedPathname, search});
  }

  // Static hosts serve the existing .html files, without clean URL redirects
  const outDirUrl = url.slice(baseUrl.length - 1);
  if (await isHtmlFileRequest(outDir, outDirUrl)) {
    return undefined;
  }

  const isHtmlPathPage =
    (await getHtmlPathPageFileUrl(outDir, outDirUrl)) !== undefined;
  const cleanPathname = getCleanPathname(pathname, baseUrl);
  if (!isHtmlPathPage && pathname !== cleanPathname) {
    return serializeURLPath({pathname: cleanPathname, search});
  }

  // Not super robust, but should be good enough for our use case
  // See https://github.com/meta/docusaurus/pull/10090
  const looksLikeAsset = !!pathname.match(/\.[a-z\d]+$/i);
  const isAsset =
    looksLikeAsset &&
    !(await isPage(outDir, pathname.slice(baseUrl.length - 1)));
  if (!isAsset) {
    const normalizedPathname = applyTrailingSlash(pathname, {
      trailingSlash,
      baseUrl,
    });
    if (pathname !== normalizedPathname) {
      return serializeURLPath({pathname: normalizedPathname, search});
    }
  }

  return undefined;
}

// Like parseURLPath(), but undefined when ".." segments go above the root
// It also keeps "//host/path" as a path instead of parsing another host
function parseRootURLPath(url: string): URLPath | undefined {
  // ".." segments going above the root can reach the name of a fake root,
  // like "/../__docusaurus_root__/file", but not the names of 2 fake roots
  const urlPath = parseFakeRootURLPath(url, '/__docusaurus_root__');
  const otherUrlPath = parseFakeRootURLPath(url, '/__docusaurus_other_root__');
  if (urlPath === undefined || otherUrlPath === undefined) {
    return undefined;
  }
  return urlPath;
}

function parseFakeRootURLPath(
  url: string,
  fakeRoot: string,
): URLPath | undefined {
  const {pathname, search} = parseURLPath(`.${url}`, `${fakeRoot}/`);
  if (!pathname.startsWith(`${fakeRoot}/`)) {
    return undefined;
  }
  return {pathname: pathname.slice(fakeRoot.length), search};
}

// Like serve-handler, only the pathname is decoded, not the query string
function hasNullByte(url: string): boolean {
  const pathname = url.split(/[?#]/)[0]!;
  return pathname.includes('%00');
}

// The page of a .html path that isn't a file, like the client redirect files
// "old-page.html/index.html", or "old-page.html.html" with trailingSlash false
// See https://github.com/meta/docusaurus/pull/12920
async function getHtmlPathPageFileUrl(
  outDir: string,
  url: string,
): Promise<string | undefined> {
  const pathname = url.split(/[?#]/)[0]!;
  if (!pathname.endsWith('.html')) {
    return undefined;
  }
  const queryAndHash = url.slice(pathname.length);
  const pageFileUrls = [`${pathname}/index.html`, `${pathname}.html`];
  for (const pageFileUrl of pageFileUrls) {
    if (await isHtmlFileRequest(outDir, pageFileUrl)) {
      return pageFileUrl + queryAndHash;
    }
  }
  return undefined;
}

// The decoded paths that serve-handler's cleanUrls redirects
function hasCleanUrlSuffix(url: string): boolean {
  const pathname = url.split(/[?#]/)[0]!;
  try {
    return /(?:\.html|\/index)$/.test(decodeURIComponent(pathname));
  } catch {
    return false; // Malformed percent-encoding, serve-handler answers 400
  }
}

// Pages with a dot in their name look like assets, like "docs/2.x"
async function isPage(outDir: string, urlPath: string): Promise<boolean> {
  const filePath = getFilePath(outDir, urlPath);
  if (filePath === undefined) {
    return false;
  }
  return (
    (await pathExists(path.join(filePath, 'index.html'))) ||
    pathExists(`${filePath}.html`)
  );
}

// The url without the baseUrl, like serve-handler receives it
async function isHtmlFileRequest(
  outDir: string,
  url: string,
): Promise<boolean> {
  // Like serve-handler, decode the path before resolving its ".." segments:
  // parseURLPath() resolves "/folder%2Fx/../file.html" to "/file.html"
  const pathname = url.split(/[?#]/)[0]!;
  const filePath = getFilePath(outDir, pathname);
  if (!filePath?.endsWith('.html')) {
    return false;
  }
  // Not a folder, like the client redirect file "old-page.html/index.html"
  const stats = await fs.stat(filePath).catch(() => undefined);
  return stats?.isFile() ?? false;
}

function getFilePath(outDir: string, urlPath: string): string | undefined {
  let filePath: string;
  try {
    filePath = path.join(outDir, decodeURIComponent(urlPath));
  } catch {
    return undefined; // Malformed percent-encoding
  }
  // Encoded slashes can decode to ".." segments: never look outside outDir
  if (path.relative(outDir, filePath).startsWith('..')) {
    return undefined;
  }
  return filePath;
}

// The serve-handler cleanUrls redirect, keeping the baseUrl
function getCleanPathname(pathname: string, baseUrl: string): string {
  const cleanPathname = pathname.replace(/(?:\.html|\/index)$/, '');
  // Like serve-handler, /index redirects to /
  return cleanPathname === baseUrl.slice(0, -1) ? baseUrl : cleanPathname;
}

// Serves the nearest 404.html, like Cloudflare Pages: "/fr/missing" gets the
// 404 page of the "fr" locale build, "fr/404.html"
// See https://developers.cloudflare.com/pages/configuration/serving-pages/#not-found-behavior
async function sendNotFoundPage(
  res: http.ServerResponse,
  outDir: string,
  absolutePath: string,
) {
  const page = await readNearestNotFoundPage(outDir, absolutePath);
  if (page === undefined) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(page);
}

async function readNearestNotFoundPage(
  outDir: string,
  absolutePath: string,
): Promise<Buffer | undefined> {
  const folders = path
    .relative(outDir, absolutePath)
    .split(path.sep)
    .slice(0, -1);
  for (let depth = folders.length; depth >= 0; depth -= 1) {
    const pagePath = path.join(outDir, ...folders.slice(0, depth), '404.html');
    const page = await fs.readFile(pagePath).catch(() => undefined);
    if (page !== undefined) {
      return page;
    }
  }
  return undefined;
}

function redirect(
  res: http.ServerResponse,
  statusCode: 301 | 302,
  location: string,
) {
  res.writeHead(statusCode, {
    Location: location,
  });
  res.end();
}
