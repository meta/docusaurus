/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {ensureUniquePluginInstanceIds} from '../pluginIds';
import type {InitializedPlugin} from '@docusaurus/types';

function createTestPlugin(name: string, id?: string) {
  return {
    name,
    options: {id: id ?? 'default'},
  } as InitializedPlugin;
}

describe('ensureUniquePluginInstanceIds', () => {
  it('accept single instance plugins', async () => {
    ensureUniquePluginInstanceIds([
      createTestPlugin('plugin-docs'),
      createTestPlugin('plugin-blog'),
      createTestPlugin('plugin-pages'),
    ]);
  });

  it('accept single instance plugins, all with sameId', async () => {
    ensureUniquePluginInstanceIds([
      createTestPlugin('plugin-docs', 'sameId'),
      createTestPlugin('plugin-blog', 'sameId'),
      createTestPlugin('plugin-pages', 'sameId'),
    ]);
  });

  it('accept multi instance plugins without id', async () => {
    ensureUniquePluginInstanceIds([
      createTestPlugin('plugin-docs', 'ios'),
      createTestPlugin('plugin-docs', 'android'),
      createTestPlugin('plugin-pages', 'pages'),
    ]);
  });

  it('reject multi instance plugins without id', async () => {
    expect(() =>
      ensureUniquePluginInstanceIds([
        createTestPlugin('plugin-docs'),
        createTestPlugin('plugin-docs'),
      ]),
    ).toThrowErrorMatchingSnapshot();
  });

  it('reject multi instance plugins with same id', async () => {
    expect(() =>
      ensureUniquePluginInstanceIds([
        createTestPlugin('plugin-docs', 'sameId'),
        createTestPlugin('plugin-docs', 'sameId'),
      ]),
    ).toThrowErrorMatchingSnapshot();
  });

  it('reject multi instance plugins with some without id', async () => {
    expect(() =>
      ensureUniquePluginInstanceIds([
        createTestPlugin('plugin-docs'),
        createTestPlugin('plugin-docs', 'ios'),
        createTestPlugin('plugin-docs'),
        createTestPlugin('plugin-pages'),
        createTestPlugin('plugin-pages', 'pages2'),
      ]),
    ).toThrowErrorMatchingSnapshot();
  });
});
