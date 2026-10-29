/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import * as path from 'node:path';
import {DEFAULT_PLUGIN_ID} from '@docusaurus/utils';
import {readVersionsMetadata} from '../version';
import {DEFAULT_OPTIONS} from '../../options';
import type {I18n, I18nLocaleConfig, LoadContext} from '@docusaurus/types';
import type {
  PluginOptions,
  VersionMetadata,
} from '@docusaurus/plugin-content-docs';

function getI18n(
  locale: string,
  localeConfigOptions?: Partial<I18nLocaleConfig>,
): I18n {
  return {
    path: 'i18n',
    currentLocale: locale,
    locales: ['en'],
    defaultLocale: locale,
    localeConfigs: {
      [locale]: {
        path: locale,
        label: locale,
        translate: true,
        calendar: 'calendar',
        htmlLang: locale,
        direction: 'rtl',
        url: 'https://example.com',
        baseUrl: '/',
        ...localeConfigOptions,
      },
    },
  };
}

const DefaultI18N: I18n = getI18n('en');

describe('readVersionsMetadata', () => {
  describe('simple site', () => {
    async function loadSite({context}: {context?: Partial<LoadContext>} = {}) {
      const simpleSiteDir = path.resolve(
        path.join(__dirname, '../../__tests__/__fixtures__', 'simple-site'),
      );
      const defaultOptions: PluginOptions = {
        id: DEFAULT_PLUGIN_ID,
        ...DEFAULT_OPTIONS,
      };
      const defaultContext = {
        siteDir: simpleSiteDir,
        baseUrl: '/',
        i18n: DefaultI18N,
        localizationDir: path.join(simpleSiteDir, 'i18n/en'),
        ...context,
      } as LoadContext;

      const vCurrent: VersionMetadata = {
        contentPath: path.join(simpleSiteDir, 'docs'),
        contentPathLocalized: path.join(
          simpleSiteDir,
          'i18n/en/docusaurus-plugin-content-docs/current',
        ),
        isLast: true,
        routePriority: -1,
        sidebarFilePath: undefined,
        tagsPath: '/docs/tags',
        label: 'Next',
        versionName: 'current',
        path: '/docs',
        banner: null,
        badge: false,
        noIndex: false,
        className: 'docs-version-current',
      };
      return {simpleSiteDir, defaultOptions, defaultContext, vCurrent};
    }

    it('works', async () => {
      const {defaultOptions, defaultContext, vCurrent} = await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: defaultOptions,
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([vCurrent]);
    });

    it('works with translate: false', async () => {
      const {defaultOptions, defaultContext, vCurrent} = await loadSite({
        context: {
          i18n: getI18n('en', {translate: false}),
        },
      });

      const versionsMetadata = await readVersionsMetadata({
        options: defaultOptions,
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          contentPathLocalized: undefined,
        },
      ]);
    });

    it('works with base url', async () => {
      const {defaultOptions, defaultContext, vCurrent} = await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: defaultOptions,
        context: {
          ...defaultContext,
          baseUrl: '/myBaseUrl',
        },
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          path: '/myBaseUrl/docs',
          tagsPath: '/myBaseUrl/docs/tags',
        },
      ]);
    });

    it('works with current version config', async () => {
      const {defaultOptions, defaultContext, vCurrent} = await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {
          ...defaultOptions,
          versions: {
            current: {
              label: 'current-label',
              path: 'current-path',
            },
          },
        },
        context: {
          ...defaultContext,
          baseUrl: '/myBaseUrl',
        },
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          path: '/myBaseUrl/docs/current-path',
          label: 'current-label',
          routePriority: undefined,
          sidebarFilePath: undefined,
          tagsPath: '/myBaseUrl/docs/current-path/tags',
          editUrl: undefined,
          editUrlLocalized: undefined,
        },
      ]);
    });

    it('throws with unknown lastVersion', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {...defaultOptions, lastVersion: 'unknownVersionName'},
          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Docs option lastVersion: unknownVersionName is invalid. Available version names are: current]`,
      );
    });

    it('throws with unknown version configurations', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {
            ...defaultOptions,
            versions: {
              current: {label: 'current'},
              unknownVersionName1: {label: 'unknownVersionName1'},
              unknownVersionName2: {label: 'unknownVersionName2'},
            },
          },

          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid docs option "versions": unknown versions (unknownVersionName1,unknownVersionName2) found. Available version names are: current]`,
      );
    });

    it('throws with disableVersioning while single version', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {...defaultOptions, disableVersioning: true},
          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Docs: using "disableVersioning: true" option on a non-versioned site does not make sense.]`,
      );
    });

    it('throws without including current version', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {...defaultOptions, includeCurrentVersion: false},
          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: It is not possible to use docs without any version. No version is included because you have requested to not include <PROJECT_ROOT>/docs through "includeCurrentVersion: false", while the versions file is empty/non-existent.]`,
      );
    });
  });

  describe('versioned site, pluginId=default', () => {
    async function loadSite({context}: {context?: Partial<LoadContext>} = {}) {
      const versionedSiteDir = path.resolve(
        path.join(__dirname, '../../__tests__/__fixtures__', 'versioned-site'),
      );
      const defaultOptions: PluginOptions = {
        id: DEFAULT_PLUGIN_ID,
        ...DEFAULT_OPTIONS,
        sidebarPath: path.join(versionedSiteDir, 'sidebars.json'),
      };
      const defaultContext = {
        siteDir: versionedSiteDir,
        baseUrl: '/',
        i18n: DefaultI18N,
        localizationDir: path.join(versionedSiteDir, 'i18n/en'),
        ...context,
      } as LoadContext;

      const vCurrent: VersionMetadata = {
        contentPath: path.join(versionedSiteDir, 'docs'),
        contentPathLocalized: path.join(
          versionedSiteDir,
          'i18n/en/docusaurus-plugin-content-docs/current',
        ),
        isLast: false,
        routePriority: undefined,
        sidebarFilePath: path.join(versionedSiteDir, 'sidebars.json'),
        tagsPath: '/docs/next/tags',
        label: 'Next',
        versionName: 'current',
        path: '/docs/next',
        banner: 'unreleased',
        badge: true,
        noIndex: false,
        className: 'docs-version-current',
      };

      const v101: VersionMetadata = {
        contentPath: path.join(
          versionedSiteDir,
          'versioned_docs/version-1.0.1',
        ),
        contentPathLocalized: path.join(
          versionedSiteDir,
          'i18n/en/docusaurus-plugin-content-docs/version-1.0.1',
        ),
        isLast: true,
        routePriority: -1,
        sidebarFilePath: path.join(
          versionedSiteDir,
          'versioned_sidebars/version-1.0.1-sidebars.json',
        ),
        tagsPath: '/docs/tags',
        label: '1.0.1',
        versionName: '1.0.1',
        path: '/docs',
        banner: null,
        badge: true,
        noIndex: false,
        className: 'docs-version-1.0.1',
      };

      const v100: VersionMetadata = {
        contentPath: path.join(
          versionedSiteDir,
          'versioned_docs/version-1.0.0',
        ),
        contentPathLocalized: path.join(
          versionedSiteDir,
          'i18n/en/docusaurus-plugin-content-docs/version-1.0.0',
        ),
        isLast: false,
        routePriority: undefined,
        sidebarFilePath: path.join(
          versionedSiteDir,
          'versioned_sidebars/version-1.0.0-sidebars.json',
        ),
        tagsPath: '/docs/1.0.0/tags',
        label: '1.0.0',
        versionName: '1.0.0',
        path: '/docs/1.0.0',
        banner: 'unmaintained',
        badge: true,
        noIndex: false,
        className: 'docs-version-1.0.0',
      };

      const vWithSlugs: VersionMetadata = {
        contentPath: path.join(
          versionedSiteDir,
          'versioned_docs/version-withSlugs',
        ),
        contentPathLocalized: path.join(
          versionedSiteDir,
          'i18n/en/docusaurus-plugin-content-docs/version-withSlugs',
        ),
        isLast: false,
        routePriority: undefined,
        sidebarFilePath: path.join(
          versionedSiteDir,
          'versioned_sidebars/version-withSlugs-sidebars.json',
        ),
        tagsPath: '/docs/withSlugs/tags',
        label: 'withSlugs',
        versionName: 'withSlugs',
        path: '/docs/withSlugs',
        banner: 'unmaintained',
        badge: true,
        noIndex: false,
        className: 'docs-version-withSlugs',
      };

      return {
        versionedSiteDir,
        defaultOptions,
        defaultContext,
        vCurrent,
        v101,
        v100,
        vWithSlugs,
      };
    }

    it('works', async () => {
      const {defaultOptions, defaultContext, vCurrent, v101, v100, vWithSlugs} =
        await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: defaultOptions,
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([vCurrent, v101, v100, vWithSlugs]);
    });

    it('works with includeCurrentVersion=false', async () => {
      const {defaultOptions, defaultContext, v101, v100, vWithSlugs} =
        await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {...defaultOptions, includeCurrentVersion: false},
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        // vCurrent removed
        v101,
        v100,
        vWithSlugs,
      ]);
    });

    it('works with version options', async () => {
      const {defaultOptions, defaultContext, vCurrent, v101, v100, vWithSlugs} =
        await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {
          ...defaultOptions,
          lastVersion: '1.0.0',
          versions: {
            current: {
              path: 'current-path',
              banner: 'unmaintained',
              badge: false,
              className: 'custom-current-className',
            },
            '1.0.0': {
              label: '1.0.0-label',
              banner: 'unreleased',
            },
          },
        },
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          tagsPath: '/docs/current-path/tags',
          path: '/docs/current-path',
          banner: 'unmaintained',
          badge: false,
          className: 'custom-current-className',
        },
        {
          ...v101,
          isLast: false,
          routePriority: undefined,
          tagsPath: '/docs/1.0.1/tags',
          path: '/docs/1.0.1',
          banner: 'unreleased',
        },
        {
          ...v100,
          isLast: true,
          routePriority: -1,
          tagsPath: '/docs/tags',
          label: '1.0.0-label',
          path: '/docs',
          banner: 'unreleased',
        },
        vWithSlugs,
      ]);
    });

    it('works with editUrl', async () => {
      const {defaultOptions, defaultContext, vCurrent, v101, v100, vWithSlugs} =
        await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {
          ...defaultOptions,
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/docs',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/current',
        },
        {
          ...v101,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/versioned_docs/version-1.0.1',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/version-1.0.1',
        },
        {
          ...v100,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/versioned_docs/version-1.0.0',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/version-1.0.0',
        },
        {
          ...vWithSlugs,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/versioned_docs/version-withSlugs',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/version-withSlugs',
        },
      ]);
    });

    it('works with editUrl and translate=false', async () => {
      const {defaultOptions, defaultContext, vCurrent, v101, v100, vWithSlugs} =
        await loadSite({
          context: {
            i18n: getI18n('en', {translate: false}),
          },
        });

      const versionsMetadata = await readVersionsMetadata({
        options: {
          ...defaultOptions,
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          contentPathLocalized: undefined,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/docs',
          editUrlLocalized: undefined,
        },
        {
          ...v101,
          contentPathLocalized: undefined,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/versioned_docs/version-1.0.1',
          editUrlLocalized: undefined,
        },
        {
          ...v100,
          contentPathLocalized: undefined,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/versioned_docs/version-1.0.0',
          editUrlLocalized: undefined,
        },
        {
          ...vWithSlugs,
          contentPathLocalized: undefined,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/versioned_docs/version-withSlugs',
          editUrlLocalized: undefined,
        },
      ]);
    });

    it('works with editUrl and editCurrentVersion=true', async () => {
      const {defaultOptions, defaultContext, vCurrent, v101, v100, vWithSlugs} =
        await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {
          ...defaultOptions,
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
          editCurrentVersion: true,
        },
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/docs',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/current',
        },
        {
          ...v101,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/docs',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/current',
        },
        {
          ...v100,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/docs',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/current',
        },
        {
          ...vWithSlugs,
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/docs',
          editUrlLocalized:
            'https://github.com/facebook/docusaurus/edit/main/website/i18n/en/docusaurus-plugin-content-docs/current',
        },
      ]);
    });

    it('works with onlyIncludeVersions option', async () => {
      const {defaultOptions, defaultContext, v101, vWithSlugs} =
        await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {
          ...defaultOptions,
          // Order reversed on purpose: should not have any impact
          onlyIncludeVersions: [vWithSlugs.versionName, v101.versionName],
        },
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([v101, vWithSlugs]);
    });

    it('works with disableVersioning', async () => {
      const {defaultOptions, defaultContext, vCurrent} = await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {...defaultOptions, disableVersioning: true},
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          isLast: true,
          routePriority: -1,
          tagsPath: '/docs/tags',
          path: '/docs',
          banner: null,
          badge: false,
        },
      ]);
    });

    it('throws with all versions disabled', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {
            ...defaultOptions,
            includeCurrentVersion: false,
            disableVersioning: true,
          },

          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: It is not possible to use docs without any version. No version is included because you have requested to not include <PROJECT_ROOT>/docs through "includeCurrentVersion: false", while versioning is disabled with "disableVersioning: true".]`,
      );
    });

    it('throws with empty onlyIncludeVersions', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {
            ...defaultOptions,
            onlyIncludeVersions: [],
          },

          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid docs option "onlyIncludeVersions": an empty array is not allowed, at least one version is needed.]`,
      );
    });

    it('throws with unknown versions in onlyIncludeVersions', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {
            ...defaultOptions,
            onlyIncludeVersions: ['unknownVersion1', 'unknownVersion2'],
          },

          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid docs option "onlyIncludeVersions": unknown versions (unknownVersion1,unknownVersion2) found. Available version names are: current, 1.0.1, 1.0.0, withSlugs]`,
      );
    });

    it('throws with lastVersion not in onlyIncludeVersions', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {
            ...defaultOptions,
            lastVersion: '1.0.1',
            onlyIncludeVersions: ['current', '1.0.0'],
          },

          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid docs option "lastVersion": if you use both the "onlyIncludeVersions" and "lastVersion" options, then "lastVersion" must be present in the provided "onlyIncludeVersions" array.]`,
      );
    });

    it('throws with invalid versions.json file', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      const jsonMock = vi.spyOn(JSON, 'parse');
      jsonMock.mockImplementationOnce(() => ({
        invalid: 'json',
      }));

      await expect(
        readVersionsMetadata({
          options: defaultOptions,
          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: The versions file should contain an array of version names! Found content: {"invalid":"json"}]`,
      );
      jsonMock.mockImplementationOnce(() => [1.1]);

      await expect(
        readVersionsMetadata({
          options: defaultOptions,
          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Versions should be strings. Found type "number" for version 1.1.]`,
      );
      jsonMock.mockImplementationOnce(() => ['   ']);

      await expect(
        readVersionsMetadata({
          options: defaultOptions,
          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid version name "   ": version name must contain at least one non-whitespace character.]`,
      );
      jsonMock.mockRestore();
    });
  });

  describe('versioned site, pluginId=community', () => {
    async function loadSite() {
      const versionedSiteDir = path.resolve(
        path.join(__dirname, '../../__tests__/__fixtures__', 'versioned-site'),
      );
      const defaultOptions: PluginOptions = {
        ...DEFAULT_OPTIONS,
        id: 'community',
        path: 'community',
        routeBasePath: 'communityBasePath',
        sidebarPath: path.join(versionedSiteDir, 'sidebars.json'),
      };
      const defaultContext = {
        siteDir: versionedSiteDir,
        baseUrl: '/',
        i18n: DefaultI18N,
        localizationDir: path.join(versionedSiteDir, 'i18n/en'),
      } as LoadContext;

      const vCurrent: VersionMetadata = {
        contentPath: path.join(versionedSiteDir, 'community'),
        contentPathLocalized: path.join(
          versionedSiteDir,
          'i18n/en/docusaurus-plugin-content-docs-community/current',
        ),
        isLast: false,
        routePriority: undefined,
        sidebarFilePath: path.join(versionedSiteDir, 'sidebars.json'),
        tagsPath: '/communityBasePath/next/tags',
        label: 'Next',
        versionName: 'current',
        path: '/communityBasePath/next',
        banner: 'unreleased',
        badge: true,
        noIndex: false,
        className: 'docs-version-current',
      };

      const v100: VersionMetadata = {
        contentPath: path.join(
          versionedSiteDir,
          'community_versioned_docs/version-1.0.0',
        ),
        contentPathLocalized: path.join(
          versionedSiteDir,
          'i18n/en/docusaurus-plugin-content-docs-community/version-1.0.0',
        ),
        isLast: true,
        routePriority: -1,
        sidebarFilePath: path.join(
          versionedSiteDir,
          'community_versioned_sidebars/version-1.0.0-sidebars.json',
        ),
        tagsPath: '/communityBasePath/tags',
        label: '1.0.0',
        versionName: '1.0.0',
        path: '/communityBasePath',
        banner: null,
        badge: true,
        noIndex: false,
        className: 'docs-version-1.0.0',
      };

      return {versionedSiteDir, defaultOptions, defaultContext, vCurrent, v100};
    }

    it('works', async () => {
      const {defaultOptions, defaultContext, vCurrent, v100} = await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: defaultOptions,
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([vCurrent, v100]);
    });

    it('works with includeCurrentVersion=false', async () => {
      const {defaultOptions, defaultContext, v100} = await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {...defaultOptions, includeCurrentVersion: false},
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        // vCurrent removed
        {...v100, badge: false},
      ]);
    });

    it('works with disableVersioning', async () => {
      const {defaultOptions, defaultContext, vCurrent} = await loadSite();

      const versionsMetadata = await readVersionsMetadata({
        options: {...defaultOptions, disableVersioning: true},
        context: defaultContext,
      });

      expect(versionsMetadata).toEqual([
        {
          ...vCurrent,
          isLast: true,
          routePriority: -1,
          tagsPath: '/communityBasePath/tags',
          path: '/communityBasePath',
          banner: null,
          badge: false,
        },
      ]);
    });

    it('throws with all versions disabled', async () => {
      const {defaultOptions, defaultContext} = await loadSite();

      await expect(
        readVersionsMetadata({
          options: {
            ...defaultOptions,
            includeCurrentVersion: false,
            disableVersioning: true,
          },

          context: defaultContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: It is not possible to use docs without any version. No version is included because you have requested to not include <PROJECT_ROOT>/community through "includeCurrentVersion: false", while versioning is disabled with "disableVersioning: true".]`,
      );
    });
  });
});
