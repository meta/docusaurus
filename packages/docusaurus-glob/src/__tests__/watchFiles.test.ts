/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import path from 'node:path';
import {describeWatchModes} from './watchTestUtils';

describe('watch() file paths', () => {
  describeWatchModes((createWatcher) => {
    describe('absolute paths', () => {
      // Core: siteConfigPath
      // Ecosystem: redocusaurus spec file, docusaurus-plugin-glossary...
      const files = ['docusaurus.config.js', 'other.js'];
      const paths = ({siteDir}: {siteDir: string}) =>
        path.join(siteDir, 'docusaurus.config.js');

      it('watches file - change', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .change('docusaurus.config.js', 'other.js')
          .emits(['change docusaurus.config.js']);
        await w
          .atomicChange('docusaurus.config.js')
          .emits(['change docusaurus.config.js']);
      });

      it('watches file - remove', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .remove('docusaurus.config.js', 'other.js')
          .emits(['unlink docusaurus.config.js']);
        await w
          .add('docusaurus.config.js', 'other.js')
          .emits(['add docusaurus.config.js']);
      });

      it('watches file - rename', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .rename('docusaurus.config.js', 'renamed.js')
          .emits(['unlink docusaurus.config.js']);
        await w
          .rename('renamed.js', 'docusaurus.config.js')
          .emits(['add docusaurus.config.js']);
      });

      it('watches missing file', async () => {
        await using w = await createWatcher({
          files: ['glossary/other.json'],
          paths: ({siteDir}) => path.join(siteDir, 'glossary/glossary.json'),
        });
        await w
          .add('glossary/glossary.json', 'glossary/other2.json')
          .emits(['add glossary/glossary.json']);
      });

      it('watches missing file in missing dir', async () => {
        await using w = await createWatcher({
          paths: ({siteDir}) => path.join(siteDir, 'glossary/glossary.json'),
        });
        // TODO Chokidar v3 limitation: when the parent dir does not exist,
        //  creating the file is only detected with FSEvents
        await w
          .add('glossary/glossary.json', 'glossary/other.json')
          .emits({fsevents: ['add glossary/glossary.json'], default: []});
      });
    });

    describe('relative paths', () => {
      // Core: sidebars.json, blog/authors.yml, docs/tags.yml...
      const files = ['docs/tags.yml', 'docs/other.yml', 'sidebars.json'];
      const paths = 'docs/tags.yml';

      it('watches file - change', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .change('docs/tags.yml', 'docs/other.yml', 'sidebars.json')
          .emits(['change docs/tags.yml']);
        await w.atomicChange('docs/tags.yml').emits(['change docs/tags.yml']);
      });

      it('watches file - remove', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .remove('docs/tags.yml', 'docs/other.yml', 'sidebars.json')
          .emits(['unlink docs/tags.yml']);
        await w
          .add('docs/tags.yml', 'docs/other.yml', 'sidebars.json')
          .emits(['add docs/tags.yml']);
      });

      it('watches file - rename', async () => {
        await using w = await createWatcher({files, paths});
        await w
          .rename('docs/tags.yml', 'docs/renamed.yml')
          .emits(['unlink docs/tags.yml']);
        await w
          .rename('docs/renamed.yml', 'docs/tags.yml')
          .emits(['add docs/tags.yml']);
      });

      it('watches file - remove parent dir', async () => {
        await using w = await createWatcher({files, paths});
        // TODO Chokidar v3 inconsistency: FSEvents may not report it
        await w
          .remove('docs')
          .emits(
            {fsevents: [], default: ['unlink docs/tags.yml']},
            {optional: ['unlink docs/tags.yml']},
          );
        // TODO Chokidar v3 limitation: once the parent dir is removed,
        //  re-creating the file is only detected with FSEvents, that may report
        //  it as "add" or "change"
        await w.add('docs/tags.yml').emits([], {
          optional: {fsevents: ['add docs/tags.yml', 'change docs/tags.yml']},
        });
      });

      it('watches missing file', async () => {
        // Core: docs/tags.yml is watched even if it doesn't exist yet
        await using w = await createWatcher({files: ['docs/intro.md'], paths});
        await w
          .add('docs/tags.yml', 'docs/other.yml')
          .emits(['add docs/tags.yml']);
      });

      it('watches missing file in missing dir', async () => {
        await using w = await createWatcher({paths: 'blog/authors.yml'});
        // TODO Chokidar v3 limitation: when the parent dir does not exist,
        //  creating the file is only detected with FSEvents
        await w
          .add('blog/authors.yml', 'blog/other.yml')
          .emits({fsevents: ['add blog/authors.yml'], default: []});
      });

      it('watches file outside siteDir', async () => {
        // Ecosystem: absolute plugin paths are made relative to siteDir
        await using w = await createWatcher({
          files: ['../api/openapi.yaml', '../api/other.yaml'],
          paths: '../api/openapi.yaml',
        });
        await w
          .change('../api/openapi.yaml', '../api/other.yaml')
          .emits(['change ../api/openapi.yaml']);
        await w
          .rename('../api/openapi.yaml', '../api/renamed.yaml')
          .emits(['unlink ../api/openapi.yaml']);
      });

      it('watches file in node_modules', async () => {
        // Ecosystem: @easyops-cn/docusaurus-search-local watches its own
        // theme component file, that is usually inside node_modules
        const dir = 'node_modules/search/theme';
        await using w = await createWatcher({
          files: [`${dir}/SearchPage/index.js`, `${dir}/SearchBar/index.js`],
          paths: `${dir}/SearchPage/index.js`,
        });
        await w
          .change(`${dir}/SearchPage/index.js`, `${dir}/SearchBar/index.js`)
          .emits([`change ${dir}/SearchPage/index.js`]);
      });

      it('watches file in pnpm store outside siteDir', async () => {
        // Ecosystem: same as above, installed with pnpm in a monorepo
        // The path contains special chars ("@", "+") but is not a glob
        const dir =
          '../node_modules/.pnpm/@easyops-cn+docusaurus-search-local@0.55.3_@docusaurus+theme-common@3.10.2/node_modules/@easyops-cn/docusaurus-search-local/dist/client/theme';
        await using w = await createWatcher({
          files: [`${dir}/SearchPage/index.js`, `${dir}/SearchBar/index.js`],
          paths: `${dir}/SearchPage/index.js`,
        });
        await w
          .change(`${dir}/SearchPage/index.js`, `${dir}/SearchBar/index.js`)
          .emits([`change ${dir}/SearchPage/index.js`]);
      });
    });
  });
});
