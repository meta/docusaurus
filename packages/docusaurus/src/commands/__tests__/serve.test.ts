/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';

let serverHandlerCallback: (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => void;

vi.mock('../../server/config', () => ({
  loadSiteConfig: vi.fn(async () => ({
    siteConfig: {
      baseUrl: '/docs/',
      trailingSlash: true,
    },
  })),
}));

vi.mock('../../server/getHostPort', () => ({
  getHostPort: vi.fn(async () => ({host: 'localhost', port: 3000})),
}));

vi.mock('../build/build', () => ({
  build: vi.fn(),
}));

vi.mock('../utils/listenToServer', () => ({
  listenToServer: vi.fn(),
}));

vi.mock('../utils/openBrowser/openBrowser', () => ({
  default: vi.fn(),
}));

const mockServeHandler = vi.fn();
vi.mock('serve-handler', () => ({
  default: (req: unknown, res: unknown, options: unknown) =>
    mockServeHandler(req, res, options),
}));

vi.spyOn(http, 'createServer').mockImplementation(((
  cb: (req: http.IncomingMessage, res: http.ServerResponse) => void,
) => {
  serverHandlerCallback = cb;
  return {
    listen: vi.fn(),
    close: vi.fn(),
  } as unknown as http.Server;
}) as unknown as typeof http.createServer);

import {isAssetUrl, serve} from '../serve';

describe('isAssetUrl', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docusaurus-serve-test-'));
    fs.mkdirSync(path.join(tempDir, 'assets', 'fonts'), {recursive: true});
    fs.mkdirSync(path.join(tempDir, 'docs', 'v1.0'), {recursive: true});
    fs.writeFileSync(
      path.join(tempDir, 'assets', 'fonts', 'custom.woff2'),
      'font',
    );
    fs.writeFileSync(path.join(tempDir, 'main.js'), 'console.log()');
    fs.writeFileSync(
      path.join(tempDir, 'docs', 'v1.0', 'index.html'),
      '<html></html>',
    );
  });

  afterAll(() => {
    fs.rmSync(tempDir, {recursive: true, force: true});
  });

  it('identifies asset files by extension without query/hash', () => {
    expect(isAssetUrl('/baseUrl/assets/fonts/Inter.woff2')).toBe(true);
    expect(isAssetUrl('/baseUrl/assets/css/styles.12345.css')).toBe(true);
    expect(isAssetUrl('/baseUrl/assets/js/main.js')).toBe(true);
    expect(isAssetUrl('/baseUrl/assets/js/main.js.map')).toBe(true);
    expect(isAssetUrl('/baseUrl/site.webmanifest')).toBe(true);
    expect(isAssetUrl('/baseUrl/img/logo.png')).toBe(true);
    expect(isAssetUrl('/baseUrl/img/banner.webp')).toBe(true);
    expect(isAssetUrl('/baseUrl/img/icon.svg')).toBe(true);
    expect(isAssetUrl('/baseUrl/archive.tar.gz')).toBe(true);
  });

  it('identifies asset files when URLs contain query parameters or hashes', () => {
    expect(isAssetUrl('/baseUrl/assets/fonts/Inter.woff2?v=3.5.0')).toBe(true);
    expect(
      isAssetUrl('/baseUrl/assets/css/styles.css?hash=abc123#some-id'),
    ).toBe(true);
    expect(isAssetUrl('/baseUrl/assets/js/runtime.js?version=1.0.0')).toBe(
      true,
    );
    expect(isAssetUrl('/baseUrl/img/logo.png?v=2')).toBe(true);
  });

  it('does not classify page routes or directories as assets', () => {
    expect(isAssetUrl('/baseUrl/')).toBe(false);
    expect(isAssetUrl('/baseUrl/docs/intro')).toBe(false);
    expect(isAssetUrl('/baseUrl/docs/intro/')).toBe(false);
    expect(isAssetUrl('/baseUrl/blog/2026/10/18/hello')).toBe(false);
    expect(isAssetUrl('/baseUrl/docs/v1.0')).toBe(false);
    expect(isAssetUrl('/baseUrl/docs/v1.0/')).toBe(false);
  });

  it('verifies against physical files and directories in outDir', () => {
    const options = {outDir: tempDir, baseUrl: '/baseUrl/'};

    // Physical file on disk
    expect(isAssetUrl('/baseUrl/assets/fonts/custom.woff2', options)).toBe(
      true,
    );
    expect(isAssetUrl('/baseUrl/assets/fonts/custom.woff2?v=1', options)).toBe(
      true,
    );
    expect(isAssetUrl('/baseUrl/main.js', options)).toBe(true);

    // Physical directory on disk (e.g. /docs/v1.0/)
    expect(isAssetUrl('/baseUrl/docs/v1.0', options)).toBe(false);
    expect(isAssetUrl('/baseUrl/docs/v1.0/', options)).toBe(false);

    // Missing file still respects extension check
    expect(isAssetUrl('/baseUrl/missing.woff2', options)).toBe(true);
    expect(isAssetUrl('/baseUrl/missing-route', options)).toBe(false);
  });
});

describe('serve HTTP request handling', () => {
  beforeAll(async () => {
    await serve('.', {build: false});
  });

  function createMockRes() {
    const headers: Record<string, string> = {};
    let statusCode = 200;
    return {
      writeHead: vi.fn((code: number, hdrs: Record<string, string>) => {
        statusCode = code;
        Object.assign(headers, hdrs);
      }),
      end: vi.fn(),
      getHeader: (name: string) => headers[name],
      getStatusCode: () => statusCode,
    } as unknown as http.ServerResponse & {
      getHeader: (name: string) => string | undefined;
      getStatusCode: () => number;
    };
  }

  it('redirects requests outside baseUrl to baseUrl', () => {
    const req = {url: '/wrong-path'} as http.IncomingMessage;
    const res = createMockRes();

    serverHandlerCallback(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, {Location: '/docs/'});
    expect(mockServeHandler).not.toHaveBeenCalled();
  });

  it('does not append trailing slash to static asset URLs', () => {
    mockServeHandler.mockClear();
    const req = {
      url: '/docs/assets/fonts/Inter.woff2?v=1',
    } as http.IncomingMessage;
    const res = createMockRes();

    serverHandlerCallback(req, res);

    expect(res.writeHead).not.toHaveBeenCalled();
    expect(mockServeHandler).toHaveBeenCalledTimes(1);
    expect(req.url).toBe('/assets/fonts/Inter.woff2?v=1');
  });

  it('redirects non-asset page routes to append trailing slash', () => {
    mockServeHandler.mockClear();
    const req = {url: '/docs/intro'} as http.IncomingMessage;
    const res = createMockRes();

    serverHandlerCallback(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, {Location: '/docs/intro/'});
    expect(mockServeHandler).not.toHaveBeenCalled();
  });
});
