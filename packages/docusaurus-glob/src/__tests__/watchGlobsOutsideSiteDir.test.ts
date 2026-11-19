/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import {describeWatchModes} from './watchTestUtils';

describe('watch() glob paths outside siteDir', () => {
  describeWatchModes((createWatcher) => {
    it('watches glob outside siteDir', async () => {
      // Core: docs plugin with path: '../docs' (monorepo setups)
      await using w = await createWatcher({
        files: ['../docs/a.md', '../docs/b.md', '../docs/sub/c.md'],
        paths: '../docs/**/*.{md,mdx}',
      });
      await w.change('../docs/a.md').emits(['change ../docs/a.md']);
      await w
        .add('../docs/sub/d.md', '../docs/d.js', 'e.md')
        .emits(['add ../docs/sub/d.md']);
      await w
        .rename('../docs/b.md', '../docs/b2.md')
        .emits(['unlink ../docs/b.md', 'add ../docs/b2.md']);
      await w.remove('../docs/a.md').emits(['unlink ../docs/a.md']);
    });

    it('watches glob outside siteDir - rename dir', async () => {
      await using w = await createWatcher({
        files: ['../docs/sub/a.md'],
        paths: '../docs/**/*.{md,mdx}',
      });
      // TODO Chokidar v3 limitation: dir renames are not reported by FSEvents
      //  Linux and Windows don't reliably report files of the old dir
      await w.rename('../docs/sub', '../docs/sub2').emits(
        {
          fsevents: [],
          polling: ['unlink ../docs/sub/a.md', 'add ../docs/sub2/a.md'],
          default: ['add ../docs/sub2/a.md'],
        },
        {optional: ['unlink ../docs/sub/a.md']},
      );
    });

    it('watches glob outside siteDir - many extensions', async () => {
      // Ecosystem: @vantagecompute/docusaurus-theme watches its theme dir
      await using w = await createWatcher({
        files: ['../theme/src/theme/Navbar/index.tsx'],
        paths: '../theme/src/theme/**/*.{js,jsx,ts,tsx,css}',
      });
      await w
        .change('../theme/src/theme/Navbar/index.tsx')
        .emits(['change ../theme/src/theme/Navbar/index.tsx']);
      await w
        .add(
          '../theme/src/theme/Navbar/styles.css',
          '../theme/src/theme/Footer/index.js',
          '../theme/src/theme/Footer/README.md',
          '../theme/src/other.js',
        )
        .emits([
          'add ../theme/src/theme/Navbar/styles.css',
          'add ../theme/src/theme/Footer/index.js',
        ]);
    });

    it('watches glob outside siteDir - missing base dir', async () => {
      await using w = await createWatcher({paths: '../docs/**/*.{md,mdx}'});
      // TODO Chokidar v3 limitation: when the glob base dir does not exist,
      //  creating files is only detected with FSEvents
      await w.add('../docs/a.md', '../docs/sub/b.md').emits({
        fsevents: ['add ../docs/a.md', 'add ../docs/sub/b.md'],
        default: [],
      });
    });
  });
});
