/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';

import {loadContext, type LoadContextParams} from '../../site';
import {initPlugins} from '../init';

async function loadSite(
  fixtureName: string,
  options: Omit<LoadContextParams, 'siteDir'> = {},
) {
  const siteDir = path.join(__dirname, '__fixtures__', fixtureName);
  const context = await loadContext({...options, siteDir});
  const plugins = await initPlugins(context);

  return {siteDir, context, plugins};
}

describe('initPlugins', () => {
  it('parses plugins correctly and loads them in correct order', async () => {
    const {context, plugins} = await loadSite('site-with-plugin');
    expect(context.siteConfig.plugins).toHaveLength(7);
    expect(plugins).toHaveLength(10);

    expect(plugins[0]!.name).toBe('preset-plugin1');
    expect(plugins[1]!.name).toBe('preset-plugin2');
    expect(plugins[2]!.name).toBe('preset-theme1');
    expect(plugins[3]!.name).toBe('preset-theme2');
    expect(plugins[4]!.name).toBe('first-plugin');
    expect(plugins[5]!.name).toBe('second-plugin');
    expect(plugins[6]!.name).toBe('third-plugin');
    expect(plugins[7]!.name).toBe('fourth-plugin');
    expect(context.siteConfig.themeConfig).toEqual({
      a: 1,
      esmPlugin: {
        joi: true,
      },
      tsPlugin: {
        joi: true,
      },
    });
  });

  it('throws user-friendly error message for plugins with bad values', async () => {
    await expect(() =>
      loadSite('site-with-plugin', {config: 'badPlugins.docusaurus.config.js'}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error:  => Bad Docusaurus plugin value plugins[0].
      Example valid plugin config:
      {
        plugins: [
          ["@docusaurus/plugin-content-docs",options],
          "./myPlugin",
          ["./myPlugin",{someOption: 42}],
          function myPlugin() { },
          [function myPlugin() { },options]
        ],
      };

       => Bad Docusaurus plugin value plugins[1].
      Example valid plugin config:
      {
        plugins: [
          ["@docusaurus/plugin-content-docs",options],
          "./myPlugin",
          ["./myPlugin",{someOption: 42}],
          function myPlugin() { },
          [function myPlugin() { },options]
        ],
      };

      ]
    `);
  });

  it('throws user-friendly error message for plugins with no name', async () => {
    await expect(() => loadSite('site-with-unnamed-plugin')).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: A Docusaurus plugin is missing a 'name' property.
      Note that even inline/anonymous plugin functions require a 'name' property.]
    `);
  });

  it('throws user-friendly error message for plugins returning undefined', async () => {
    await expect(() => loadSite('site-with-undefined-plugin')).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: A Docusaurus plugin returned 'undefined', which is forbidden.
      A plugin is expected to return an object having at least a 'name' property.
      If you want a plugin to self-disable depending on context/options, you can explicitly return 'null' instead of 'undefined']
    `);
  });
});
