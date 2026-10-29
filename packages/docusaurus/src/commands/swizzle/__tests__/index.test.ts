/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import {tree} from 'tree-node-cli';
import {escapePath, posixPath} from '@docusaurus/utils';
import {glob} from '@docusaurus/glob';
import {ThemePath, createTempSiteDir, Components} from './testUtils';
import {swizzle} from '../index';

const FixtureThemeName = 'fixture-theme-name';

// TODO is it really worth it to duplicate fixtures?
const ThemePathJS = ThemePath;
const ThemePathTS = ThemePath;

async function createTestSiteConfig(siteDir: string) {
  const configPath = path.join(siteDir, 'docusaurus.config.js');

  await fs.writeFile(
    configPath,
    `
module.exports = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',
  themes: [
    function fixtureTheme() {
      return {
        name: '${FixtureThemeName}',
        getThemePath() {
          return '${escapePath(ThemePathJS)}';
        },
        getTypeScriptThemePath() {
          return '${escapePath(ThemePathTS)}';
        },
      };
    },
  ],
}`,
  );
}

function createExitMock(expectedExitCode: number = 0) {
  const mock = vi
    .spyOn(process, 'exit')
    .mockImplementation((() => {}) as () => never);

  return {
    [Symbol.dispose]: () => {
      expect(mock).toHaveBeenCalledExactlyOnceWith(expectedExitCode);
      mock.mockRestore();
    },
  };
}

async function createTestSite() {
  const siteDir = await createTempSiteDir();

  await createTestSiteConfig(siteDir);

  const siteThemePath = path.join(siteDir, 'src/theme');
  await fs.mkdir(siteThemePath, {recursive: true});

  async function snapshotThemeDir() {
    const siteThemePathPosix = posixPath(siteThemePath);
    expect(tree(siteThemePathPosix)).toMatchSnapshot('theme dir tree');

    const files = await glob('**/*', {cwd: siteThemePath});

    for (const file of files) {
      const fileContent = await fs.readFile(
        path.join(siteThemePath, file),
        'utf-8',
      );
      expect(fileContent).toMatchSnapshot(file);
    }
  }

  function testWrap({
    component,
    typescript,
  }: {
    component: string;
    typescript?: boolean;
  }) {
    return swizzle(FixtureThemeName, component, siteDir, {
      wrap: true,
      danger: true,
      typescript,
      javascript: !typescript,
    });
  }

  function testEject({
    component,
    typescript,
  }: {
    component: string;
    typescript?: boolean;
  }) {
    return swizzle(FixtureThemeName, component, siteDir, {
      eject: true,
      danger: true,
      typescript,
      javascript: !typescript,
    });
  }

  return {
    siteDir,
    siteThemePath,
    snapshotThemeDir,
    testWrap,
    testEject,
  };
}

describe('swizzle wrap', () => {
  it(`${Components.FirstLevelComponent} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.FirstLevelComponent,
    });
    await snapshotThemeDir();
  });

  it(`${Components.FirstLevelComponent} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.FirstLevelComponent,
      typescript: true,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInFolder} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.ComponentInFolder,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInFolder} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.ComponentInFolder,
      typescript: true,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInSubFolder} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.ComponentInSubFolder,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInSubFolder} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.ComponentInSubFolder,
      typescript: true,
    });
    await snapshotThemeDir();
  });

  it(`${Components.Sibling} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.Sibling,
    });
    await snapshotThemeDir();
  });

  it(`${Components.Sibling} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testWrap} = await createTestSite();
    await testWrap({
      component: Components.Sibling,
      typescript: true,
    });
    await snapshotThemeDir();
  });
});

describe('swizzle eject', () => {
  it(`${Components.FirstLevelComponent} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.FirstLevelComponent,
    });
    await snapshotThemeDir();
  });

  it(`${Components.FirstLevelComponent} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.FirstLevelComponent,
      typescript: true,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInFolder} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.ComponentInFolder,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInFolder} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.ComponentInFolder,
      typescript: true,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInSubFolder} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.ComponentInSubFolder,
    });
    await snapshotThemeDir();
  });

  it(`${Components.ComponentInSubFolder} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.ComponentInSubFolder,
      typescript: true,
    });
    await snapshotThemeDir();
  });

  it(`${Components.Sibling} JS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.Sibling,
    });
    await snapshotThemeDir();
  });

  it(`${Components.Sibling} TS`, async () => {
    using _exitMock = createExitMock();
    const {snapshotThemeDir, testEject} = await createTestSite();
    await testEject({
      component: Components.Sibling,
      typescript: true,
    });
    await snapshotThemeDir();
  });
});
