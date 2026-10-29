/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {createSiteStorage} from '../storage';
import {DEFAULT_STORAGE_CONFIG} from '../configValidation';
import type {StorageConfig, SiteStorage} from '@docusaurus/types';

function test({
  url = 'https://docusaurus.io',
  baseUrl = '/',
  storage = {},
}: {
  url?: string;
  baseUrl?: string;
  storage?: Partial<StorageConfig>;
}): SiteStorage {
  return createSiteStorage({
    url,
    baseUrl,
    storage: {
      ...DEFAULT_STORAGE_CONFIG,
      ...storage,
    },
  });
}

// Storage is namespaced by default, from url + baseUrl
// https://docusaurus.io/ => -189
const DefaultSiteStorage: SiteStorage = {
  type: 'localStorage',
  namespace: '-189',
};

describe('storage', () => {
  it('default', () => {
    expect(test({})).toEqual(DefaultSiteStorage);
  });

  describe('type', () => {
    it('localStorage', () => {
      expect(test({storage: {type: 'localStorage'}})).toEqual({
        ...DefaultSiteStorage,
        type: 'localStorage',
      });
    });

    it('sessionStorage', () => {
      expect(test({storage: {type: 'sessionStorage'}})).toEqual({
        ...DefaultSiteStorage,
        type: 'sessionStorage',
      });
    });
  });

  describe('namespace', () => {
    describe('true', () => {
      function testAutomaticNamespace(
        {
          url,
          baseUrl,
        }: {
          url: string;
          baseUrl: string;
        },
        expectedNamespace: string,
      ) {
        return expect(test({url, baseUrl, storage: {namespace: true}})).toEqual(
          expect.objectContaining({namespace: expectedNamespace}),
        );
      }

      it('automatic namespace - https://docusaurus.io/', () => {
        testAutomaticNamespace(
          {
            url: 'https://docusaurus.io',
            baseUrl: '/',
          },
          '-189',
        );
      });

      it('automatic namespace - https://docusaurus.io/baseUrl/', () => {
        testAutomaticNamespace(
          {
            url: 'https://docusaurus.io',
            baseUrl: '/baseUrl/',
          },
          '-b21',
        );
      });

      it('automatic namespace - https://example.com/', () => {
        testAutomaticNamespace(
          {
            url: 'https://example.com',
            baseUrl: '/',
          },
          '-182',
        );
      });

      it('automatic namespace - https://example.com/baseUrl/', () => {
        testAutomaticNamespace(
          {
            url: 'https://example.com',
            baseUrl: '/baseUrl/',
          },
          '-ad6',
        );
      });

      it('automatic namespace - is not slash sensitive', () => {
        const expectedNamespace = '-b21';
        testAutomaticNamespace(
          {
            url: 'https://docusaurus.io',
            baseUrl: '/baseUrl/',
          },
          expectedNamespace,
        );
        testAutomaticNamespace(
          {
            url: 'https://docusaurus.io/',
            baseUrl: '/baseUrl/',
          },
          expectedNamespace,
        );
        testAutomaticNamespace(
          {
            url: 'https://docusaurus.io/',
            baseUrl: '/baseUrl',
          },
          expectedNamespace,
        );
        testAutomaticNamespace(
          {
            url: 'https://docusaurus.io',
            baseUrl: 'baseUrl',
          },
          expectedNamespace,
        );
      });
    });

    it('false', () => {
      expect(test({storage: {namespace: false}})).toEqual({
        ...DefaultSiteStorage,
        namespace: '',
      });
    });

    it('string', () => {
      expect(test({storage: {namespace: 'my-namespace'}})).toEqual({
        ...DefaultSiteStorage,
        namespace: '-my-namespace',
      });
    });
  });
});
