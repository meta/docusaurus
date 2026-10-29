/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Text snapshots are built with "docusaurus build --dev", using React dev SSR.
// For client-rendered Suspense boundaries (e.g. <BrowserOnly>), React dev
// emits debug attributes that production never emits, including a full
// component stack with line numbers, creating noisy text snapshot diffs.
// Digest "" means an intentional browser() bailout, not an SSR error.
// Blog feeds embed the blog post HTML, so they contain these attributes too.

import fs from 'node:fs/promises';
import path from 'node:path';
import {format} from 'oxfmt';
import xmlFormat from 'xml-formatter';

const buildDir = path.resolve(import.meta.dirname, '../website/build');

const BrowserBailoutTemplateRegex =
  /<template data-dgst=""(?: data-(?:msg|stck|cstck)="[^"]*")+><\/template>/g;

let count = 0;
function normalizeBrowserBailouts(html) {
  return html.replace(BrowserBailoutTemplateRegex, () => {
    count += 1;
    return '<template data-dgst=""></template>';
  });
}

// Code blocks render each code line as a "token-line" element, without
// newlines in between. Formatters can't add any inside <pre>, so each code
// block ends up on a single huge line: we put each code line on its own line
const CodeBlockLineBoundaryRegex = /<\/div>(?=<div class="token-line)/g;

function normalizeHtml(html) {
  return normalizeBrowserBailouts(html).replace(
    CodeBlockLineBoundaryRegex,
    '</div>\n',
  );
}

// Blog feeds embed the blog post HTML unformatted: we format it like pages
async function formatFeedHtml(html, file) {
  const {code, errors} = await format('feed.html', normalizeHtml(html), {
    printWidth: 80,
  });
  if (errors.length > 0) {
    throw new Error(`Can't format blog post HTML of feed ${file}`, {
      cause: errors,
    });
  }
  return code.trimEnd();
}

for await (const file of fs.glob('**/*.html', {cwd: buildDir})) {
  const filePath = path.join(buildDir, file);
  const html = await fs.readFile(filePath, 'utf8');
  const normalized = normalizeHtml(html);
  if (normalized !== html) {
    await fs.writeFile(filePath, normalized);
  }
}

// RSS and Atom feeds embed the blog post HTML as-is, in CDATA sections
const XmlFeedContentRegex =
  /(?<=<content type="html">|<content:encoded>)<!\[CDATA\[(?<html>[\s\S]*?)\]\]>/g;

for await (const file of fs.glob(['**/rss.xml', '**/atom.xml'], {
  cwd: buildDir,
})) {
  const filePath = path.join(buildDir, file);
  const xml = await fs.readFile(filePath, 'utf8');
  const contents = await Promise.all(
    Array.from(xml.matchAll(XmlFeedContentRegex), (match) =>
      formatFeedHtml(match.groups.html, file),
    ),
  );
  await fs.writeFile(
    filePath,
    xml.replace(
      XmlFeedContentRegex,
      () => `<![CDATA[\n${contents.shift()}\n]]>`,
    ),
  );
}

// JSON feeds escape newlines, putting each blog post HTML on a single huge
// line: we split it into an array of lines so that Argos diffs are reviewable
for await (const file of fs.glob('**/feed.json', {cwd: buildDir})) {
  const filePath = path.join(buildDir, file);
  const feed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  await Promise.all(
    feed.items.map(async (item) => {
      if (typeof item.content_html === 'string') {
        const html = await formatFeedHtml(item.content_html, file);
        // eslint-disable-next-line camelcase
        item.content_html = html.split('\n');
      }
    }),
  );
  await fs.writeFile(filePath, JSON.stringify(feed, null, 2));
}

console.log(`Normalized ${count} browser-only Suspense boundaries`);

// The sitemap plugin emits sitemap.xml on a single line: format it in place
// so that Argos diffs are reviewable
const sitemapPath = path.join(buildDir, 'sitemap.xml');
const sitemap = await fs.readFile(sitemapPath, 'utf8');
await fs.writeFile(sitemapPath, xmlFormat(sitemap, {collapseContent: true}));
