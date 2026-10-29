/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import * as path from 'node:path';
import {fromPartial} from '@total-typescript/shoehorn';
import {DEFAULT_PARSE_FRONT_MATTER} from '@docusaurus/utils/src';
import {TEST_VCS} from '@docusaurus/utils';
import {readVersionsMetadata} from '../version';
import {DEFAULT_OPTIONS} from '../../options';
import {loadVersion} from '../loadVersion';
import type {I18n, LoadContext} from '@docusaurus/types';
import type {PluginOptions} from '@docusaurus/plugin-content-docs';

const DefaultI18N: I18n = {
  path: 'i18n',
  currentLocale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  localeConfigs: {en: fromPartial({translate: true})},
};

async function siteFixture(fixture: string) {
  const siteDir = path.resolve(path.join(__dirname, './__fixtures__', fixture));
  const options: PluginOptions = fromPartial<PluginOptions>({
    id: 'default',
    ...DEFAULT_OPTIONS,
  });
  const context = fromPartial<LoadContext>({
    siteDir,
    baseUrl: '/',
    i18n: DefaultI18N,
    localizationDir: path.join(siteDir, 'i18n/en'),
    siteConfig: {
      markdown: {
        parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
      },
      vcs: TEST_VCS,
    },
  });

  const versions = await readVersionsMetadata({
    options,
    context,
  });

  return {
    siteDir,
    options,
    context,
    versions,
  };
}

describe('loadVersion', () => {
  describe('minimal site', () => {
    it('can load current version', async () => {
      const {options, context, versions} = await siteFixture('site-minimal');

      const version = versions[0]!;
      expect(version).toBeDefined();
      expect(version.versionName).toBe('current');

      const loadedVersion = loadVersion({
        context,
        options,
        versionMetadata: version,
        env: 'production',
      });

      await expect(loadedVersion).resolves.toMatchSnapshot();
    });
  });

  describe('site with broken versions', () => {
    async function loadTestVersion(versionName: string) {
      const {options, context, versions} = await siteFixture(
        'site-broken-versions',
      );
      const version = versions.find((v) => v.versionName === versionName);
      if (!version) {
        throw new Error(`Version '${versionName}' should exist`);
      }
      return loadVersion({
        context,
        options,
        versionMetadata: version,
        env: 'production',
      });
    }

    it('rejects version with doc id conflict', async () => {
      await expect(() => loadTestVersion('with-id-conflicts')).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [Error: The docs plugin found docs sharing the same id:

        - \`frontMatter/doc\` found in 3 docs:
          - versioned_docs/version-with-id-conflicts/frontMatter/doc.md
          - versioned_docs/version-with-id-conflicts/frontMatter/doc1.md
          - versioned_docs/version-with-id-conflicts/frontMatter/doc2.md

        - \`number-prefix/doc\` found in 2 docs:
          - versioned_docs/version-with-id-conflicts/number-prefix/1-doc.md
          - versioned_docs/version-with-id-conflicts/number-prefix/2-doc.md

        - \`number-prefix/deeply/nested/doc\` found in 2 docs:
          - versioned_docs/version-with-id-conflicts/number-prefix/deeply/nested/2-doc.md
          - versioned_docs/version-with-id-conflicts/number-prefix/deeply/nested/3-doc.md

        Docs should have distinct ids.
        In case of conflict, you can rename the docs file, or use the \`id\` front matter to assign an explicit distinct id to each doc.
            ]
      `);
    });
  });
});
