/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {fromPartial} from '@total-typescript/shoehorn';
import {collectAllSiteMessages} from '../siteMessages';
import type {DocusaurusConfig} from '@docusaurus/types';

function siteDirFixture(name: string) {
  return path.resolve(__dirname, '__fixtures__', 'siteMessages', name);
}

describe('collectAllSiteMessages', () => {
  async function getMessagesFor({
    siteDir,
    webpack,
  }: {
    siteDir: string;
    webpack?: DocusaurusConfig['webpack'];
  }) {
    return collectAllSiteMessages(
      fromPartial({
        site: {
          props: {
            siteDir,
            siteConfig: {webpack},
          },
        },
      }),
    );
  }

  describe('uselessBabelConfigMessages', () => {
    it('warns for useless babel config file when using Rspack', async () => {
      const messages = await getMessagesFor({
        siteDir: siteDirFixture('siteWithBabelConfigFile'),
      });
      expect(messages).toMatchInlineSnapshot(`
              [
                {
                  "message": "Your site is using the SWC js loader. You can safely remove the Babel config file at \`packages/docusaurus/src/server/__tests__/__fixtures__/siteMessages/siteWithBabelConfigFile/babel.config.js\`.",
                  "type": "warning",
                },
              ]
          `);
    });

    it('does not warn for babel config file when using Webpack', async () => {
      const messages = await getMessagesFor({
        siteDir: siteDirFixture('siteWithBabelConfigFile'),
        webpack: {},
      });
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Babel config file'),
        }),
      );
    });
  });

  describe('webpackDeprecationMessages', () => {
    it('does not warn when using Rspack', async () => {
      const messages = await getMessagesFor({
        siteDir: siteDirFixture('siteWithoutBabelConfigFile'),
      });
      expect(messages).toEqual([]);
    });

    it('warns when using Webpack', async () => {
      const messages = await getMessagesFor({
        siteDir: siteDirFixture('siteWithoutBabelConfigFile'),
        webpack: {jsLoader: 'babel'},
      });
      expect(messages).toMatchInlineSnapshot(`
        [
          {
            "message": "Your site uses Webpack and Babel through \`siteConfig.webpack\`. This is deprecated: Docusaurus now uses Rspack by default, and Webpack/Babel support will be removed in Docusaurus v5. Please remove \`siteConfig.webpack\` to use Rspack.",
            "type": "warning",
          },
        ]
      `);
    });
  });
});
