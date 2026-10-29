/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getAllClientModules} from '../clientModules';
import type {LoadedPlugin} from '@docusaurus/types';

const pluginEmpty = {
  name: 'plugin-empty',
  path: __dirname,
} as LoadedPlugin;

const pluginFooBar = {
  name: 'plugin-foo-bar',
  path: __dirname,
  getClientModules() {
    return ['foo', 'bar'];
  },
} as LoadedPlugin;

const pluginHelloWorld = {
  plugin: 'plugin-hello-world',
  path: __dirname,
  getClientModules() {
    return [
      // Absolute path
      '/hello',
      'world',
    ];
  },
} as unknown as LoadedPlugin;

describe('getAllClientModules', () => {
  it('loads an empty plugin', () => {
    const clientModules = getAllClientModules([pluginEmpty]);
    expect(clientModules).toMatchInlineSnapshot(`[]`);
  });

  it('loads a non-empty plugin', () => {
    const clientModules = getAllClientModules([pluginFooBar]);
    expect(clientModules).toMatchInlineSnapshot(`
      [
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/foo",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/bar",
      ]
    `);
  });

  it('loads multiple non-empty plugins', () => {
    const clientModules = getAllClientModules([pluginFooBar, pluginHelloWorld]);
    expect(clientModules).toMatchInlineSnapshot(`
      [
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/foo",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/bar",
        "/hello",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/world",
      ]
    `);
  });

  it('loads multiple non-empty plugins in different order', () => {
    const clientModules = getAllClientModules([pluginHelloWorld, pluginFooBar]);
    expect(clientModules).toMatchInlineSnapshot(`
      [
        "/hello",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/world",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/foo",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/bar",
      ]
    `);
  });

  it('loads both empty and non-empty plugins', () => {
    const clientModules = getAllClientModules([
      pluginHelloWorld,
      pluginEmpty,
      pluginFooBar,
    ]);
    expect(clientModules).toMatchInlineSnapshot(`
      [
        "/hello",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/world",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/foo",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/bar",
      ]
    `);
  });

  it('loads empty and non-empty in a different order', () => {
    const clientModules = getAllClientModules([
      pluginHelloWorld,
      pluginFooBar,
      pluginEmpty,
    ]);
    expect(clientModules).toMatchInlineSnapshot(`
      [
        "/hello",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/world",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/foo",
        "<PROJECT_ROOT>/packages/docusaurus/src/server/__tests__/bar",
      ]
    `);
  });
});
