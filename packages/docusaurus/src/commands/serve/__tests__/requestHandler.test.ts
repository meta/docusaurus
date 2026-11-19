/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  describeCaching,
  describeRequests,
  describeServing,
  revalidateRequest,
  serveRequest,
} from './testUtils';

// Appended to the baseUrl. The fixture build extends the static deployment of
// https://github.com/slorber/trailing-slash-guide
const RequestPaths = [
  '/',
  '/index',
  '/index.html',

  '/file',
  '/file/',
  '/file.html',

  '/folder',
  '/folder/',
  '/folder/index',
  '/folder/index.html',

  '/both',
  '/both/',
  '/both.html',
  '/both/index.html',

  // Folders with a dot, like a docs version or a package name
  '/docs/2.x',
  '/docs/2.x/',
  '/docs/2.x/index',
  '/docs/2.x/index.html',
  '/docs/2.x?query=1',
  '/docs/2%2Ex', // Encoded dot
  '/docs/lodash.debounce',
  '/docs/lodash.debounce/',
  // A file with a dot
  '/docs/1.x',
  '/docs/1.x/',
  '/docs/1.x.html',

  '/assets/css/styles.css',
  '/assets/css/styles.css?v=1',
  '/assets/',
  // Extensions of 1, 3, 4, 5 and 11 characters
  '/assets/files/main.c',
  '/assets/files/document.pdf',
  '/assets/images/photo.jpeg',
  '/assets/fonts/font.woff2',
  '/site.webmanifest',

  '/missing',
  '/missing/',
  '/missing.html',
  // A locale build, with its own 404 page
  '/fr/missing',
  '/fr/missing/',
  '/fr/folder/missing',
  // Client redirect files, for redirects from a .html path
  // plugin-client-redirects writes a folder, or a file with trailingSlash false
  '/redirect-folder.html',
  '/redirect-folder.html/',
  '/redirect-file.html',
  '/redirect-file.html/',

  '/file?query=1',
  '/file/?query=1',
  '/file.html?query=1',
  '/missing.html?query=1',
  '/folder?query=1',
  '/folder?v=1.0', // Looks like an extension

  '/with%20space',
  '/with%20space.html',
  '/файл',
  '/файл.html',
  '/café',

  '//file',
  '/%E0%A4%A', // Malformed percent-encoding
  '/%00', // Null byte
  // cspell:ignore Fdocusaurus
  '/..%2Fdocusaurus.config.js', // Path traversal
];

// Appended to the baseUrl. Browsers normalize these URLs before sending them,
// but hand-typed requests can send them as-is
// Not strictly needed for a local preview server, but useful if we ever expose
// the serve request handler as a Node API
const HandTypedRequestPaths = [
  '/file.html#hash',
  '/file.html?query=1#hash',
  '/file#hash.html',
  '/folder/index#hash',
  '/assets/css/styles.css#hash',
  '/./file.html',
  '/folder/../file.html',
  '/../file.html',
  '/%2E%2E/file.html',
  '/file%2Ehtml',
  // serve-handler decodes "%2F" before resolving "..": folder/file.html
  '/folder%2Fx/../file.html',
  // Open redirect attempts
  '/..//example.com/index',
  '/..//example.com/file',
];

describe('createServeRequestHandler', () => {
  describe('baseUrl /', () => {
    it('trailingSlash undefined', async () => {
      const result = await describeServing(
        {baseUrl: '/', trailingSlash: undefined},
        RequestPaths,
      );
      expect(result).toMatchInlineSnapshot(`
        "/                           200 index.html
        /index                      301 / → 200 index.html
        /index.html                 200 index.html
        /file                       200 file.html
        /file/                      200 file.html
        /file.html                  200 file.html
        /folder                     200 folder/index.html
        /folder/                    200 folder/index.html
        /folder/index               301 /folder → 200 folder/index.html
        /folder/index.html          200 folder/index.html
        /both                       200 both/index.html
        /both/                      200 both/index.html
        /both.html                  200 both.html
        /both/index.html            200 both/index.html
        /docs/2.x                   200 docs/2.x/index.html
        /docs/2.x/                  200 docs/2.x/index.html
        /docs/2.x/index             301 /docs/2.x → 200 docs/2.x/index.html
        /docs/2.x/index.html        200 docs/2.x/index.html
        /docs/2.x?query=1           200 docs/2.x/index.html
        /docs/2%2Ex                 200 docs/2.x/index.html
        /docs/lodash.debounce       200 docs/lodash.debounce/index.html
        /docs/lodash.debounce/      200 docs/lodash.debounce/index.html
        /docs/1.x                   200 docs/1.x.html
        /docs/1.x/                  200 docs/1.x.html
        /docs/1.x.html              200 docs/1.x.html
        /assets/css/styles.css      200 assets/css/styles.css
        /assets/css/styles.css?v=1  200 assets/css/styles.css
        /assets/                    404 404.html
        /assets/files/main.c        200 assets/files/main.c
        /assets/files/document.pdf  200 assets/files/document.pdf
        /assets/images/photo.jpeg   200 assets/images/photo.jpeg
        /assets/fonts/font.woff2    200 assets/fonts/font.woff2
        /site.webmanifest           200 site.webmanifest
        /missing                    404 404.html
        /missing/                   404 404.html
        /missing.html               301 /missing → 404 404.html
        /fr/missing                 404 fr/404.html
        /fr/missing/                404 fr/404.html
        /fr/folder/missing          404 fr/404.html
        /redirect-folder.html       200 redirect-folder.html/index.html
        /redirect-folder.html/      200 redirect-folder.html/index.html
        /redirect-file.html         200 redirect-file.html.html
        /redirect-file.html/        200 redirect-file.html.html
        /file?query=1               200 file.html
        /file/?query=1              200 file.html
        /file.html?query=1          200 file.html
        /missing.html?query=1       301 /missing?query=1 → 404 404.html
        /folder?query=1             200 folder/index.html
        /folder?v=1.0               200 folder/index.html
        /with%20space               200 with space.html
        /with%20space.html          200 with space.html
        /файл                       200 файл.html
        /файл.html                  200 файл.html
        /café                       200 café.html
        //file                      301 /file → 200 file.html
        /%E0%A4%A                   400 Bad Request
        /%00                        400 Bad Request
        /..%2Fdocusaurus.config.js  400 Bad Request"
      `);
    });

    it('trailingSlash true', async () => {
      const result = await describeServing(
        {baseUrl: '/', trailingSlash: true},
        RequestPaths,
      );
      expect(result).toMatchInlineSnapshot(`
        "/                           200 index.html
        /index                      301 / → 200 index.html
        /index.html                 200 index.html
        /file                       301 /file/ → 200 file.html
        /file/                      200 file.html
        /file.html                  200 file.html
        /folder                     301 /folder/ → 200 folder/index.html
        /folder/                    200 folder/index.html
        /folder/index               301 /folder → 301 /folder/ → 200 folder/index.html
        /folder/index.html          200 folder/index.html
        /both                       301 /both/ → 200 both/index.html
        /both/                      200 both/index.html
        /both.html                  200 both.html
        /both/index.html            200 both/index.html
        /docs/2.x                   301 /docs/2.x/ → 200 docs/2.x/index.html
        /docs/2.x/                  200 docs/2.x/index.html
        /docs/2.x/index             301 /docs/2.x → 301 /docs/2.x/ → 200 docs/2.x/index.html
        /docs/2.x/index.html        200 docs/2.x/index.html
        /docs/2.x?query=1           301 /docs/2.x/?query=1 → 200 docs/2.x/index.html
        /docs/2%2Ex                 301 /docs/2%2Ex/ → 200 docs/2.x/index.html
        /docs/lodash.debounce       301 /docs/lodash.debounce/ → 200 docs/lodash.debounce/index.html
        /docs/lodash.debounce/      200 docs/lodash.debounce/index.html
        /docs/1.x                   301 /docs/1.x/ → 200 docs/1.x.html
        /docs/1.x/                  200 docs/1.x.html
        /docs/1.x.html              200 docs/1.x.html
        /assets/css/styles.css      200 assets/css/styles.css
        /assets/css/styles.css?v=1  200 assets/css/styles.css
        /assets/                    404 404.html
        /assets/files/main.c        200 assets/files/main.c
        /assets/files/document.pdf  200 assets/files/document.pdf
        /assets/images/photo.jpeg   200 assets/images/photo.jpeg
        /assets/fonts/font.woff2    200 assets/fonts/font.woff2
        /site.webmanifest           200 site.webmanifest
        /missing                    301 /missing/ → 404 404.html
        /missing/                   404 404.html
        /missing.html               301 /missing → 301 /missing/ → 404 404.html
        /fr/missing                 301 /fr/missing/ → 404 fr/404.html
        /fr/missing/                404 fr/404.html
        /fr/folder/missing          301 /fr/folder/missing/ → 404 fr/404.html
        /redirect-folder.html       301 /redirect-folder.html/ → 200 redirect-folder.html/index.html
        /redirect-folder.html/      200 redirect-folder.html/index.html
        /redirect-file.html         301 /redirect-file.html/ → 200 redirect-file.html.html
        /redirect-file.html/        200 redirect-file.html.html
        /file?query=1               301 /file/?query=1 → 200 file.html
        /file/?query=1              200 file.html
        /file.html?query=1          200 file.html
        /missing.html?query=1       301 /missing?query=1 → 301 /missing/?query=1 → 404 404.html
        /folder?query=1             301 /folder/?query=1 → 200 folder/index.html
        /folder?v=1.0               301 /folder/?v=1.0 → 200 folder/index.html
        /with%20space               301 /with%20space/ → 200 with space.html
        /with%20space.html          200 with space.html
        /файл                       301 /%D1%84%D0%B0%D0%B9%D0%BB/ → 200 файл.html
        /файл.html                  200 файл.html
        /café                       301 /caf%C3%A9/ → 200 café.html
        //file                      301 /file → 301 /file/ → 200 file.html
        /%E0%A4%A                   301 /%E0%A4%A/ → 400 Bad Request
        /%00                        400 Bad Request
        /..%2Fdocusaurus.config.js  400 Bad Request"
      `);
    });

    it('trailingSlash false', async () => {
      const result = await describeServing(
        {baseUrl: '/', trailingSlash: false},
        RequestPaths,
      );
      expect(result).toMatchInlineSnapshot(`
        "/                           200 index.html
        /index                      301 / → 200 index.html
        /index.html                 200 index.html
        /file                       200 file.html
        /file/                      301 /file → 200 file.html
        /file.html                  200 file.html
        /folder                     200 folder/index.html
        /folder/                    301 /folder → 200 folder/index.html
        /folder/index               301 /folder → 200 folder/index.html
        /folder/index.html          200 folder/index.html
        /both                       200 both/index.html
        /both/                      301 /both → 200 both/index.html
        /both.html                  200 both.html
        /both/index.html            200 both/index.html
        /docs/2.x                   200 docs/2.x/index.html
        /docs/2.x/                  301 /docs/2.x → 200 docs/2.x/index.html
        /docs/2.x/index             301 /docs/2.x → 200 docs/2.x/index.html
        /docs/2.x/index.html        200 docs/2.x/index.html
        /docs/2.x?query=1           200 docs/2.x/index.html
        /docs/2%2Ex                 200 docs/2.x/index.html
        /docs/lodash.debounce       200 docs/lodash.debounce/index.html
        /docs/lodash.debounce/      301 /docs/lodash.debounce → 200 docs/lodash.debounce/index.html
        /docs/1.x                   200 docs/1.x.html
        /docs/1.x/                  301 /docs/1.x → 200 docs/1.x.html
        /docs/1.x.html              200 docs/1.x.html
        /assets/css/styles.css      200 assets/css/styles.css
        /assets/css/styles.css?v=1  200 assets/css/styles.css
        /assets/                    301 /assets → 404 404.html
        /assets/files/main.c        200 assets/files/main.c
        /assets/files/document.pdf  200 assets/files/document.pdf
        /assets/images/photo.jpeg   200 assets/images/photo.jpeg
        /assets/fonts/font.woff2    200 assets/fonts/font.woff2
        /site.webmanifest           200 site.webmanifest
        /missing                    404 404.html
        /missing/                   301 /missing → 404 404.html
        /missing.html               301 /missing → 404 404.html
        /fr/missing                 404 fr/404.html
        /fr/missing/                301 /fr/missing → 404 fr/404.html
        /fr/folder/missing          404 fr/404.html
        /redirect-folder.html       200 redirect-folder.html/index.html
        /redirect-folder.html/      301 /redirect-folder.html → 200 redirect-folder.html/index.html
        /redirect-file.html         200 redirect-file.html.html
        /redirect-file.html/        301 /redirect-file.html → 200 redirect-file.html.html
        /file?query=1               200 file.html
        /file/?query=1              301 /file?query=1 → 200 file.html
        /file.html?query=1          200 file.html
        /missing.html?query=1       301 /missing?query=1 → 404 404.html
        /folder?query=1             200 folder/index.html
        /folder?v=1.0               200 folder/index.html
        /with%20space               200 with space.html
        /with%20space.html          200 with space.html
        /файл                       200 файл.html
        /файл.html                  200 файл.html
        /café                       200 café.html
        //file                      301 /file → 200 file.html
        /%E0%A4%A                   400 Bad Request
        /%00                        400 Bad Request
        /..%2Fdocusaurus.config.js  400 Bad Request"
      `);
    });
  });

  describe('baseUrl /base/', () => {
    it('trailingSlash undefined', async () => {
      const result = await describeServing(
        {baseUrl: '/base/', trailingSlash: undefined},
        RequestPaths,
      );
      expect(result).toMatchInlineSnapshot(`
        "/base/                           200 index.html
        /base/index                      301 /base/ → 200 index.html
        /base/index.html                 200 index.html
        /base/file                       200 file.html
        /base/file/                      200 file.html
        /base/file.html                  200 file.html
        /base/folder                     200 folder/index.html
        /base/folder/                    200 folder/index.html
        /base/folder/index               301 /base/folder → 200 folder/index.html
        /base/folder/index.html          200 folder/index.html
        /base/both                       200 both/index.html
        /base/both/                      200 both/index.html
        /base/both.html                  200 both.html
        /base/both/index.html            200 both/index.html
        /base/docs/2.x                   200 docs/2.x/index.html
        /base/docs/2.x/                  200 docs/2.x/index.html
        /base/docs/2.x/index             301 /base/docs/2.x → 200 docs/2.x/index.html
        /base/docs/2.x/index.html        200 docs/2.x/index.html
        /base/docs/2.x?query=1           200 docs/2.x/index.html
        /base/docs/2%2Ex                 200 docs/2.x/index.html
        /base/docs/lodash.debounce       200 docs/lodash.debounce/index.html
        /base/docs/lodash.debounce/      200 docs/lodash.debounce/index.html
        /base/docs/1.x                   200 docs/1.x.html
        /base/docs/1.x/                  200 docs/1.x.html
        /base/docs/1.x.html              200 docs/1.x.html
        /base/assets/css/styles.css      200 assets/css/styles.css
        /base/assets/css/styles.css?v=1  200 assets/css/styles.css
        /base/assets/                    404 404.html
        /base/assets/files/main.c        200 assets/files/main.c
        /base/assets/files/document.pdf  200 assets/files/document.pdf
        /base/assets/images/photo.jpeg   200 assets/images/photo.jpeg
        /base/assets/fonts/font.woff2    200 assets/fonts/font.woff2
        /base/site.webmanifest           200 site.webmanifest
        /base/missing                    404 404.html
        /base/missing/                   404 404.html
        /base/missing.html               301 /base/missing → 404 404.html
        /base/fr/missing                 404 fr/404.html
        /base/fr/missing/                404 fr/404.html
        /base/fr/folder/missing          404 fr/404.html
        /base/redirect-folder.html       200 redirect-folder.html/index.html
        /base/redirect-folder.html/      200 redirect-folder.html/index.html
        /base/redirect-file.html         200 redirect-file.html.html
        /base/redirect-file.html/        200 redirect-file.html.html
        /base/file?query=1               200 file.html
        /base/file/?query=1              200 file.html
        /base/file.html?query=1          200 file.html
        /base/missing.html?query=1       301 /base/missing?query=1 → 404 404.html
        /base/folder?query=1             200 folder/index.html
        /base/folder?v=1.0               200 folder/index.html
        /base/with%20space               200 with space.html
        /base/with%20space.html          200 with space.html
        /base/файл                       200 файл.html
        /base/файл.html                  200 файл.html
        /base/café                       200 café.html
        /base//file                      301 /base/file → 200 file.html
        /base/%E0%A4%A                   400 Bad Request
        /base/%00                        400 Bad Request
        /base/..%2Fdocusaurus.config.js  400 Bad Request"
      `);
    });

    it('trailingSlash true', async () => {
      const result = await describeServing(
        {baseUrl: '/base/', trailingSlash: true},
        RequestPaths,
      );
      expect(result).toMatchInlineSnapshot(`
        "/base/                           200 index.html
        /base/index                      301 /base/ → 200 index.html
        /base/index.html                 200 index.html
        /base/file                       301 /base/file/ → 200 file.html
        /base/file/                      200 file.html
        /base/file.html                  200 file.html
        /base/folder                     301 /base/folder/ → 200 folder/index.html
        /base/folder/                    200 folder/index.html
        /base/folder/index               301 /base/folder → 301 /base/folder/ → 200 folder/index.html
        /base/folder/index.html          200 folder/index.html
        /base/both                       301 /base/both/ → 200 both/index.html
        /base/both/                      200 both/index.html
        /base/both.html                  200 both.html
        /base/both/index.html            200 both/index.html
        /base/docs/2.x                   301 /base/docs/2.x/ → 200 docs/2.x/index.html
        /base/docs/2.x/                  200 docs/2.x/index.html
        /base/docs/2.x/index             301 /base/docs/2.x → 301 /base/docs/2.x/ → 200 docs/2.x/index.html
        /base/docs/2.x/index.html        200 docs/2.x/index.html
        /base/docs/2.x?query=1           301 /base/docs/2.x/?query=1 → 200 docs/2.x/index.html
        /base/docs/2%2Ex                 301 /base/docs/2%2Ex/ → 200 docs/2.x/index.html
        /base/docs/lodash.debounce       301 /base/docs/lodash.debounce/ → 200 docs/lodash.debounce/index.html
        /base/docs/lodash.debounce/      200 docs/lodash.debounce/index.html
        /base/docs/1.x                   301 /base/docs/1.x/ → 200 docs/1.x.html
        /base/docs/1.x/                  200 docs/1.x.html
        /base/docs/1.x.html              200 docs/1.x.html
        /base/assets/css/styles.css      200 assets/css/styles.css
        /base/assets/css/styles.css?v=1  200 assets/css/styles.css
        /base/assets/                    404 404.html
        /base/assets/files/main.c        200 assets/files/main.c
        /base/assets/files/document.pdf  200 assets/files/document.pdf
        /base/assets/images/photo.jpeg   200 assets/images/photo.jpeg
        /base/assets/fonts/font.woff2    200 assets/fonts/font.woff2
        /base/site.webmanifest           200 site.webmanifest
        /base/missing                    301 /base/missing/ → 404 404.html
        /base/missing/                   404 404.html
        /base/missing.html               301 /base/missing → 301 /base/missing/ → 404 404.html
        /base/fr/missing                 301 /base/fr/missing/ → 404 fr/404.html
        /base/fr/missing/                404 fr/404.html
        /base/fr/folder/missing          301 /base/fr/folder/missing/ → 404 fr/404.html
        /base/redirect-folder.html       301 /base/redirect-folder.html/ → 200 redirect-folder.html/index.html
        /base/redirect-folder.html/      200 redirect-folder.html/index.html
        /base/redirect-file.html         301 /base/redirect-file.html/ → 200 redirect-file.html.html
        /base/redirect-file.html/        200 redirect-file.html.html
        /base/file?query=1               301 /base/file/?query=1 → 200 file.html
        /base/file/?query=1              200 file.html
        /base/file.html?query=1          200 file.html
        /base/missing.html?query=1       301 /base/missing?query=1 → 301 /base/missing/?query=1 → 404 404.html
        /base/folder?query=1             301 /base/folder/?query=1 → 200 folder/index.html
        /base/folder?v=1.0               301 /base/folder/?v=1.0 → 200 folder/index.html
        /base/with%20space               301 /base/with%20space/ → 200 with space.html
        /base/with%20space.html          200 with space.html
        /base/файл                       301 /base/%D1%84%D0%B0%D0%B9%D0%BB/ → 200 файл.html
        /base/файл.html                  200 файл.html
        /base/café                       301 /base/caf%C3%A9/ → 200 café.html
        /base//file                      301 /base/file → 301 /base/file/ → 200 file.html
        /base/%E0%A4%A                   301 /base/%E0%A4%A/ → 400 Bad Request
        /base/%00                        400 Bad Request
        /base/..%2Fdocusaurus.config.js  400 Bad Request"
      `);
    });

    it('trailingSlash false', async () => {
      const result = await describeServing(
        {baseUrl: '/base/', trailingSlash: false},
        RequestPaths,
      );
      expect(result).toMatchInlineSnapshot(`
        "/base/                           200 index.html
        /base/index                      301 /base/ → 200 index.html
        /base/index.html                 200 index.html
        /base/file                       200 file.html
        /base/file/                      301 /base/file → 200 file.html
        /base/file.html                  200 file.html
        /base/folder                     200 folder/index.html
        /base/folder/                    301 /base/folder → 200 folder/index.html
        /base/folder/index               301 /base/folder → 200 folder/index.html
        /base/folder/index.html          200 folder/index.html
        /base/both                       200 both/index.html
        /base/both/                      301 /base/both → 200 both/index.html
        /base/both.html                  200 both.html
        /base/both/index.html            200 both/index.html
        /base/docs/2.x                   200 docs/2.x/index.html
        /base/docs/2.x/                  301 /base/docs/2.x → 200 docs/2.x/index.html
        /base/docs/2.x/index             301 /base/docs/2.x → 200 docs/2.x/index.html
        /base/docs/2.x/index.html        200 docs/2.x/index.html
        /base/docs/2.x?query=1           200 docs/2.x/index.html
        /base/docs/2%2Ex                 200 docs/2.x/index.html
        /base/docs/lodash.debounce       200 docs/lodash.debounce/index.html
        /base/docs/lodash.debounce/      301 /base/docs/lodash.debounce → 200 docs/lodash.debounce/index.html
        /base/docs/1.x                   200 docs/1.x.html
        /base/docs/1.x/                  301 /base/docs/1.x → 200 docs/1.x.html
        /base/docs/1.x.html              200 docs/1.x.html
        /base/assets/css/styles.css      200 assets/css/styles.css
        /base/assets/css/styles.css?v=1  200 assets/css/styles.css
        /base/assets/                    301 /base/assets → 404 404.html
        /base/assets/files/main.c        200 assets/files/main.c
        /base/assets/files/document.pdf  200 assets/files/document.pdf
        /base/assets/images/photo.jpeg   200 assets/images/photo.jpeg
        /base/assets/fonts/font.woff2    200 assets/fonts/font.woff2
        /base/site.webmanifest           200 site.webmanifest
        /base/missing                    404 404.html
        /base/missing/                   301 /base/missing → 404 404.html
        /base/missing.html               301 /base/missing → 404 404.html
        /base/fr/missing                 404 fr/404.html
        /base/fr/missing/                301 /base/fr/missing → 404 fr/404.html
        /base/fr/folder/missing          404 fr/404.html
        /base/redirect-folder.html       200 redirect-folder.html/index.html
        /base/redirect-folder.html/      301 /base/redirect-folder.html → 200 redirect-folder.html/index.html
        /base/redirect-file.html         200 redirect-file.html.html
        /base/redirect-file.html/        301 /base/redirect-file.html → 200 redirect-file.html.html
        /base/file?query=1               200 file.html
        /base/file/?query=1              301 /base/file?query=1 → 200 file.html
        /base/file.html?query=1          200 file.html
        /base/missing.html?query=1       301 /base/missing?query=1 → 404 404.html
        /base/folder?query=1             200 folder/index.html
        /base/folder?v=1.0               200 folder/index.html
        /base/with%20space               200 with space.html
        /base/with%20space.html          200 with space.html
        /base/файл                       200 файл.html
        /base/файл.html                  200 файл.html
        /base/café                       200 café.html
        /base//file                      301 /base/file → 200 file.html
        /base/%E0%A4%A                   400 Bad Request
        /base/%00                        400 Bad Request
        /base/..%2Fdocusaurus.config.js  400 Bad Request"
      `);
    });

    it('redirects requests outside the baseUrl', async () => {
      const result = await describeRequests(
        {baseUrl: '/base/', trailingSlash: undefined},
        ['/', '/file', '/base', '/base?query=1', '/basement'],
      );
      expect(result).toMatchInlineSnapshot(`
        "/              302 /base/ → 200 index.html
        /file          302 /base/ → 200 index.html
        /base          302 /base/ → 200 index.html
        /base?query=1  302 /base/ → 200 index.html
        /basement      302 /base/ → 200 index.html"
      `);
    });

    describe('hand-typed URLs', () => {
      it('trailingSlash undefined', async () => {
        const result = await describeServing(
          {baseUrl: '/base/', trailingSlash: undefined},
          HandTypedRequestPaths,
          {asIs: true},
        );
        expect(result).toMatchInlineSnapshot(`
          "/base/file.html#hash              200 file.html
          /base/file.html?query=1#hash      200 file.html
          /base/file#hash.html              200 file.html
          /base/folder/index#hash           301 /base/folder → 200 folder/index.html
          /base/assets/css/styles.css#hash  200 assets/css/styles.css
          /base/./file.html                 200 file.html
          /base/folder/../file.html         200 file.html
          /base/../file.html                400 Bad Request
          /base/%2E%2E/file.html            400 Bad Request
          /base/file%2Ehtml                 200 file.html
          /base/folder%2Fx/../file.html     301 /base/file → 200 file.html
          /base/..//example.com/index       400 Bad Request
          /base/..//example.com/file        400 Bad Request"
        `);
      });

      it('trailingSlash true', async () => {
        const result = await describeServing(
          {baseUrl: '/base/', trailingSlash: true},
          HandTypedRequestPaths,
          {asIs: true},
        );
        expect(result).toMatchInlineSnapshot(`
          "/base/file.html#hash              200 file.html
          /base/file.html?query=1#hash      200 file.html
          /base/file#hash.html              301 /base/file/ → 200 file.html
          /base/folder/index#hash           301 /base/folder → 301 /base/folder/ → 200 folder/index.html
          /base/assets/css/styles.css#hash  200 assets/css/styles.css
          /base/./file.html                 200 file.html
          /base/folder/../file.html         200 file.html
          /base/../file.html                400 Bad Request
          /base/%2E%2E/file.html            400 Bad Request
          /base/file%2Ehtml                 200 file.html
          /base/folder%2Fx/../file.html     301 /base/file → 301 /base/file/ → 200 file.html
          /base/..//example.com/index       400 Bad Request
          /base/..//example.com/file        400 Bad Request"
        `);
      });

      it('trailingSlash false', async () => {
        const result = await describeServing(
          {baseUrl: '/base/', trailingSlash: false},
          HandTypedRequestPaths,
          {asIs: true},
        );
        expect(result).toMatchInlineSnapshot(`
          "/base/file.html#hash              200 file.html
          /base/file.html?query=1#hash      200 file.html
          /base/file#hash.html              200 file.html
          /base/folder/index#hash           301 /base/folder → 200 folder/index.html
          /base/assets/css/styles.css#hash  200 assets/css/styles.css
          /base/./file.html                 200 file.html
          /base/folder/../file.html         200 file.html
          /base/../file.html                400 Bad Request
          /base/%2E%2E/file.html            400 Bad Request
          /base/file%2Ehtml                 200 file.html
          /base/folder%2Fx/../file.html     301 /base/file → 200 file.html
          /base/..//example.com/index       400 Bad Request
          /base/..//example.com/file        400 Bad Request"
        `);
      });
    });
  });

  // These tests capture edge cases, also visible in the snapshots above
  describe('edge cases', () => {
    // See https://github.com/vercel/serve-handler/issues/205
    it('serves file names with Latin-1 characters', async () => {
      await expect(
        serveRequest({baseUrl: '/', trailingSlash: undefined}, '/café'),
      ).resolves.toBe('200 café.html');
    });

    // See https://github.com/meta/docusaurus/issues/10078#issuecomment-2084932934
    it('keeps the baseUrl in clean URL redirects', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: undefined},
          '/base/folder/index',
        ),
      ).resolves.toBe('301 /base/folder → 200 folder/index.html');
    });

    it('redirects clean URLs containing $ characters', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: undefined},
          '/base/a$&b.html',
        ),
      ).resolves.toBe('301 /base/a$&b → 404 404.html');
    });

    describe('stays on this host', () => {
      // Appended to the baseUrl
      const OpenRedirectPaths = [
        '/..//example.com/index',
        '/..//example.com/file.html',
        '//example.com/index',
        '//example.com/file',
        '//example.com/file.html',
      ];

      // Browsers read "\" as "/" in a Location header
      // Not in a snapshot, which would print "\" as "/"
      it('with a backslash', async () => {
        await expect(
          serveRequest(
            {baseUrl: '/', trailingSlash: undefined},
            '/\\example.com/file.html',
            {asIs: true},
          ),
        ).resolves.toBe(
          '301 /example.com/file.html → 301 /example.com/file → 404 404.html',
        );
      });

      // See https://github.com/meta/docusaurus/pull/12879#discussion_r4493075460
      describe('with a baseUrl', () => {
        it('trailingSlash undefined', async () => {
          const result = await describeServing(
            {baseUrl: '/base/', trailingSlash: undefined},
            OpenRedirectPaths,
            {asIs: true},
          );
          expect(result).toMatchInlineSnapshot(`
            "/base/..//example.com/index      400 Bad Request
            /base/..//example.com/file.html  400 Bad Request
            /base//example.com/index         301 /base/example.com/index → 301 /base/example.com → 404 404.html
            /base//example.com/file          301 /base/example.com/file → 404 404.html
            /base//example.com/file.html     301 /base/example.com/file.html → 301 /base/example.com/file → 404 404.html"
          `);
        });

        it('trailingSlash true', async () => {
          const result = await describeServing(
            {baseUrl: '/base/', trailingSlash: true},
            OpenRedirectPaths,
            {asIs: true},
          );
          expect(result).toMatchInlineSnapshot(`
            "/base/..//example.com/index      400 Bad Request
            /base/..//example.com/file.html  400 Bad Request
            /base//example.com/index         301 /base/example.com/index → 301 /base/example.com → 404 404.html
            /base//example.com/file          301 /base/example.com/file → 301 /base/example.com/file/ → 404 404.html
            /base//example.com/file.html     301 /base/example.com/file.html → 301 /base/example.com/file → 301 /base/example.com/file/ → 404 404.html"
          `);
        });

        it('trailingSlash false', async () => {
          const result = await describeServing(
            {baseUrl: '/base/', trailingSlash: false},
            OpenRedirectPaths,
            {asIs: true},
          );
          expect(result).toMatchInlineSnapshot(`
            "/base/..//example.com/index      400 Bad Request
            /base/..//example.com/file.html  400 Bad Request
            /base//example.com/index         301 /base/example.com/index → 301 /base/example.com → 404 404.html
            /base//example.com/file          301 /base/example.com/file → 404 404.html
            /base//example.com/file.html     301 /base/example.com/file.html → 301 /base/example.com/file → 404 404.html"
          `);
        });
      });

      describe('without a baseUrl', () => {
        it('trailingSlash undefined', async () => {
          const result = await describeServing(
            {baseUrl: '/', trailingSlash: undefined},
            OpenRedirectPaths,
            {asIs: true},
          );
          expect(result).toMatchInlineSnapshot(`
            "/..//example.com/index      400 Bad Request
            /..//example.com/file.html  400 Bad Request
            //example.com/index         301 /example.com/index → 301 /example.com → 404 404.html
            //example.com/file          301 /example.com/file → 404 404.html
            //example.com/file.html     301 /example.com/file.html → 301 /example.com/file → 404 404.html"
          `);
        });

        it('trailingSlash true', async () => {
          const result = await describeServing(
            {baseUrl: '/', trailingSlash: true},
            OpenRedirectPaths,
            {asIs: true},
          );
          expect(result).toMatchInlineSnapshot(`
            "/..//example.com/index      400 Bad Request
            /..//example.com/file.html  400 Bad Request
            //example.com/index         301 /example.com/index → 301 /example.com → 404 404.html
            //example.com/file          301 /example.com/file → 301 /example.com/file/ → 404 404.html
            //example.com/file.html     301 /example.com/file.html → 301 /example.com/file → 301 /example.com/file/ → 404 404.html"
          `);
        });

        it('trailingSlash false', async () => {
          const result = await describeServing(
            {baseUrl: '/', trailingSlash: false},
            OpenRedirectPaths,
            {asIs: true},
          );
          expect(result).toMatchInlineSnapshot(`
            "/..//example.com/index      400 Bad Request
            /..//example.com/file.html  400 Bad Request
            //example.com/index         301 /example.com/index → 301 /example.com → 404 404.html
            //example.com/file          301 /example.com/file → 404 404.html
            //example.com/file.html     301 /example.com/file.html → 301 /example.com/file → 404 404.html"
          `);
        });
      });
    });

    it('keeps the baseUrl when merging slashes', async () => {
      await expect(
        serveRequest({baseUrl: '/base/', trailingSlash: false}, '/base//file'),
      ).resolves.toBe('301 /base/file → 200 file.html');
    });

    // cspell:ignore Ffile Ehtml
    it('keeps the baseUrl with encoded slashes', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: false},
          '/base/%2F%2Ffile',
        ),
      ).resolves.toBe('200 file.html');
    });

    // serve-handler decodes the path before its clean URL redirect, which
    // would drop the baseUrl
    describe('answers 404 to encoded clean URL paths', () => {
      it('with an encoded .html extension', async () => {
        await expect(
          serveRequest(
            {baseUrl: '/base/', trailingSlash: undefined},
            '/base/missing%2Ehtml',
          ),
        ).resolves.toBe('404 404.html');
      });

      // cspell:ignore Findex
      it('with an encoded /index segment', async () => {
        await expect(
          serveRequest(
            {baseUrl: '/base/', trailingSlash: undefined},
            '/base/folder%2Findex',
          ),
        ).resolves.toBe('404 404.html');
      });
    });

    it('keeps the query string in redirects without a baseUrl', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/', trailingSlash: undefined},
          '/folder/index?query=1',
        ),
      ).resolves.toBe('301 /folder?query=1 → 200 folder/index.html');
    });

    // See https://github.com/vercel/serve-handler/pull/230
    it('serves the index.html of folders with a dot in their name', async () => {
      await expect(
        serveRequest({baseUrl: '/', trailingSlash: undefined}, '/docs/2.x/'),
      ).resolves.toBe('200 docs/2.x/index.html');
    });

    it('adds a trailing slash to pages with a dot in their name', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: true},
          '/base/docs/2.x',
        ),
      ).resolves.toBe('301 /base/docs/2.x/ → 200 docs/2.x/index.html');
    });

    // __fixtures__/outside.x.html is a page outside of the build output
    // cspell:ignore Foutside
    it('never looks for pages outside of the build output', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: true},
          '/base/..%2Foutside.x',
        ),
      ).resolves.toBe('400 Bad Request');
    });

    it('looks for no page with a malformed percent-encoding', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: true},
          '/base/%E0%A4%A.x',
        ),
      ).resolves.toBe('400 Bad Request');
    });

    it('adds a trailing slash to pages with a dot in their name, without a baseUrl', async () => {
      await expect(
        serveRequest({baseUrl: '/', trailingSlash: true}, '/docs/2.x'),
      ).resolves.toBe('301 /docs/2.x/ → 200 docs/2.x/index.html');
    });

    // Not in a snapshot: Windows ignores the trailing slash of file paths
    it('serves no asset with a trailing slash', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: true},
          '/base/assets/css/styles.css/',
        ),
      ).resolves.toBe(
        process.platform === 'win32'
          ? '200 assets/css/styles.css'
          : '404 404.html',
      );
    });

    // plugin-client-redirects writes it for redirects from /redirect-folder.html
    it('serves the client redirect folder of .html paths', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: undefined},
          '/base/redirect-folder.html',
        ),
      ).resolves.toBe('200 redirect-folder.html/index.html');
    });

    // plugin-client-redirects writes it for redirects from /redirect-file.html,
    // with trailingSlash false
    it('serves the client redirect file of .html paths', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: false},
          '/base/redirect-file.html',
        ),
      ).resolves.toBe('200 redirect-file.html.html');
    });

    // Like the malformed percent-encodings
    it('answers 400 to null bytes', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: undefined},
          '/base/%00',
        ),
      ).resolves.toBe('400 Bad Request');
    });

    it('keeps null bytes in the query string', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/base/', trailingSlash: undefined},
          '/base/file?query=%00',
        ),
      ).resolves.toBe('200 file.html');
    });

    // Like other ".." segments going above the root
    it('answers 400 to ".." segments that reach the name of the fake root', async () => {
      await expect(
        serveRequest(
          {baseUrl: '/', trailingSlash: undefined},
          '/../__docusaurus_root__/file.html',
          {asIs: true},
        ),
      ).resolves.toBe('400 Bad Request');
    });

    // Browsers send the baseUrl percent-encoded: "/caf%C3%A9/"
    describe('baseUrl with non-ASCII characters', () => {
      it('serves the baseUrl', async () => {
        await expect(
          serveRequest(
            {baseUrl: '/café/', trailingSlash: undefined},
            '/caf%C3%A9/',
          ),
        ).resolves.toBe('200 index.html');
      });

      it('serves the baseUrl with characters outside of Latin-1', async () => {
        await expect(
          serveRequest(
            {baseUrl: '/文档/', trailingSlash: undefined},
            '/%E6%96%87%E6%A1%A3/',
          ),
        ).resolves.toBe('200 index.html');
      });

      // Characters outside of Latin-1 are invalid in a Location header
      it('redirects to the percent-encoded baseUrl', async () => {
        await expect(
          serveRequest({baseUrl: '/文档/', trailingSlash: undefined}, '/'),
        ).resolves.toBe('302 /%E6%96%87%E6%A1%A3/ → 200 index.html');
      });

      it('keeps the baseUrl in redirects', async () => {
        await expect(
          serveRequest(
            {baseUrl: '/café/', trailingSlash: true},
            '/caf%C3%A9/file',
          ),
        ).resolves.toBe('301 /caf%C3%A9/file/ → 200 file.html');
      });

      it('serves a baseUrl percent-encoded in the config', async () => {
        await expect(
          serveRequest(
            {baseUrl: '/caf%C3%A9/', trailingSlash: undefined},
            '/caf%C3%A9/',
          ),
        ).resolves.toBe('200 index.html');
      });
    });
  });

  describe('caching', () => {
    it('without a baseUrl', async () => {
      const result = await describeCaching(
        {baseUrl: '/', trailingSlash: true},
        [
          '/',
          '/file/',
          '/file',
          '/file.html',
          '/site.webmanifest',
          '/assets/css/styles.css',
          '/assets/images/photo.jpeg',
          '/assets/',
          '/assets/missing.js',
          '/missing/',
          '/%E0%A4%A/',
        ],
      );
      expect(result).toMatchInlineSnapshot(`
        "/                          200 no-cache + ETag
        /file/                     200 no-cache + ETag
        /file                      301 no-cache
        /file.html                 200 no-cache + ETag
        /site.webmanifest          200 no-cache + ETag
        /assets/css/styles.css     200 public, max-age=31536000, immutable + ETag
        /assets/images/photo.jpeg  200 public, max-age=31536000, immutable + ETag
        /assets/                   404 no-cache
        /assets/missing.js         404 no-cache
        /missing/                  404 no-cache
        /%E0%A4%A/                 400 no-cache"
      `);
    });

    it('with a baseUrl', async () => {
      const result = await describeCaching(
        {baseUrl: '/base/', trailingSlash: true},
        [
          '/',
          '/base/',
          '/base/file/',
          '/base/file',
          '/base/file.html',
          '/base/assets/css/styles.css',
          '/base/assets/missing.js',
          '/base/missing/',
        ],
      );
      expect(result).toMatchInlineSnapshot(`
        "/                            302 no-cache
        /base/                       200 no-cache + ETag
        /base/file/                  200 no-cache + ETag
        /base/file                   301 no-cache
        /base/file.html              200 no-cache + ETag
        /base/assets/css/styles.css  200 public, max-age=31536000, immutable + ETag
        /base/assets/missing.js      404 no-cache
        /base/missing/               404 no-cache"
      `);
    });

    it('answers 304 to the revalidation of an unchanged page', async () => {
      await expect(
        revalidateRequest({baseUrl: '/', trailingSlash: undefined}, '/file'),
      ).resolves.toBe('304 no-cache');
    });

    // serve-handler doesn't apply `headers` to its 304 responses. Browsers
    // don't revalidate fresh immutable files, only files cached without it
    it('answers 304 no-cache to the revalidation of an unchanged asset', async () => {
      await expect(
        revalidateRequest(
          {baseUrl: '/base/', trailingSlash: undefined},
          '/base/assets/css/styles.css',
        ),
      ).resolves.toBe('304 no-cache');
    });
  });
});
