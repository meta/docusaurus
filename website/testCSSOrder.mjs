/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';

/*
This verifies CSS ordering on the Docusaurus site itself,

There are multiple ways to provide some CSS to Docusaurus
and Docusaurus should guarantee a consistent CSS ordering over time

See also
- https://github.com/facebook/docusaurus/issues/3678
- https://github.com/facebook/docusaurus/pull/5987

TODO we should probably add a real e2e test in core instead of using our own
website? Current solution looks good-enough for now

 */

// TODO temporary, the current order is bad and we should change/fix that
const EXPECTED_CSS_MARKERS = [
  // Note, Infima and site classes are optimized/deduplicated and put at the top
  // We don't agree yet on what should be the order for those classes
  // See https://github.com/facebook/docusaurus/pull/6222
  '--ifm-color-scheme:light',
  '.col[class*=col--]',
  '.padding-vert--xl',
  '.markdown>h2',
  '.button--outline.button--active',
  '.footer__link-item',
  '.navbar__title',
  '.pagination__item',
  '.pills__item',
  '.tabs__item',

  // Test markers
  '.test-marker-site-custom-css-unique-rule',
  '.test-marker-site-client-module',
  '.test-marker-theme-layout',
  '.test-marker-site-index-page',

  // Lazy-loaded lib
  // Looks like order changed during Webpack 5: https://github.com/facebook/docusaurus/pull/10455
  // Note a big deal though
  // '.DocSearch-Modal',
  // '.DocSearch-Hit-content-wrapper',
];

const cssDirName = fileURLToPath(new URL('build/assets/css', import.meta.url));

const cssFileNames = (await fs.readdir(cssDirName)).filter((file) =>
  file.endsWith('.css'),
);

if (cssFileNames.length !== 1) {
  throw new Error('unexpected: more than 1 css file');
}
const cssFile = path.join(cssDirName, cssFileNames[0]);

console.log('Inspecting CSS file for test CSS markers', cssFile);

const cssFileContent = await fs.readFile(cssFile, 'utf8');

const cssMarkersWithPositions = EXPECTED_CSS_MARKERS.map((marker) => {
  const position = cssFileContent.indexOf(marker);
  return {marker, position};
});

const missingCSSMarkers = cssMarkersWithPositions
  .filter((m) => m.position === -1)
  .map((m) => m.marker);

if (missingCSSMarkers.length > 0) {
  throw new Error(
    `Some expected CSS marker classes could not be found in file ${cssFile}: \n- ${missingCSSMarkers.join(
      '\n- ',
    )}`,
  );
}

// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_sortby-and-_orderby
const sortBy =
  (/** @type {string} */ key) =>
  (
    /** @type {Record<string, unknown>} */ a,
    /** @type {Record<string, unknown>} */ b,
  ) =>
    // eslint-disable-next-line no-nested-ternary
    a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0;

const sortedCSSMarkers = [...cssMarkersWithPositions]
  .sort(sortBy('position'))
  .map(({marker}) => marker);

if (JSON.stringify(sortedCSSMarkers) === JSON.stringify(EXPECTED_CSS_MARKERS)) {
  console.log(`Test CSS markers were found in the expected order:
- ${sortedCSSMarkers.join('\n- ')}`);
} else {
  throw new Error(`Test CSS markers were found in an incorrect order.

Expected order:
- ${EXPECTED_CSS_MARKERS.join('\n- ')};

Actual order:
- ${sortedCSSMarkers.join('\n- ')};

CSS file: ${cssFile}
  `);
}
