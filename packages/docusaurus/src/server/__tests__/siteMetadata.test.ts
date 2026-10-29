/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {DOCUSAURUS_VERSION} from '@docusaurus/utils';
import {loadPluginVersion, createSiteMetadata} from '../siteMetadata';
import type {LoadedPlugin} from '@docusaurus/types';

describe('loadPluginVersion', () => {
  it('detects external packages plugins versions', async () => {
    await expect(
      loadPluginVersion(
        path.join(__dirname, '__fixtures__/siteMetadata/dummy-plugin.js'),
        // Make the plugin appear external.
        path.join(__dirname, '..', '..', '..', '..', '..', '..', 'website'),
      ),
    ).resolves.toEqual({type: 'package', version: 'random-version'});
  });

  it('detects project plugins versions', async () => {
    await expect(
      loadPluginVersion(
        path.join(__dirname, '__fixtures__/siteMetadata/dummy-plugin.js'),
        // Make the plugin appear project local.
        path.join(__dirname, '__fixtures__/siteMetadata'),
      ),
    ).resolves.toEqual({type: 'project'});
  });

  it('detects local packages versions', async () => {
    await expect(loadPluginVersion('/', '/')).resolves.toEqual({type: 'local'});
  });
});

describe('createSiteMetadata', () => {
  it('throws if plugin versions mismatch', () => {
    expect(() =>
      createSiteMetadata({
        plugins: [
          {
            name: 'docusaurus-plugin-content-docs',
            version: {
              type: 'package',
              version: '1.0.0',
              name: '@docusaurus/plugin-content-docs',
            },
          },
        ] as LoadedPlugin[],
        siteVersion: 'some-random-version',
      }),
    ).toThrow(`Invalid name=docusaurus-plugin-content-docs version number=1.0.0.
All official @docusaurus/* packages should have the exact same version as @docusaurus/core (number=${DOCUSAURUS_VERSION}).
Maybe you want to check, or regenerate your yarn.lock or package-lock.json file?`);
  });
});
