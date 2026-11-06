/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import path from 'node:path';
import {describeWatchModes} from './watchTestUtils';

describe('watch() dir paths', () => {
  describeWatchModes((createWatcher) => {
    describe('absolute paths', () => {
      // Core: localizationDir
      // Ecosystem: docusaurus-plugin-openapi (spec dir)...
      const files = [
        'i18n/fr/code.json',
        'i18n/fr/docs/intro.md',
        'i18n/fr/docs/other.md',
        'outside/de/code.json',
      ];
      const paths = ({siteDir}: {siteDir: string}) =>
        path.join(siteDir, 'i18n');

      it('watches dir recursively - add / change', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .change('i18n/fr/code.json', 'outside/de/code.json')
          .emits(['change i18n/fr/code.json']);
        // The temp file is in the watched dir: Linux and Windows may report it
        await w
          .atomicChange('i18n/fr/docs/intro.md')
          .emits(['change i18n/fr/docs/intro.md'], {
            optional: [
              'add i18n/fr/docs/intro.md.tmp',
              'change i18n/fr/docs/intro.md.tmp',
              'unlink i18n/fr/docs/intro.md.tmp',
            ],
          });
        await w
          .add('i18n/de/deep/code.json', 'i18n/x.md', 'x.md')
          .emits(['add i18n/de/deep/code.json', 'add i18n/x.md']);
      });

      it('watches dir recursively - remove', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .remove('i18n/fr/code.json', 'outside/de/code.json')
          .emits(['unlink i18n/fr/code.json']);
        await w
          .remove('i18n/fr/docs')
          .emits([
            'unlink i18n/fr/docs/intro.md',
            'unlink i18n/fr/docs/other.md',
          ]);
      });

      it('watches dir recursively - rename', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .rename('i18n/fr/code.json', 'i18n/fr/renamed.json')
          .emits(['unlink i18n/fr/code.json', 'add i18n/fr/renamed.json']);
        await w
          .rename('i18n/fr/docs', 'i18n/fr/docs2')
          .emits([
            'unlink i18n/fr/docs/intro.md',
            'unlink i18n/fr/docs/other.md',
            'add i18n/fr/docs2/intro.md',
            'add i18n/fr/docs2/other.md',
          ]);
        await w
          .rename('i18n/fr/docs2', 'outside/docs2')
          .emits([
            'unlink i18n/fr/docs2/intro.md',
            'unlink i18n/fr/docs2/other.md',
          ]);
        await w
          .rename('outside/de', 'i18n/de')
          .emits(['add i18n/de/code.json']);
      });

      it('watches dir - remove and re-create', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .remove('i18n')
          .emits([
            'unlink i18n/fr/code.json',
            'unlink i18n/fr/docs/intro.md',
            'unlink i18n/fr/docs/other.md',
          ]);
        // TODO Chokidar v3 limitation: once the watched dir is removed,
        //  re-creating it is only detected with FSEvents and on Windows
        await w.add('i18n/it/code.json').emits({
          fsevents: ['add i18n/it/code.json'],
          windows: ['add i18n/it/code.json'],
          'windows-polling': ['add i18n/it/code.json'],
          default: [],
        });
      });

      it('watches missing dir', async () => {
        // Core: localizationDir does not exist for most sites
        await using w = await createWatcher({paths});
        await w
          .add('i18n/fr/code.json', 'other/code.json')
          .emits(['add i18n/fr/code.json']);
      });
    });

    describe('relative paths', () => {
      const files = ['api/spec.yaml', 'api/v1/spec.yaml', 'other/spec.yaml'];
      const paths = 'api';

      it('watches dir recursively - add / change', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .change('api/spec.yaml', 'other/spec.yaml')
          .emits(['change api/spec.yaml']);
        await w.add('api/v2/spec.yaml').emits(['add api/v2/spec.yaml']);
      });

      it('watches dir recursively - remove / rename', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .rename('api/v1', 'api/v2')
          .emits(['unlink api/v1/spec.yaml', 'add api/v2/spec.yaml']);
        await w
          .remove('api/spec.yaml', 'other/spec.yaml')
          .emits(['unlink api/spec.yaml']);
      });

      it('watches dir outside siteDir', async () => {
        // Ecosystem: docusaurus-plugin-openapi spec dir,
        // @cbnventures/docusaurus-preset-nova and
        // @apify/docusaurus-plugin-typedoc-api watch their own package dirs
        await using w = await createWatcher({
          files: [
            '../theme/blocks/a.js',
            '../theme/blocks/sub/b.js',
            '../theme/lib/c.js',
          ],
          paths: '../theme/blocks',
        });
        await w
          .change('../theme/blocks/a.js', '../theme/lib/c.js')
          .emits(['change ../theme/blocks/a.js']);
        await w
          .add('../theme/blocks/sub/c.js', '../theme/other/d.js')
          .emits(['add ../theme/blocks/sub/c.js']);
        await w
          .rename('../theme/blocks/sub', '../theme/blocks/sub2')
          .emits([
            'unlink ../theme/blocks/sub/b.js',
            'unlink ../theme/blocks/sub/c.js',
            'add ../theme/blocks/sub2/b.js',
            'add ../theme/blocks/sub2/c.js',
          ]);
        await w
          .remove('../theme/blocks/a.js')
          .emits(['unlink ../theme/blocks/a.js']);
      });
    });
  });
});
