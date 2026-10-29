/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import {createSlugger} from '@docusaurus/utils';
import {loadSidebars, DisabledSidebars} from '../index';
import {DefaultSidebarItemsGenerator} from '../generator';
import type {SidebarProcessorParams} from '../types';
import type {
  DocMetadata,
  VersionMetadata,
} from '@docusaurus/plugin-content-docs';

describe('loadSidebars', () => {
  const fixtureDir = path.join(__dirname, '__fixtures__', 'sidebars');
  const params: SidebarProcessorParams = {
    sidebarItemsGenerator: DefaultSidebarItemsGenerator,
    numberPrefixParser: (filename) => ({filename}),
    docs: [
      {
        source: '@site/docs/foo/bar.md',
        sourceDirName: 'foo',
        id: 'bar',
        frontMatter: {},
      },
    ] as DocMetadata[],
    drafts: [],
    version: {
      path: 'version',
      contentPath: path.join(fixtureDir, 'docs'),
      contentPathLocalized: path.join(fixtureDir, 'docs'),
    } as VersionMetadata,
    categoryLabelSlugger: {slug: (v) => v},
    sidebarOptions: {sidebarCollapsed: true, sidebarCollapsible: true},
  };
  it('sidebars with known sidebar item type', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars.json');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars with some draft items', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars.json');
    const paramsWithDrafts: SidebarProcessorParams = {
      ...params,
      drafts: [{id: 'foo/baz'} as DocMetadata, {id: 'hello'} as DocMetadata],
    };
    const result = await loadSidebars(sidebarPath, paramsWithDrafts);
    expect(result).toMatchSnapshot();
  });

  it('sidebars with deep level of category', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-category.js');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars shorthand and longhand lead to exact same sidebar', async () => {
    const sidebarPath1 = path.join(fixtureDir, 'sidebars-category.js');
    const sidebarPath2 = path.join(
      fixtureDir,
      'sidebars-category-shorthand.js',
    );
    const sidebar1 = await loadSidebars(sidebarPath1, params);
    const sidebar2 = await loadSidebars(sidebarPath2, params);
    expect(sidebar1).toEqual(sidebar2);
  });

  it('sidebars with category but category.items is not an array', async () => {
    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-category-wrong-items.json',
    );
    await expect(() =>
      loadSidebars(sidebarPath, params),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid sidebar items collection \`"doc1"\` in \`items\` of the category Category Label: it must either be an array of sidebar items or a shorthand notation (which doesn't contain a \`type\` property). See https://docusaurus.io/docs/sidebar/items for all valid syntaxes.]`,
    );
  });

  it('sidebars with first level not a category', async () => {
    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-first-level-not-category.js',
    );
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars link', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-link.json');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('nonexistent path', async () => {
    await expect(loadSidebars('bad/path', params)).resolves.toEqual(
      DisabledSidebars,
    );
  });

  it('undefined path', async () => {
    await expect(loadSidebars(undefined, params)).resolves.toMatchSnapshot();
  });

  it('literal false path', async () => {
    await expect(loadSidebars(false, params)).resolves.toEqual(
      DisabledSidebars,
    );
  });

  it('sidebars with category.collapsed property', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-collapsed.json');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars with category.collapsed property at first level', async () => {
    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-collapsed-first-level.json',
    );
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('loads sidebars with index-only categories', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-category-index.json');
    const result = await loadSidebars(sidebarPath, {
      ...params,
      docs: [
        {
          id: 'tutorials/tutorial-basics',
          source: '@site/docs/tutorials/tutorial-basics/index.md',
          sourceDirName: 'tutorials/tutorial-basics',
          frontMatter: {},
        },
      ] as DocMetadata[],
    });
    expect(result).toMatchSnapshot();
  });

  it('loads sidebars with interspersed draft items', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-drafts.json');
    const result = await loadSidebars(sidebarPath, {
      ...params,
      drafts: [{id: 'draft1'}, {id: 'draft2'}, {id: 'draft3'}] as DocMetadata[],
      categoryLabelSlugger: createSlugger(),
    });
    expect(result).toMatchSnapshot();
  });

  it('duplicate category metadata files', async () => {
    using warn = vi.spyOn(console, 'warn');
    using error = vi.spyOn(console, 'error');

    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-collapsed-first-level.json',
    );
    await expect(() =>
      loadSidebars(sidebarPath, {
        ...params,
        version: {
          contentPath: path.join(fixtureDir, 'invalid-docs'),
          contentPathLocalized: path.join(fixtureDir, 'invalid-docs'),
        } as VersionMetadata,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "foo" is not allowed]`,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /.*\[WARNING\].* There are more than one category metadata files for .*foo.*: foo\/_category_.json, foo\/_category_.yml. The behavior is undetermined./,
      ),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(
        /.*\[ERROR\].* The docs sidebar category metadata file .*foo\/_category_.json.* looks invalid!/,
      ),
    );
  });
});
