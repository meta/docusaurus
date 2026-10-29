/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import _ from 'lodash';
import {isMatch} from 'picomatch';
import {Command} from 'commander';
import webpack from 'webpack';
import {loadContext} from '@docusaurus/core/src/server/site';
import {
  applyConfigureWebpack,
  createConfigureWebpackUtils,
} from '@docusaurus/core/src/webpack/configure';
import {sortRoutes} from '@docusaurus/core/src/server/plugins/routeConfig';
import {getLocaleConfig, posixPath} from '@docusaurus/utils';
import {normalizePluginOptions} from '@docusaurus/utils-validation';

import pluginContentDocs from '../index';
import {toSidebarsProp} from '../props';
import {DefaultSidebarItemsGenerator} from '../sidebars/generator';
import {DisabledSidebars} from '../sidebars';
import cliDocs from '../cli';
import {validateOptions} from '../options';
import {toFullVersion} from '../versions/version';

import type {RouteConfig, Validate, Plugin} from '@docusaurus/types';
import type {
  LoadedVersion,
  Options,
  PluginOptions,
  PropSidebarItemLink,
} from '@docusaurus/plugin-content-docs';
import type {
  SidebarItemsGeneratorOption,
  NormalizedSidebar,
} from '../sidebars/types';

// Returns the doc with its navigation, only computed in contentLoaded
function findDocById(version: LoadedVersion | undefined, id: string) {
  if (!version) {
    throw new Error('Version not found');
  }
  return toFullVersion(version).docs.find((item) => item.id === id);
}
function getDocById(version: LoadedVersion | undefined, id: string) {
  if (!version) {
    throw new Error('Version not found');
  }
  const doc = findDocById(version, id);
  if (!doc) {
    throw new Error(
      `No doc found with id "${id}" in version ${version.versionName}.
Available ids are:\n- ${version.docs.map((d) => d.id).join('\n- ')}`,
    );
  }
  return doc;
}

const createFakeActions = (contentDir: string) => {
  let routeConfigs: RouteConfig[] = [];
  const dataContainer: {[key: string]: unknown} = {};
  const globalDataContainer: {pluginName?: {pluginId: unknown}} = {};

  const actions = {
    addRoute: (config: RouteConfig) => {
      routeConfigs.push(config);
    },
    createData: (name: string, content: unknown) => {
      dataContainer[name] = content;
      return Promise.resolve(path.join(contentDir, name));
    },
    setGlobalData: (data: unknown) => {
      globalDataContainer.pluginName = {pluginId: data};
    },
  };

  // Extra fns useful for tests!
  const utils = {
    getGlobalData: () => globalDataContainer,
    getRouteConfigs: () => routeConfigs,

    expectSnapshot: () => {
      // Sort the route config like in src/server/plugins/index.ts for
      // consistent snapshot ordering
      routeConfigs = sortRoutes(routeConfigs, '/');
      expect(routeConfigs).not.toEqual([]);
      expect(routeConfigs).toMatchSnapshot('route config');
      expect(dataContainer).toMatchSnapshot('data');
      expect(globalDataContainer).toMatchSnapshot('global data');
    },
  };

  return {
    actions,
    utils,
  };
};

describe('sidebar', () => {
  it('site with wrong sidebar content', async () => {
    const siteDir = path.join(__dirname, '__fixtures__', 'simple-site');
    const context = await loadContext({siteDir});
    const sidebarPath = path.join(siteDir, 'wrong-sidebars.json');
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          sidebarPath,
        },
      }),
    );
    await expect(plugin.loadContent!()).rejects.toThrowErrorMatchingSnapshot();
  });

  it('site with wrong sidebar file path', async () => {
    const siteDir = path.join(__dirname, '__fixtures__', 'site-with-doc-label');
    const context = await loadContext({siteDir});

    await expect(async () => {
      const plugin = await pluginContentDocs(
        context,
        validateOptions({
          validate: normalizePluginOptions as Validate<Options, PluginOptions>,
          options: {
            sidebarPath: 'wrong-path-sidebar.json',
          },
        }),
      );

      await plugin.loadContent!();
    }).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: The path to the sidebar file does not exist at "wrong-path-sidebar.json".
      Please set the docs "sidebarPath" field in your config file to:
      - a sidebars path that exists
      - false: to disable the sidebar
      - undefined: for Docusaurus to generate it automatically]
    `);
  });

  it('site with undefined sidebar', async () => {
    const siteDir = path.join(__dirname, '__fixtures__', 'site-with-doc-label');
    const context = await loadContext({siteDir});
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          sidebarPath: undefined,
        },
      }),
    );
    const result = await plugin.loadContent!();

    expect(result.loadedVersions).toHaveLength(1);
    expect(result.loadedVersions[0]!.sidebars).toMatchSnapshot();
  });

  it('site with disabled sidebar', async () => {
    const siteDir = path.join(__dirname, '__fixtures__', 'site-with-doc-label');
    const context = await loadContext({siteDir});
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          sidebarPath: false,
        },
      }),
    );
    const result = await plugin.loadContent!();

    expect(result.loadedVersions).toHaveLength(1);
    expect(result.loadedVersions[0]!.sidebars).toEqual(DisabledSidebars);
  });
});

describe('empty/no docs website', () => {
  const siteDir = path.join(__dirname, '__fixtures__', 'empty-site');

  it('no files in docs folder', async () => {
    const context = await loadContext({siteDir});
    await fs.mkdir(path.join(siteDir, 'docs'), {recursive: true});
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {},
      }),
    );
    await expect(
      plugin.loadContent!(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Docs version "current" has no docs! At least one doc should exist at "docs".]`,
    );
  });

  it('docs folder does not exist', async () => {
    const context = await loadContext({siteDir});
    await expect(
      pluginContentDocs(
        context,
        validateOptions({
          validate: normalizePluginOptions as Validate<Options, PluginOptions>,
          options: {
            path: 'path/does/not/exist',
          },
        }),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: The docs folder does not exist for version "current". A docs folder is expected to be found at path/does/not/exist.]`,
    );
  });
});

describe('simple website', () => {
  async function loadSite({translate}: {translate?: boolean} = {}) {
    const siteDir = path.join(__dirname, '__fixtures__', 'simple-site');
    const context = await loadContext({siteDir});

    // hacky but gets the job done
    getLocaleConfig(context.i18n).translate = translate ?? true;

    const sidebarPath = path.join(siteDir, 'sidebars.json');
    const options = validateOptions({
      validate: normalizePluginOptions as Validate<Options, PluginOptions>,
      options: {
        path: 'docs',
        sidebarPath,
      },
    });
    const plugin = await pluginContentDocs(context, options);
    const pluginContentDir = path.join(context.generatedFilesDir, plugin.name);

    return {
      siteDir,
      context,
      sidebarPath,
      plugin,
      options,
      pluginContentDir,
      getPathsToWatch: () => {
        const pathToWatch = plugin.getPathsToWatch!();
        return pathToWatch.map((filepath) =>
          posixPath(path.relative(siteDir, filepath)),
        );
      },
    };
  }

  it('extendCli - docsVersion', async () => {
    const {plugin, options, context} = await loadSite();
    const mock = vi
      .spyOn(cliDocs, 'cliDocsVersionCommand')
      .mockImplementation(async () => {});
    const cli = new Command();
    plugin.extendCli!(cli);
    cli.parse(['node', 'test', 'docs:version', '1.0.0']);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('1.0.0', options, context);
    mock.mockRestore();
  });

  describe('getPathToWatch', () => {
    it('translate: false', async () => {
      const {getPathsToWatch} = await loadSite({translate: false});
      expect(getPathsToWatch()).toMatchInlineSnapshot(`
        [
          "sidebars.json",
          "docs/**/*.{md,mdx}",
          "docs/tags.yml",
          "docs/**/_category_.{json,yml,yaml}",
        ]
      `);
    });

    it('translate: true', async () => {
      const {getPathsToWatch} = await loadSite({translate: true});
      expect(getPathsToWatch()).toMatchInlineSnapshot(`
        [
          "sidebars.json",
          "i18n/en/docusaurus-plugin-content-docs/current/**/*.{md,mdx}",
          "docs/**/*.{md,mdx}",
          "i18n/en/docusaurus-plugin-content-docs/current/tags.yml",
          "docs/tags.yml",
          "docs/**/_category_.{json,yml,yaml}",
        ]
      `);
    });

    it('returns patterns matching docs', async () => {
      const {getPathsToWatch} = await loadSite();
      const matchPattern = getPathsToWatch();
      expect(isMatch('docs/hello.md', matchPattern)).toBe(true);
      expect(isMatch('docs/hello.mdx', matchPattern)).toBe(true);
      expect(isMatch('docs/foo/bar.md', matchPattern)).toBe(true);
      expect(isMatch('docs/hello.js', matchPattern)).toBe(false);
      expect(isMatch('docs/super.mdl', matchPattern)).toBe(false);
      expect(isMatch('docs/mdx', matchPattern)).toBe(false);
      expect(isMatch('docs/headingAsTitle.md', matchPattern)).toBe(true);
      expect(isMatch('sidebars.json', matchPattern)).toBe(true);
      expect(isMatch('versioned_docs/hello.md', matchPattern)).toBe(false);
      expect(isMatch('hello.md', matchPattern)).toBe(false);
      expect(isMatch('super/docs/hello.md', matchPattern)).toBe(false);
    });
  });

  it('configureWebpack', async () => {
    const {siteDir, plugin} = await loadSite();

    const content = await plugin.loadContent?.();

    const config = applyConfigureWebpack({
      configureWebpack: plugin.configureWebpack as NonNullable<
        Plugin['configureWebpack']
      >,
      config: {
        entry: './src/index.js',
        output: {
          filename: 'main.js',
          path: path.resolve(__dirname, 'dist'),
        },
      },
      isServer: false,
      configureWebpackUtils: await createConfigureWebpackUtils({
        siteDir,
        siteConfig: {},
      }),
      content,
    });
    const errors = webpack.validate(config);
    expect(errors).toBeUndefined();
  });

  it('content', async () => {
    const {plugin, pluginContentDir} = await loadSite();
    const content = await plugin.loadContent!();
    expect(content.loadedVersions).toHaveLength(1);
    const [currentVersion] = content.loadedVersions;

    expect(findDocById(currentVersion, 'foo/baz')).toMatchSnapshot();

    expect(findDocById(currentVersion, 'hello')).toMatchSnapshot();

    expect(getDocById(currentVersion, 'foo/bar')).toMatchSnapshot();

    expect(currentVersion!.sidebars).toMatchSnapshot();

    const {actions, utils} = createFakeActions(pluginContentDir);

    await plugin.contentLoaded!({
      content,
      actions,
    });

    utils.expectSnapshot();

    expect(utils.getGlobalData()).toMatchSnapshot();
  });
});

describe('versioned website', () => {
  async function loadSite({translate}: {translate?: boolean} = {}) {
    const siteDir = path.join(__dirname, '__fixtures__', 'versioned-site');
    const context = await loadContext({siteDir});

    // hacky but gets the job done
    getLocaleConfig(context.i18n).translate = translate ?? true;

    const sidebarPath = path.join(siteDir, 'sidebars.json');
    const routeBasePath = 'docs';
    const options = validateOptions({
      validate: normalizePluginOptions as Validate<Options, PluginOptions>,
      options: {
        routeBasePath,
        sidebarPath,
        versions: {
          '1.0.1': {
            noIndex: true,
          },
        },
      },
    });
    const plugin = await pluginContentDocs(context, options);
    const pluginContentDir = path.join(context.generatedFilesDir, plugin.name);
    return {
      siteDir,
      context,
      routeBasePath,
      sidebarPath,
      options,
      plugin,
      pluginContentDir,

      getPathsToWatch: () => {
        const pathToWatch = plugin.getPathsToWatch!();
        return pathToWatch.map((filepath) =>
          posixPath(path.relative(siteDir, filepath)),
        );
      },
    };
  }

  it('extendCli - docsVersion', async () => {
    const {plugin, context, options} = await loadSite();
    const mock = vi
      .spyOn(cliDocs, 'cliDocsVersionCommand')
      .mockImplementation(async () => {});
    const cli = new Command();
    plugin.extendCli!(cli);
    cli.parse(['node', 'test', 'docs:version', '2.0.0']);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('2.0.0', options, context);
    mock.mockRestore();
  });

  describe('getPathToWatch', () => {
    it('translate: false', async () => {
      const {getPathsToWatch} = await loadSite({translate: false});
      expect(getPathsToWatch()).toMatchInlineSnapshot(`
        [
          "sidebars.json",
          "docs/**/*.{md,mdx}",
          "docs/tags.yml",
          "docs/**/_category_.{json,yml,yaml}",
          "versioned_sidebars/version-1.0.1-sidebars.json",
          "versioned_docs/version-1.0.1/**/*.{md,mdx}",
          "versioned_docs/version-1.0.1/tags.yml",
          "versioned_docs/version-1.0.1/**/_category_.{json,yml,yaml}",
          "versioned_sidebars/version-1.0.0-sidebars.json",
          "versioned_docs/version-1.0.0/**/*.{md,mdx}",
          "versioned_docs/version-1.0.0/tags.yml",
          "versioned_docs/version-1.0.0/**/_category_.{json,yml,yaml}",
          "versioned_sidebars/version-withSlugs-sidebars.json",
          "versioned_docs/version-withSlugs/**/*.{md,mdx}",
          "versioned_docs/version-withSlugs/tags.yml",
          "versioned_docs/version-withSlugs/**/_category_.{json,yml,yaml}",
        ]
      `);
    });

    it('translate: true', async () => {
      const {getPathsToWatch} = await loadSite({translate: true});
      expect(getPathsToWatch()).toMatchInlineSnapshot(`
        [
          "sidebars.json",
          "i18n/en/docusaurus-plugin-content-docs/current/**/*.{md,mdx}",
          "docs/**/*.{md,mdx}",
          "i18n/en/docusaurus-plugin-content-docs/current/tags.yml",
          "docs/tags.yml",
          "docs/**/_category_.{json,yml,yaml}",
          "versioned_sidebars/version-1.0.1-sidebars.json",
          "i18n/en/docusaurus-plugin-content-docs/version-1.0.1/**/*.{md,mdx}",
          "versioned_docs/version-1.0.1/**/*.{md,mdx}",
          "i18n/en/docusaurus-plugin-content-docs/version-1.0.1/tags.yml",
          "versioned_docs/version-1.0.1/tags.yml",
          "versioned_docs/version-1.0.1/**/_category_.{json,yml,yaml}",
          "versioned_sidebars/version-1.0.0-sidebars.json",
          "i18n/en/docusaurus-plugin-content-docs/version-1.0.0/**/*.{md,mdx}",
          "versioned_docs/version-1.0.0/**/*.{md,mdx}",
          "i18n/en/docusaurus-plugin-content-docs/version-1.0.0/tags.yml",
          "versioned_docs/version-1.0.0/tags.yml",
          "versioned_docs/version-1.0.0/**/_category_.{json,yml,yaml}",
          "versioned_sidebars/version-withSlugs-sidebars.json",
          "i18n/en/docusaurus-plugin-content-docs/version-withSlugs/**/*.{md,mdx}",
          "versioned_docs/version-withSlugs/**/*.{md,mdx}",
          "i18n/en/docusaurus-plugin-content-docs/version-withSlugs/tags.yml",
          "versioned_docs/version-withSlugs/tags.yml",
          "versioned_docs/version-withSlugs/**/_category_.{json,yml,yaml}",
        ]
      `);
    });

    it('returns patterns matching docs', async () => {
      const {getPathsToWatch} = await loadSite();
      const matchPattern = getPathsToWatch();
      expect(isMatch('docs/hello.md', matchPattern)).toBe(true);
      expect(isMatch('docs/hello.mdx', matchPattern)).toBe(true);
      expect(isMatch('docs/foo/bar.md', matchPattern)).toBe(true);
      expect(isMatch('sidebars.json', matchPattern)).toBe(true);
      expect(
        isMatch('versioned_docs/version-1.0.0/hello.md', matchPattern),
      ).toBe(true);
      expect(
        isMatch('versioned_docs/version-1.0.0/foo/bar.md', matchPattern),
      ).toBe(true);
      expect(
        isMatch('versioned_sidebars/version-1.0.0-sidebars.json', matchPattern),
      ).toBe(true);

      // Non existing version
      expect(
        isMatch('versioned_docs/version-2.0.0/foo/bar.md', matchPattern),
      ).toBe(false);
      expect(
        isMatch('versioned_docs/version-2.0.0/hello.md', matchPattern),
      ).toBe(false);
      expect(
        isMatch('versioned_sidebars/version-2.0.0-sidebars.json', matchPattern),
      ).toBe(false);

      expect(isMatch('docs/hello.js', matchPattern)).toBe(false);
      expect(isMatch('docs/super.mdl', matchPattern)).toBe(false);
      expect(isMatch('docs/mdx', matchPattern)).toBe(false);
      expect(isMatch('hello.md', matchPattern)).toBe(false);
      expect(isMatch('super/docs/hello.md', matchPattern)).toBe(false);
    });
  });

  it('content', async () => {
    const {plugin, pluginContentDir} = await loadSite({translate: true});
    const content = await plugin.loadContent!();
    expect(content.loadedVersions).toHaveLength(4);
    const [currentVersion, version101, version100, versionWithSlugs] =
      content.loadedVersions;

    // foo/baz.md only exists in version -1.0.0
    expect(findDocById(currentVersion, 'foo/baz')).toBeUndefined();
    expect(findDocById(version101, 'foo/baz')).toBeUndefined();
    expect(findDocById(versionWithSlugs, 'foo/baz')).toBeUndefined();

    expect(getDocById(currentVersion, 'foo/bar')).toMatchSnapshot();
    expect(getDocById(version101, 'foo/bar')).toMatchSnapshot();

    expect(getDocById(currentVersion, 'hello')).toMatchSnapshot();
    expect(getDocById(version101, 'hello')).toMatchSnapshot();
    expect(getDocById(version100, 'foo/baz')).toMatchSnapshot();

    expect(currentVersion!.sidebars).toMatchSnapshot(
      'current version sidebars',
    );
    expect(version101!.sidebars).toMatchSnapshot('101 version sidebars');
    expect(version100!.sidebars).toMatchSnapshot('100 version sidebars');
    expect(versionWithSlugs!.sidebars).toMatchSnapshot(
      'withSlugs version sidebars',
    );

    const {actions, utils} = createFakeActions(pluginContentDir);
    await plugin.contentLoaded!({
      content,
      actions,
    });

    utils.expectSnapshot();
  });
});

describe('versioned website (community)', () => {
  async function loadSite({translate}: {translate?: boolean} = {}) {
    const siteDir = path.join(__dirname, '__fixtures__', 'versioned-site');
    const context = await loadContext({siteDir});

    // hacky but gets the job done
    getLocaleConfig(context.i18n).translate = translate ?? true;

    const sidebarPath = path.join(siteDir, 'community_sidebars.json');
    const routeBasePath = 'community';
    const pluginId = 'community';
    const options = validateOptions({
      validate: normalizePluginOptions as Validate<Options, PluginOptions>,
      options: {
        id: 'community',
        path: 'community',
        routeBasePath,
        sidebarPath,
      },
    });
    const plugin = await pluginContentDocs(context, options);
    const pluginContentDir = path.join(context.generatedFilesDir, plugin.name);
    return {
      siteDir,
      context,
      routeBasePath,
      sidebarPath,
      pluginId,
      options,
      plugin,
      pluginContentDir,

      getPathsToWatch: () => {
        const pathToWatch = plugin.getPathsToWatch!();
        return pathToWatch.map((filepath) =>
          posixPath(path.relative(siteDir, filepath)),
        );
      },
    };
  }

  it('extendCli - docsVersion', async () => {
    const {pluginId, plugin, options, context} = await loadSite();
    const mock = vi
      .spyOn(cliDocs, 'cliDocsVersionCommand')
      .mockImplementation(async () => {});
    const cli = new Command();
    plugin.extendCli!(cli);
    cli.parse(['node', 'test', `docs:version:${pluginId}`, '2.0.0']);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('2.0.0', options, context);
    mock.mockRestore();
  });

  describe('getPathToWatch', () => {
    it('translate: false', async () => {
      const {getPathsToWatch} = await loadSite({translate: false});
      expect(getPathsToWatch()).toMatchInlineSnapshot(`
        [
          "community_sidebars.json",
          "community/**/*.{md,mdx}",
          "community/tags.yml",
          "community/**/_category_.{json,yml,yaml}",
          "community_versioned_sidebars/version-1.0.0-sidebars.json",
          "community_versioned_docs/version-1.0.0/**/*.{md,mdx}",
          "community_versioned_docs/version-1.0.0/tags.yml",
          "community_versioned_docs/version-1.0.0/**/_category_.{json,yml,yaml}",
        ]
      `);
    });

    it('translate: true', async () => {
      const {getPathsToWatch} = await loadSite({translate: true});
      expect(getPathsToWatch()).toMatchInlineSnapshot(`
        [
          "community_sidebars.json",
          "i18n/en/docusaurus-plugin-content-docs-community/current/**/*.{md,mdx}",
          "community/**/*.{md,mdx}",
          "i18n/en/docusaurus-plugin-content-docs-community/current/tags.yml",
          "community/tags.yml",
          "community/**/_category_.{json,yml,yaml}",
          "community_versioned_sidebars/version-1.0.0-sidebars.json",
          "i18n/en/docusaurus-plugin-content-docs-community/version-1.0.0/**/*.{md,mdx}",
          "community_versioned_docs/version-1.0.0/**/*.{md,mdx}",
          "i18n/en/docusaurus-plugin-content-docs-community/version-1.0.0/tags.yml",
          "community_versioned_docs/version-1.0.0/tags.yml",
          "community_versioned_docs/version-1.0.0/**/_category_.{json,yml,yaml}",
        ]
      `);
    });

    it('returns patterns matching docs', async () => {
      const {getPathsToWatch} = await loadSite();
      const matchPattern = getPathsToWatch();
      expect(isMatch('community/team.md', matchPattern)).toBe(true);
      expect(
        isMatch('community_versioned_docs/version-1.0.0/team.md', matchPattern),
      ).toBe(true);

      // Non existing version
      expect(
        isMatch('community_versioned_docs/version-2.0.0/team.md', matchPattern),
      ).toBe(false);
      expect(
        isMatch(
          'community_versioned_sidebars/version-2.0.0-sidebars.json',
          matchPattern,
        ),
      ).toBe(false);

      expect(isMatch('community/team.js', matchPattern)).toBe(false);
      expect(
        isMatch('community_versioned_docs/version-1.0.0/team.js', matchPattern),
      ).toBe(false);
    });
  });

  it('content', async () => {
    const {plugin, pluginContentDir} = await loadSite();
    const content = await plugin.loadContent!();
    expect(content.loadedVersions).toHaveLength(2);
    const [currentVersion, version100] = content.loadedVersions;

    expect(getDocById(currentVersion, 'team')).toMatchSnapshot();
    expect(getDocById(version100, 'team')).toMatchSnapshot();

    expect(currentVersion!.sidebars).toMatchSnapshot(
      'current version sidebars',
    );
    expect(version100!.sidebars).toMatchSnapshot('100 version sidebars');

    const {actions, utils} = createFakeActions(pluginContentDir);
    await plugin.contentLoaded!({
      content,
      actions,
    });

    utils.expectSnapshot();
  });
});

describe('site with doc label', () => {
  async function loadSite() {
    const siteDir = path.join(__dirname, '__fixtures__', 'site-with-doc-label');
    const context = await loadContext({siteDir});
    const sidebarPath = path.join(siteDir, 'sidebars.json');
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          path: 'docs',
          sidebarPath,
        },
      }),
    );

    const content = (await plugin.loadContent?.())!;

    return {content};
  }

  it('label in sidebar.json is used', async () => {
    const {content} = await loadSite();
    const loadedVersion = content.loadedVersions[0]!;
    const sidebarProps = toSidebarsProp(loadedVersion);

    expect((sidebarProps.docs![0] as PropSidebarItemLink).label).toBe(
      'Hello One',
    );
  });

  it('frontMatter.sidebar_* data in doc has higher precedence over sidebar.json data', async () => {
    const {content} = await loadSite();
    const loadedVersion = content.loadedVersions[0]!;
    const sidebarProps = toSidebarsProp(loadedVersion);

    const item = sidebarProps.docs![1] as PropSidebarItemLink;

    expect(item.label).toBe('Hello 2 From Doc');
    expect(item.className).toBe('front-matter-class-name');
    expect(item.customProps).toStrictEqual({custom: 'from front matter'});
  });
});

describe('site with full autogenerated sidebar', () => {
  async function loadSite() {
    const siteDir = path.join(
      __dirname,
      '__fixtures__',
      'site-with-autogenerated-sidebar',
    );
    const context = await loadContext({siteDir});
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          path: 'docs',
        },
      }),
    );

    const content = (await plugin.loadContent?.())!;

    return {content, siteDir};
  }

  it('sidebar is fully autogenerated', async () => {
    const {content} = await loadSite();
    const version = content.loadedVersions[0]!;

    expect(version.sidebars).toMatchSnapshot();
  });

  it('docs in fully generated sidebar have correct metadata', async () => {
    const {content} = await loadSite();
    const version = content.loadedVersions[0]!;

    expect(getDocById(version, 'getting-started')).toMatchSnapshot();
    expect(getDocById(version, 'installation')).toMatchSnapshot();
    expect(getDocById(version, 'Guides/guide1')).toMatchSnapshot();
    expect(getDocById(version, 'Guides/guide2')).toMatchSnapshot();
    expect(getDocById(version, 'Guides/guide2.5')).toMatchSnapshot();
    expect(getDocById(version, 'Guides/guide3')).toMatchSnapshot();
    expect(getDocById(version, 'Guides/guide4')).toMatchSnapshot();
    expect(getDocById(version, 'Guides/guide5')).toMatchSnapshot();
    expect(getDocById(version, 'API/api-overview')).toMatchSnapshot();
    expect(getDocById(version, 'API/Core APIs/Client API')).toMatchSnapshot();
    expect(getDocById(version, 'API/Core APIs/Server API')).toMatchSnapshot();
    expect(
      getDocById(version, 'API/Extension APIs/Plugin API'),
    ).toMatchSnapshot();
    expect(
      getDocById(version, 'API/Extension APIs/Theme API'),
    ).toMatchSnapshot();
    expect(getDocById(version, 'API/api-end')).toMatchSnapshot();
  });
});

describe('site with partial autogenerated sidebars', () => {
  async function loadSite() {
    const siteDir = path.join(
      __dirname,
      '__fixtures__',
      'site-with-autogenerated-sidebar',
    );
    const context = await loadContext({siteDir});
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          path: 'docs',
          sidebarPath: path.join(
            __dirname,
            '__fixtures__',
            'site-with-autogenerated-sidebar',
            'partialAutogeneratedSidebars.js',
          ),
        },
      }),
    );

    const content = (await plugin.loadContent?.())!;

    return {content, siteDir};
  }

  it('sidebar is partially autogenerated', async () => {
    const {content} = await loadSite();
    const version = content.loadedVersions[0]!;

    expect(version.sidebars).toMatchSnapshot();
  });

  it('docs in partially generated sidebar have correct metadata', async () => {
    const {content} = await loadSite();
    const version = content.loadedVersions[0]!;

    // Only looking at the docs of the autogen sidebar, others metadata should
    // not be affected

    expect(getDocById(version, 'API/api-end')).toMatchSnapshot();
    expect(getDocById(version, 'API/api-overview')).toMatchSnapshot();
    expect(
      getDocById(version, 'API/Extension APIs/Plugin API'),
    ).toMatchSnapshot();
    expect(
      getDocById(version, 'API/Extension APIs/Theme API'),
    ).toMatchSnapshot();
  });
});

describe('site with partial autogenerated sidebars 2 (fix #4638)', () => {
  // Test added for edge case https://github.com/facebook/docusaurus/issues/4638

  async function loadSite() {
    const siteDir = path.join(
      __dirname,
      '__fixtures__',
      'site-with-autogenerated-sidebar',
    );
    const context = await loadContext({siteDir});
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          path: 'docs',
          sidebarPath: path.join(
            __dirname,
            '__fixtures__',
            'site-with-autogenerated-sidebar',
            'partialAutogeneratedSidebars2.js',
          ),
        },
      }),
    );

    const content = (await plugin.loadContent?.())!;

    return {content, siteDir};
  }

  it('sidebar is partially autogenerated', async () => {
    const {content} = await loadSite();
    const version = content.loadedVersions[0]!;

    expect(version.sidebars).toMatchSnapshot();
  });
});

describe('site with custom sidebar items generator', () => {
  async function loadSite(sidebarItemsGenerator: SidebarItemsGeneratorOption) {
    const siteDir = path.join(
      __dirname,
      '__fixtures__',
      'site-with-autogenerated-sidebar',
    );
    const context = await loadContext({siteDir});
    const plugin = await pluginContentDocs(
      context,
      validateOptions({
        validate: normalizePluginOptions as Validate<Options, PluginOptions>,
        options: {
          path: 'docs',
          sidebarItemsGenerator,
        },
      }),
    );
    const content = (await plugin.loadContent?.())!;
    return {content, siteDir};
  }

  it('sidebarItemsGenerator is called with appropriate data', async () => {
    const customSidebarItemsGeneratorMock = vi.fn(async () => []);
    const {siteDir} = await loadSite(customSidebarItemsGeneratorMock);

    const generatorArg = (
      customSidebarItemsGeneratorMock.mock
        .calls[0] as unknown as Parameters<SidebarItemsGeneratorOption>
    )[0];

    // Make test pass even if docs are in different order and paths are
    // absolutes
    function makeDeterministic(
      arg: Parameters<SidebarItemsGeneratorOption>[0],
    ): Parameters<SidebarItemsGeneratorOption>[0] {
      return {
        ...arg,
        docs: _.orderBy(arg.docs, 'id'),
        version: {
          ...arg.version,
          contentPath: path.relative(siteDir, arg.version.contentPath),
        },
      };
    }

    expect(makeDeterministic(generatorArg)).toMatchSnapshot();
    expect(generatorArg.defaultSidebarItemsGenerator).toEqual(
      DefaultSidebarItemsGenerator,
    );
  });

  it('sidebar is autogenerated according to a custom sidebarItemsGenerator', async () => {
    const customSidebarItemsGenerator: SidebarItemsGeneratorOption =
      async () => [
        {type: 'doc', id: 'API/api-overview'},
        {type: 'doc', id: 'API/api-end'},
      ];

    const {content} = await loadSite(customSidebarItemsGenerator);
    const version = content.loadedVersions[0];

    expect(version!.sidebars).toMatchSnapshot();
  });

  it('sidebarItemsGenerator can wrap/enhance/sort/reverse the default sidebar generator', async () => {
    function reverseSidebarItems(items: NormalizedSidebar): NormalizedSidebar {
      const result: NormalizedSidebar = items.map((item) => {
        if (item.type === 'category') {
          return {...item, items: reverseSidebarItems(item.items)};
        }
        return item;
      });
      result.reverse();
      return result;
    }

    const reversedSidebarItemsGenerator: SidebarItemsGeneratorOption = async ({
      defaultSidebarItemsGenerator,
      ...args
    }) => {
      const sidebarItems = await defaultSidebarItemsGenerator(args);
      return reverseSidebarItems(sidebarItems);
    };

    const {content} = await loadSite(reversedSidebarItemsGenerator);
    const version = content.loadedVersions[0]!;

    expect(version.sidebars).toMatchSnapshot();
  });
});
