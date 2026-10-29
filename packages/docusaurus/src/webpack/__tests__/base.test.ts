/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import _ from 'lodash';
import {posixPath} from '@docusaurus/utils';
import {getCurrentBundler} from '@docusaurus/bundler';
import {excludeJS, clientDir, createBaseConfig} from '../base';
import {BundlerNames, createTestConfigureWebpackUtils} from './testUtils';
import {DEFAULT_FUTURE_CONFIG} from '../../server/configValidation';
import type {CurrentBundler, Props, SiteMetadata} from '@docusaurus/types';

describe('babel transpilation exclude logic', () => {
  it('always transpiles client dir files', () => {
    const clientFiles = [
      'App.js',
      'clientEntry.js',
      'serverEntry.js',
      path.join('exports', 'Link.js'),
    ];
    clientFiles.forEach((file) => {
      expect(excludeJS(path.join(clientDir, file))).toBe(false);
    });
  });

  it('always transpiles non node_module files', () => {
    const moduleFiles = [
      '/pages/user/App.jsx',
      '/website/src/components/foo.js',
      '/src/theme/SearchBar/index.js',
    ];
    moduleFiles.forEach((file) => {
      expect(excludeJS(file)).toBe(false);
    });
  });

  it('transpiles docusaurus npm packages even in node_modules', () => {
    const moduleFiles = [
      '/website/node_modules/docusaurus-theme-search/theme/Navbar/index.js',
      'node_modules/@docusaurus/theme-classic/theme/Layout.js',
      '/docusaurus/website/node_modules/@docusaurus/theme-search-algolia/theme/SearchBar.js',
    ];
    moduleFiles.forEach((file) => {
      expect(excludeJS(file)).toBe(false);
    });
  });

  it('does not transpile node_modules', () => {
    const moduleFiles = [
      'node_modules/react-toggle.js',
      '/website/node_modules/react-trend/index.js',
      '/docusaurus/website/node_modules/react-super.js',
      '/docusaurus/website/node_modules/@docusaurus/core/node_modules/core-js/modules/_descriptors.js',
      'node_modules/docusaurus-theme-classic/node_modules/react-slick/index.js',
    ];
    moduleFiles.forEach((file) => {
      expect(excludeJS(file)).toBe(true);
    });
  });
});

describe('base webpack config', () => {
  const props = {
    outDir: '',
    siteDir: path.resolve(__dirname, '__fixtures__', 'base_test_site'),
    siteConfig: {staticDirectories: ['static'], future: DEFAULT_FUTURE_CONFIG},
    baseUrl: '',
    generatedFilesDir: '',
    routesPaths: [''],
    i18n: {
      currentLocale: 'en',
    },
    siteMetadata: {
      docusaurusVersion: '2.0.0-alpha.70',
      pluginVersions: {},
    },
    plugins: [
      {
        getThemePath() {
          return path.resolve(
            __dirname,
            '__fixtures__',
            'base_test_site',
            'pluginThemeFolder',
          );
        },
      },
      {
        getThemePath() {
          return path.resolve(
            __dirname,
            '__fixtures__',
            'base_test_site',
            'secondPluginThemeFolder',
          );
        },
      },
    ],
  } as Omit<Props, 'currentBundler'>;

  async function createProps(
    bundlerName: CurrentBundler['name'] = 'rspack',
  ): Promise<Props> {
    const siteConfig = {
      ...props.siteConfig,
      webpack: bundlerName === 'webpack' ? {} : undefined,
    };
    return {
      ...props,
      siteConfig,
      currentBundler: await getCurrentBundler({siteConfig}),
    };
  }

  // Rspack and webpack have a default rule giving the 'asset/source' type to
  // modules imported with `with {type: 'text'}`, but the loaders of all other
  // matching rules still apply (JS transpilation, MDX compilation, SVGR...)
  // Our rules must exclude text imports to return the raw file content
  // See https://rspack.rs/config/module-rules#ruleswith
  it.each(BundlerNames)(
    'excludes text import attributes from all core rules - %s',
    async (bundlerName) => {
      const config = await createBaseConfig({
        props: await createProps(bundlerName),
        isServer: false,
        minify: true,
        configureWebpackUtils:
          await createTestConfigureWebpackUtils(bundlerName),
      });
      const rules = config.module?.rules ?? [];
      expect(rules.length).toBeGreaterThan(0);
      rules.forEach((rule) => {
        expect(rule).toMatchObject({with: {type: {not: 'text'}}});
      });
    },
  );

  it('creates webpack aliases', async () => {
    const aliases = ((
      await createBaseConfig({
        props: await createProps(),
        isServer: true,
        minify: true,
        configureWebpackUtils: await createTestConfigureWebpackUtils(),
      })
    ).resolve?.alias ?? {}) as {[alias: string]: string};
    // Make aliases relative so that test work on all computers
    const relativeAliases = _.mapValues(aliases, (a) =>
      posixPath(path.relative(props.siteDir, a)),
    );
    expect(relativeAliases).toMatchSnapshot();
  });

  describe('persistent cache', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    async function getCacheVersion({
      isServer = false,
      siteMetadata = props.siteMetadata,
    }: {
      isServer?: boolean;
      siteMetadata?: SiteMetadata;
    } = {}) {
      const config = await createBaseConfig({
        props: {...(await createProps()), siteMetadata},
        isServer,
        minify: true,
        configureWebpackUtils: await createTestConfigureWebpackUtils(),
      });
      return (config.cache as {version: string}).version;
    }

    // Browserslist reads this env variable before any config file
    function stubBrowserslistQuery(query: string) {
      vi.stubEnv('BROWSERSLIST', query);
    }

    function stubServerNodeTarget(nodeVersion: string) {
      vi.stubEnv('DOCUSAURUS_SERVER_NODE_TARGET', nodeVersion);
    }

    function createSiteMetadata({
      siteVersion,
      pluginVersion = '1.0.0',
    }: {
      siteVersion?: string;
      pluginVersion?: string;
    }): SiteMetadata {
      return {
        ...props.siteMetadata,
        siteVersion,
        pluginVersions: {
          'third-party-plugin': {
            type: 'package',
            name: 'third-party-plugin',
            version: pluginVersion,
          },
        },
      };
    }

    it('is evicted when the Browserslist queries match other browsers', async () => {
      stubBrowserslistQuery('chrome 90');
      const oldBrowsersVersion = await getCacheVersion();
      stubBrowserslistQuery('baseline widely available');
      const baselineVersion = await getCacheVersion();
      expect(oldBrowsersVersion).not.toBe(baselineVersion);
    });

    it('is not evicted when other Browserslist queries match the same browsers', async () => {
      stubBrowserslistQuery('chrome 90');
      const versionQueryVersion = await getCacheVersion();
      stubBrowserslistQuery('chrome >= 90 and chrome <= 90');
      const rangeQueryVersion = await getCacheVersion();
      expect(versionQueryVersion).toBe(rangeQueryVersion);
    });

    // Server targets aren't Browserslist queries: Browserslist doesn't know
    // these Node.js patch releases
    it('is evicted when the server Node.js target changes', async () => {
      stubServerNodeTarget('24.11.1');
      const oldNodeVersion = await getCacheVersion({isServer: true});
      stubServerNodeTarget('24.11.2');
      const newNodeVersion = await getCacheVersion({isServer: true});
      expect(oldNodeVersion).not.toBe(newNodeVersion);
    });

    it('is evicted when a plugin package version changes', async () => {
      const oldPluginVersion = await getCacheVersion({
        siteMetadata: createSiteMetadata({pluginVersion: '1.0.0'}),
      });
      const newPluginVersion = await getCacheVersion({
        siteMetadata: createSiteMetadata({pluginVersion: '1.1.0'}),
      });
      expect(oldPluginVersion).not.toBe(newPluginVersion);
    });

    it('is not evicted when the site version changes', async () => {
      const oldSiteVersion = await getCacheVersion({
        siteMetadata: createSiteMetadata({siteVersion: '1.0.0'}),
      });
      const newSiteVersion = await getCacheVersion({
        siteMetadata: createSiteMetadata({siteVersion: '2.0.0'}),
      });
      expect(oldSiteVersion).toBe(newSiteVersion);
    });
  });
});
