/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import path from 'node:path';
import {describeWatchModes, posixPath} from './watchTestUtils';

describe('watch() multiple paths', () => {
  describeWatchModes((createWatcher) => {
    it('watches overlapping paths', async () => {
      await using w = await createWatcher({
        files: ['docs/a.md', 'docs/tags.yml'],
        paths: ['docs/**/*.{md,mdx}', 'docs/**/*.md', 'docs/tags.yml', 'docs'],
      });
      await w
        .change('docs/a.md', 'docs/tags.yml')
        .emits(['change docs/a.md', 'change docs/tags.yml']);
      await w.add('docs/b.js').emits(['add docs/b.js']);
      await w.remove('docs/a.md').emits(['unlink docs/a.md']);
    });

    it('watches site paths - re-create file', async () => {
      // Core: site watcher [siteConfigPath, localizationDir]
      await using w = await createWatcher({
        files: ['docusaurus.config.js', 'i18n/fr/code.json'],
        paths: ({siteDir}) => [
          path.join(siteDir, 'docusaurus.config.js'),
          path.join(siteDir, 'i18n'),
        ],
      });
      await w
        .remove('docusaurus.config.js')
        .emits(['unlink docusaurus.config.js']);
      // TODO Chokidar v3 bug: when watching multiple paths, re-creating a
      //  removed file path is only detected with FSEvents
      //  Windows sometimes reports it as "change"
      const windowsEvents = ['change docusaurus.config.js'];
      await w.add('docusaurus.config.js').emits(
        {fsevents: ['add docusaurus.config.js'], default: []},
        {
          optional: {
            windows: windowsEvents,
            'windows-polling': windowsEvents,
          },
        },
      );
    });

    it('watches file and glob paths - re-create file', async () => {
      // Core: docs plugin [sidebarPath, 'docs/**/*.{md,mdx}', ...]
      await using w = await createWatcher({
        files: ['sidebars.js', 'docs/a.md'],
        paths: ['sidebars.js', 'docs/**/*.{md,mdx}'],
      });
      await w
        .rename('sidebars.js', 'sidebars.js.bak')
        .emits(['unlink sidebars.js']);
      // TODO Chokidar v3 bug: when watching multiple paths, re-creating a
      //  removed file path is only detected with FSEvents
      await w
        .rename('sidebars.js.bak', 'sidebars.js')
        .emits({fsevents: ['add sidebars.js'], default: []});
      // Files matched by globs are not affected
      await w.remove('docs/a.md').emits(['unlink docs/a.md']);
      await w.add('docs/a.md').emits(['add docs/a.md']);
    });

    it('watches docs plugin paths', async () => {
      // Core: docs plugin getPathsToWatch() with i18n and versions
      const i18nDir = 'i18n/fr/docusaurus-plugin-content-docs';
      await using w = await createWatcher({
        files: [
          'sidebars.js',
          'docs/intro.md',
          'docs/tags.yml',
          'docs/category/_category_.json',
          `${i18nDir}/current/intro.md`,
          'versioned_sidebars/version-1.0.0-sidebars.json',
          'versioned_docs/version-1.0.0/intro.md',
        ],
        paths: [
          'sidebars.js',
          `${i18nDir}/current/**/*.{md,mdx}`,
          'docs/**/*.{md,mdx}',
          `${i18nDir}/current/tags.yml`,
          'docs/tags.yml',
          'docs/**/_category_.{json,yml,yaml}',
          'versioned_sidebars/version-1.0.0-sidebars.json',
          `${i18nDir}/version-1.0.0/**/*.{md,mdx}`,
          'versioned_docs/version-1.0.0/**/*.{md,mdx}',
          `${i18nDir}/version-1.0.0/tags.yml`,
          'versioned_docs/version-1.0.0/tags.yml',
          'versioned_docs/version-1.0.0/**/_category_.{json,yml,yaml}',
        ],
      });
      await w
        .change(
          'sidebars.js',
          'docs/intro.md',
          'docs/tags.yml',
          'docs/category/_category_.json',
          `${i18nDir}/current/intro.md`,
          'versioned_sidebars/version-1.0.0-sidebars.json',
          'versioned_docs/version-1.0.0/intro.md',
        )
        .emits([
          'change sidebars.js',
          'change docs/intro.md',
          'change docs/tags.yml',
          'change docs/category/_category_.json',
          `change ${i18nDir}/current/intro.md`,
          'change versioned_sidebars/version-1.0.0-sidebars.json',
          'change versioned_docs/version-1.0.0/intro.md',
        ]);
      await w
        .add(
          `${i18nDir}/current/tags.yml`,
          'versioned_docs/version-1.0.0/tags.yml',
          'versioned_docs/version-1.0.0/_category_.yml',
          'docs/intro.js',
          'versioned_docs/version-1.0.0/intro.js',
        )
        .emits([
          `add ${i18nDir}/current/tags.yml`,
          'add versioned_docs/version-1.0.0/tags.yml',
          'add versioned_docs/version-1.0.0/_category_.yml',
        ]);
      await w
        .remove('docs/intro.md', `${i18nDir}/current/intro.md`)
        .emits(['unlink docs/intro.md', `unlink ${i18nDir}/current/intro.md`]);
    });

    describe('negated globs', () => {
      it('ignores negated relative globs', async () => {
        await using w = await createWatcher({
          files: ['docs/a.md', 'docs/_b.md', 'docs/_dir/c.md'],
          paths: ['docs/**/*.md', '!docs/**/_*.md'],
        });
        await w
          .change('docs/a.md', 'docs/_b.md', 'docs/_dir/c.md')
          .emits(['change docs/a.md', 'change docs/_dir/c.md']);
        await w.add('docs/d.md', 'docs/_e.md').emits(['add docs/d.md']);
      });

      it('ignores negated absolute globs without cwd', async () => {
        await using w = await createWatcher({
          files: ['arch/a.dsl', 'arch/include.b.dsl'],
          paths: ({siteDir}) => [
            `${posixPath(siteDir)}/arch/**/*.dsl`,
            `!${posixPath(siteDir)}/**/include.*.dsl`,
          ],
          options: () => ({cwd: undefined}),
        });
        const abs = (file: string) => posixPath(path.join(w.siteDir, file));
        // TODO Chokidar v3 inconsistency: on Windows, the negated glob does not
        //  reliably ignore the file
        const windowsEvents = [`change ${abs('arch/include.b.dsl')}`];
        await w
          .change('arch/a.dsl', 'arch/include.b.dsl')
          .emits([`change ${abs('arch/a.dsl')}`], {
            optional: {
              windows: windowsEvents,
              'windows-polling': windowsEvents,
            },
          });
      });

      it('does not ignore negated absolute globs with cwd', async () => {
        // Ecosystem: docusaurus-plugin-structurizr
        // Note: core does not make negated absolute paths relative to siteDir
        // TODO Chokidar v3 bug: with the "cwd" option, negated absolute globs
        //  are resolved against cwd ("!<cwd>/<abs>") and have no effect
        await using w = await createWatcher({
          files: ['arch/a.dsl', 'arch/include.b.dsl'],
          paths: ({siteDir}) => [
            'arch/**/*.dsl',
            `!${posixPath(siteDir)}/**/include.*.dsl`,
          ],
        });
        await w
          .change('arch/a.dsl', 'arch/include.b.dsl')
          .emits(['change arch/a.dsl', 'change arch/include.b.dsl']);
        await w
          .add('arch/sub/c.dsl', 'arch/sub/include.d.dsl')
          .emits(['add arch/sub/c.dsl', 'add arch/sub/include.d.dsl']);
      });
    });
  });
});
