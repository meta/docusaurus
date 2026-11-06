/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import {describeWatchModes, posixPath} from './watchTestUtils';

describe('watch() glob paths', () => {
  describeWatchModes((createWatcher) => {
    describe('docs/**/*.{md,mdx}', () => {
      // Core: docs/blog/pages plugins "include" option
      const files = [
        'docs/a.md',
        'docs/b.mdx',
        'docs/c.txt',
        'docs/sub/d.md',
        'docs/sub/e.js',
        'other/sub/f.md',
      ];
      const paths = 'docs/**/*.{md,mdx}';

      it('watches files - add', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .add(
            'docs/new.md',
            'docs/new.mdx',
            'docs/new-dir/deep/new.mdx',
            // The "exclude" option is not applied to watched paths
            'docs/_partial.md',
            'docs/_dir/partial.md',
            'docs/.dotfile.md',
            'docs/.hidden/file.md',
            // Not matched
            'docs/new.txt',
            'docs/new.md.bak',
            'docs/new-dir2/file.js',
            'other/new.md',
            'docs.md',
          )
          .emits([
            'add docs/new.md',
            'add docs/new.mdx',
            'add docs/new-dir/deep/new.mdx',
            'add docs/_partial.md',
            'add docs/_dir/partial.md',
            'add docs/.dotfile.md',
            'add docs/.hidden/file.md',
          ]);
      });

      it('watches files - change', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .change(
            'docs/a.md',
            'docs/b.mdx',
            'docs/c.txt',
            'docs/sub/d.md',
            'docs/sub/e.js',
            'other/sub/f.md',
          )
          .emits([
            'change docs/a.md',
            'change docs/b.mdx',
            'change docs/sub/d.md',
          ]);
        await w.atomicChange('docs/sub/d.md').emits(['change docs/sub/d.md']);
      });

      it('watches files - remove', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .remove('docs/a.md', 'docs/c.txt', 'other/sub/f.md')
          .emits(['unlink docs/a.md']);
        await w.remove('docs/sub').emits(['unlink docs/sub/d.md']);
      });

      it('watches files - rename', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .rename('docs/a.md', 'docs/sub/a2.md')
          .emits(['unlink docs/a.md', 'add docs/sub/a2.md']);
        await w.rename('docs/b.mdx', 'docs/b.txt').emits(['unlink docs/b.mdx']);
        await w.rename('docs/c.txt', 'docs/c.md').emits(['add docs/c.md']);
        await w.rename('other/sub/f.md', 'docs/f.md').emits(['add docs/f.md']);
      });

      it('watches dirs - rename', async () => {
        await using w = await createWatcher({files, paths});
        // TODO Chokidar v3 limitation: dir renames are not reported by FSEvents
        //  Linux and Windows don't reliably report files of the old dir
        await w.rename('docs/sub', 'docs/sub2').emits(
          {
            fsevents: [],
            polling: ['unlink docs/sub/d.md', 'add docs/sub2/d.md'],
            default: ['add docs/sub2/d.md'],
          },
          {optional: ['unlink docs/sub/d.md']},
        );
        await w
          .rename('other/sub', 'docs/moved-in')
          .emits({fsevents: [], default: ['add docs/moved-in/f.md']});
      });

      it('watches dirs - remove and re-create base dir', async () => {
        await using w = await createWatcher({files, paths});
        const unlinkEvents = [
          'unlink docs/a.md',
          'unlink docs/b.mdx',
          'unlink docs/sub/d.md',
        ];
        // TODO Chokidar v3 limitation: FSEvents may not report it
        await w
          .remove('docs')
          .emits(
            {fsevents: [], default: unlinkEvents},
            {optional: unlinkEvents},
          );
        // TODO Chokidar v3 limitation: once the glob base dir is removed,
        //  re-creating files is not detected on Linux
        //  FSEvents may report re-created files as "change"
        await w.add('docs/a.md', 'docs/new/b.md').emits(
          {
            fsevents: ['add docs/new/b.md'],
            linux: [],
            default: ['add docs/a.md', 'add docs/new/b.md'],
          },
          {optional: {fsevents: ['add docs/a.md', 'change docs/a.md']}},
        );
      });
    });

    describe('other relative globs', () => {
      it('watches src/pages/**/*.{js,jsx,ts,tsx,md,mdx}', async () => {
        // Core: pages plugin default "include" option
        await using w = await createWatcher({
          files: ['src/pages/index.tsx', 'src/pages/styles.module.css'],
          paths: 'src/pages/**/*.{js,jsx,ts,tsx,md,mdx}',
        });
        await w
          .change('src/pages/index.tsx', 'src/pages/styles.module.css')
          .emits(['change src/pages/index.tsx']);
        await w
          .add(
            'src/pages/a.js',
            'src/pages/b.jsx',
            'src/pages/c.ts',
            'src/pages/sub/d.tsx',
            'src/pages/sub/e.md',
            'src/pages/sub/f.mdx',
            'src/pages/g.css',
            'src/components/h.tsx',
          )
          .emits([
            'add src/pages/a.js',
            'add src/pages/b.jsx',
            'add src/pages/c.ts',
            'add src/pages/sub/d.tsx',
            'add src/pages/sub/e.md',
            'add src/pages/sub/f.mdx',
          ]);
      });

      it('watches docs/**/_category_.{json,yml,yaml}', async () => {
        // Core: docs plugin category metadata files
        await using w = await createWatcher({
          files: ['docs/sub/_category_.json', 'docs/a.md'],
          paths: 'docs/**/_category_.{json,yml,yaml}',
        });
        await w
          .change('docs/sub/_category_.json', 'docs/a.md')
          .emits(['change docs/sub/_category_.json']);
        await w
          .add(
            'docs/_category_.yml',
            'docs/new/_category_.yaml',
            'docs/new/_category_.js',
            'docs/new/category.yml',
          )
          .emits(['add docs/_category_.yml', 'add docs/new/_category_.yaml']);
        await w
          .remove('docs/sub/_category_.json')
          .emits(['unlink docs/sub/_category_.json']);
      });

      it('watches docs/*.md', async () => {
        // Users can customize the plugins "include" option
        await using w = await createWatcher({
          files: ['docs/a.md', 'docs/sub/b.md'],
          paths: 'docs/*.md',
        });
        await w
          .change('docs/a.md', 'docs/sub/b.md')
          .emits(['change docs/a.md']);
        await w
          .add('docs/c.md', 'docs/sub/d.md', 'docs/e.mdx')
          .emits(['add docs/c.md']);
      });

      it('watches other "include" glob syntaxes', async () => {
        // Users can customize the plugins "include" option
        await using w = await createWatcher({
          files: ['docs/a.md', 'docs/sub/index.md'],
          paths: [
            'docs/**/index.md',
            'docs/**/*.markdown',
            'docs/**/[0-9]*.md',
            'docs/**/@(foo|bar).md',
          ],
        });
        await w
          .change('docs/a.md', 'docs/sub/index.md')
          .emits(['change docs/sub/index.md']);
        await w
          .add(
            'docs/new/index.md',
            'docs/new/x.markdown',
            'docs/new/1-x.md',
            'docs/new/foo.md',
            'docs/new/bar.md',
            'docs/new/baz.md',
          )
          .emits([
            'add docs/new/index.md',
            'add docs/new/x.markdown',
            'add docs/new/1-x.md',
            'add docs/new/foo.md',
            'add docs/new/bar.md',
          ]);
      });
    });

    describe('base dir', () => {
      // Core: localized content, i18n/<locale>/<plugin>/**/*.{md,mdx}
      const dir = 'i18n/fr/docusaurus-plugin-content-docs/current';
      const paths = `${dir}/**/*.{md,mdx}`;

      it('watches glob with missing base dir', async () => {
        await using w = await createWatcher({files: ['docs/a.md'], paths});
        // TODO Chokidar v3 limitation: when the glob base dir does not exist,
        //  creating files is only detected with FSEvents
        await w.add(`${dir}/a.md`, `${dir}/sub/b.md`).emits({
          fsevents: [`add ${dir}/a.md`, `add ${dir}/sub/b.md`],
          default: [],
        });
      });

      it('watches glob with missing base dir, existing parent', async () => {
        await using w = await createWatcher({
          files: ['i18n/fr/docusaurus-plugin-content-docs/current.json'],
          paths,
        });
        // TODO Chokidar v3 limitation: when the glob base dir does not exist,
        //  creating files is only detected with FSEvents
        await w.add(`${dir}/a.md`, `${dir}/sub/b.md`).emits({
          fsevents: [`add ${dir}/a.md`, `add ${dir}/sub/b.md`],
          default: [],
        });
      });

      it('watches glob with existing empty base dir', async () => {
        await using w = await createWatcher({
          files: [`${dir}/sub/x.json`],
          paths,
        });
        await w
          .add(`${dir}/a.md`, `${dir}/sub/b.md`, `${dir}/sub2/c.md`)
          .emits([
            `add ${dir}/a.md`,
            `add ${dir}/sub/b.md`,
            `add ${dir}/sub2/c.md`,
          ]);
      });
    });

    describe('absolute globs', () => {
      it('watches absolute glob', async () => {
        // Ecosystem: @aldridged/docusaurus-plugin-lunr...
        // Note: core makes absolute plugin paths relative to siteDir
        await using w = await createWatcher({
          files: ['docs/a.md', 'docs/b.md', 'docs/sub/c.md'],
          paths: ({siteDir}) => `${posixPath(siteDir)}/docs/**/*.{md,mdx}`,
        });
        await w.change('docs/a.md').emits(['change docs/a.md']);
        await w.add('docs/sub/d.md', 'docs/e.js').emits(['add docs/sub/d.md']);
        await w
          .rename('docs/b.md', 'docs/b2.md')
          .emits(['unlink docs/b.md', 'add docs/b2.md']);
        await w.remove('docs/sub/c.md').emits(['unlink docs/sub/c.md']);
      });
    });
  });
});
