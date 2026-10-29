/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import {tree} from 'tree-node-cli';
import {posixPath} from '@docusaurus/utils';
import {eject, wrap} from '../actions';
import {ThemePath, Components, createTempSiteDir} from './testUtils';
import type {SwizzleAction} from '@docusaurus/types';

// Use relative paths and sort files for tests
function stableCreatedFiles(
  siteThemePath: string,
  createdFiles: string[],
): string[] {
  return createdFiles
    .map((file) => posixPath(path.relative(siteThemePath, file)))
    .sort();
}

describe('eject', () => {
  async function testEject(
    action: SwizzleAction,
    componentName: string,
    {typescript}: {typescript: boolean} = {typescript: true},
  ) {
    const siteDir = await createTempSiteDir();
    const siteThemePath = path.join(siteDir, 'src/theme');
    const result = await eject({
      siteDir,
      componentName,
      themePath: ThemePath,
      typescript,
    });
    return {
      siteDir,
      siteThemePath,
      createdFiles: stableCreatedFiles(siteThemePath, result.createdFiles),
      tree: tree(siteThemePath),
    };
  }

  it(`eject ${Components.FirstLevelComponent}`, async () => {
    const result = await testEject('eject', Components.FirstLevelComponent);
    expect(result.createdFiles).toEqual([
      'FirstLevelComponent.css',
      'FirstLevelComponent.tsx',
    ]);
    expect(result.tree).toMatchInlineSnapshot(`
      "theme
      ├── FirstLevelComponent.css
      └── FirstLevelComponent.tsx"
    `);
  });

  it(`eject ${Components.JsComponent} JS`, async () => {
    const result = await testEject('eject', Components.JsComponent, {
      typescript: false,
    });
    expect(result.createdFiles).toEqual([
      'JsComponent/index.css',
      'JsComponent/index.js',
    ]);
    expect(result.tree).toMatchInlineSnapshot(`
      "theme
      └── JsComponent
          ├── index.css
          └── index.js"
    `);
  });

  it(`eject ${Components.ComponentInSubFolder}`, async () => {
    const result = await testEject('eject', Components.ComponentInSubFolder);
    expect(result.createdFiles).toEqual([
      'ComponentInFolder/ComponentInSubFolder/index.css',
      'ComponentInFolder/ComponentInSubFolder/index.tsx',
      'ComponentInFolder/ComponentInSubFolder/styles.css',
      'ComponentInFolder/ComponentInSubFolder/styles.module.css',
    ]);
    expect(result.tree).toMatchInlineSnapshot(`
      "theme
      └── ComponentInFolder
          └── ComponentInSubFolder
              ├── index.css
              ├── index.tsx
              ├── styles.css
              └── styles.module.css"
    `);
  });

  it(`eject ${Components.Sibling}`, async () => {
    const result = await testEject('eject', Components.Sibling);
    expect(result.createdFiles).toEqual([
      'ComponentInFolder/Sibling.css',
      'ComponentInFolder/Sibling.tsx',
    ]);
    expect(result.tree).toMatchInlineSnapshot(`
      "theme
      └── ComponentInFolder
          ├── Sibling.css
          └── Sibling.tsx"
    `);
  });

  it(`eject ${Components.ComponentInFolder}`, async () => {
    const result = await testEject('eject', Components.ComponentInFolder);
    expect(result.createdFiles).toEqual([
      'ComponentInFolder/ComponentInSubFolder/index.css',
      'ComponentInFolder/ComponentInSubFolder/index.tsx',
      'ComponentInFolder/ComponentInSubFolder/styles.css',
      'ComponentInFolder/ComponentInSubFolder/styles.module.css',
      'ComponentInFolder/Sibling.css',
      'ComponentInFolder/Sibling.tsx',
      'ComponentInFolder/index.css',
      'ComponentInFolder/index.tsx',
    ]);
    expect(result.tree).toMatchInlineSnapshot(`
      "theme
      └── ComponentInFolder
          ├── ComponentInSubFolder
          │   ├── index.css
          │   ├── index.tsx
          │   ├── styles.css
          │   └── styles.module.css
          ├── Sibling.css
          ├── Sibling.tsx
          ├── index.css
          └── index.tsx"
    `);
  });
});

describe('wrap', () => {
  async function testWrap(
    action: SwizzleAction,
    componentName: string,
    {typescript}: {typescript: boolean} = {typescript: false},
  ) {
    const siteDir = await createTempSiteDir();
    const siteThemePath = path.join(siteDir, 'src/theme');
    const result = await wrap({
      siteDir,
      componentName,
      themePath: ThemePath,
      typescript,
    });
    return {
      siteDir,
      siteThemePath,
      createdFiles: stableCreatedFiles(siteThemePath, result.createdFiles),
      firstFileContent: () => fs.readFile(result.createdFiles[0]!, 'utf8'),
      tree: tree(siteThemePath),
    };
  }

  describe('JavaScript', () => {
    async function doWrap(componentName: string) {
      return testWrap('wrap', componentName, {
        typescript: false,
      });
    }

    it(`wrap ${Components.FirstLevelComponent}`, async () => {
      const result = await doWrap(Components.FirstLevelComponent);
      expect(result.createdFiles).toEqual(['FirstLevelComponent.js']);
      expect(result.tree).toMatchInlineSnapshot(`
              "theme
              └── FirstLevelComponent.js"
          `);
      await expect(result.firstFileContent()).resolves.toMatchSnapshot();
    });

    it(`wrap ${Components.ComponentInSubFolder}`, async () => {
      const result = await doWrap(Components.ComponentInSubFolder);
      expect(result.createdFiles).toEqual([
        'ComponentInFolder/ComponentInSubFolder/index.js',
      ]);
      expect(result.tree).toMatchInlineSnapshot(`
              "theme
              └── ComponentInFolder
                  └── ComponentInSubFolder
                      └── index.js"
          `);
      await expect(result.firstFileContent()).resolves.toMatchSnapshot();
    });

    it(`wrap ${Components.ComponentInFolder}`, async () => {
      const result = await doWrap(Components.ComponentInFolder);
      expect(result.createdFiles).toEqual(['ComponentInFolder/index.js']);
      expect(result.tree).toMatchInlineSnapshot(`
              "theme
              └── ComponentInFolder
                  └── index.js"
          `);
      await expect(result.firstFileContent()).resolves.toMatchSnapshot();
    });
  });

  describe('TypeScript', () => {
    async function doWrap(componentName: string) {
      return testWrap('wrap', componentName, {
        typescript: true,
      });
    }

    it(`wrap ${Components.FirstLevelComponent}`, async () => {
      const result = await doWrap(Components.FirstLevelComponent);
      expect(result.createdFiles).toEqual(['FirstLevelComponent.tsx']);
      expect(result.tree).toMatchInlineSnapshot(`
              "theme
              └── FirstLevelComponent.tsx"
          `);
      await expect(result.firstFileContent()).resolves.toMatchSnapshot();
    });

    it(`wrap ${Components.ComponentInSubFolder}`, async () => {
      const result = await doWrap(Components.ComponentInSubFolder);
      expect(result.createdFiles).toEqual([
        'ComponentInFolder/ComponentInSubFolder/index.tsx',
      ]);
      expect(result.tree).toMatchInlineSnapshot(`
              "theme
              └── ComponentInFolder
                  └── ComponentInSubFolder
                      └── index.tsx"
          `);
      await expect(result.firstFileContent()).resolves.toMatchSnapshot();
    });

    it(`wrap ${Components.ComponentInFolder}`, async () => {
      const result = await doWrap(Components.ComponentInFolder);
      expect(result.createdFiles).toEqual(['ComponentInFolder/index.tsx']);
      expect(result.tree).toMatchInlineSnapshot(`
              "theme
              └── ComponentInFolder
                  └── index.tsx"
          `);
      await expect(result.firstFileContent()).resolves.toMatchSnapshot();
    });
  });
});
