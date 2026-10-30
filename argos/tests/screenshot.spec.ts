/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as fs from 'node:fs';
import {test} from '@playwright/test';
import {argosScreenshot} from '@argos-ci/playwright';
import * as cheerio from 'cheerio';
import type {Page} from '@playwright/test';

const siteUrl = 'http://localhost:3000';
const sitemapPath = '../website/build/sitemap.xml';
const stylesheetPath = './tests/screenshot.css';

// Use ONLY_PATH="/docs/installation" to debug a specific page
const onlyPath: string | undefined = process.env.ONLY_PATH;

// eslint-disable-next-line no-restricted-properties
const sitemap = fs.readFileSync(sitemapPath).toString();
// eslint-disable-next-line no-restricted-properties
const stylesheet = fs.readFileSync(stylesheetPath).toString();

function extractSitemapUrls() {
  const $ = cheerio.load(sitemap, {xmlMode: true});
  const urls: string[] = [];
  $('loc').each(function handleLoc() {
    urls.push($(this).text());
  });
  return urls;
}

function isBlacklisted(pathname: string) {
  if (onlyPath && onlyPath !== pathname) {
    return true;
  }
  // Some paths explicitly blacklisted
  const BlacklistedPathnames: string[] = [
    // Flaky because of Canny widget
    '/feature-requests',
    // Flaky because of dynamic canary version fetched from npm
    '/community/canary',
    // Flaky because of screenshots being taken dynamically
    '/showcase',
    // Long blog post with many image carousels, often timeouts
    '/blog/2022/08/01/announcing-docusaurus-2.0',

    // DOGFOOD TESTS
    // React key errors:
    '/tests/docs/tests/toc-partials',
    // Console errors
    '/tests/pages/diagrams',
    '/tests/pages/markdown-tests-md',
    '/tests/pages/suspense-tests',
    // Flaky because of hydration error
    '/tests/blog/archive',
    '/tests/pages/code-block-tests',
    '/tests/pages/embeds',
    // Flaky because of hydration error with docusaurus serve + .html
    '/tests/blog/x/y/z.html',
    '/tests/docs/dummy.html',
    // Cause weird docusaurus serve errors:
    '/tests/docs/tests/ascii/%C3%A6%C3%B8%C3%A5',
    '/tests/docs/tests/ascii/folder/%C3%A6%C3%B8%C3%A5',
  ];

  return (
    // changelog docs
    pathname.startsWith('/changelog') ||
    // versioned docs
    pathname.match(/^\/docs\/((\d\.\d\.\d)|(next))\//) ||
    // verbose useless dogfooding pages
    pathname.startsWith('/tests/docs/toc/') ||
    pathname.startsWith('/tests/docs/tags/') ||
    pathname.startsWith('/tests/docs/tests/category-links') ||
    pathname.startsWith('/tests/docs/tests/visibility') ||
    pathname.startsWith('/tests/blog/page/') ||
    pathname.startsWith('/tests/blog/tags/') ||
    // manually excluded urls
    BlacklistedPathnames.includes(pathname)
  );
}

function getPathnames(): string[] {
  const urls = extractSitemapUrls();
  const pathnamesUnfiltered = urls.map((url) => new URL(url).pathname);
  const pathnames = pathnamesUnfiltered.filter(
    (pathname) => !isBlacklisted(pathname),
  );
  pathnames.sort();
  /*
  console.log('Pathnames:\n', JSON.stringify(pathnames, null, 2));
  console.log('Pathnames before filtering', pathnamesUnfiltered.length);
  console.log('Pathnames after filtering', pathnames.length);

   */
  return pathnames;
}

function pathnameToArgosName(pathname: string): string {
  function removeTrailingSlash(str: string): string {
    return str.endsWith('/') ? str.slice(0, -1) : str;
  }
  function removeLeadingSlash(str: string): string {
    return str.startsWith('/') ? str.slice(1) : str;
  }

  pathname = removeTrailingSlash(pathname);
  pathname = removeLeadingSlash(pathname);

  if (pathname === '') {
    return 'index';
  }

  return pathname;
}

// See https://github.com/facebook/docusaurus/pull/9256
// Docusaurus adds a <html data-has-hydrated="true">
function waitForDocusaurusHydration() {
  return document.documentElement.dataset.hasHydrated === 'true';
}

// Ensure that Docusaurus site pages do not emit unexpected errors/warnings
// See https://github.com/microsoft/playwright/issues/27277
// TODO this shouldn't be the responsibility of Argos tests to do this
//  but this is convenient to do this here for now
function throwOnConsole(page: Page) {
  const typesToCheck = ['error', 'warning'];

  const ignoreMessages = [
    // TODO this fetch error message is unexpected and should be fixed
    //  it's already happening in main branch
    'Failed to load resource: the server responded with a status of 404 (Not Found)',

    // TODO weird problem related to KaTeX fonts refusing to decode?
    //  on /docs/markdown-features/math-equations
    'Failed to decode downloaded font: http://localhost:3000/katex/fonts/',
    'OTS parsing error: Failed to convert WOFF 2.0 font to SFNT',

    // Mermaid warning, see https://github.com/mermaid-js/mermaid/issues/6031
    'Do not assign mappings to elements without corresponding data',
  ];

  page.on('console', (message) => {
    if (!typesToCheck.includes(message.type())) {
      return;
    }
    if (ignoreMessages.some((msg) => message.text().includes(msg))) {
      return;
    }
    throw new Error(`Docusaurus site page unexpectedly logged something to the browser console
Type=${message.type()}
Text=${message.text()}
Location=${message.location().url}`);
  });
}

function createPathnameTest(pathname: string) {
  test(`pathname ${pathname}`, async ({page}) => {
    throwOnConsole(page);
    const url = siteUrl + pathname;
    await page.goto(url);
    await page.waitForFunction(waitForDocusaurusHydration);
    await page.addStyleTag({content: stylesheet});
    // await expect(page).toHaveScreenshot({ fullPage: true, ...options });
    await argosScreenshot(page, pathnameToArgosName(pathname), {
      ariaSnapshot: true,
    });
  });
}

// Allow parallel execution within a single test file
// See https://playwright.dev/docs/test-parallel
test.describe.configure({mode: 'parallel'});

test.describe('Docusaurus site screenshots', () => {
  const pathnames = getPathnames();
  pathnames.forEach(createPathnameTest);
});
