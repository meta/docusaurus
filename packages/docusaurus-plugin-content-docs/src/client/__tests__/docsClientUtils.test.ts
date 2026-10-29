/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import _ from 'lodash';
import {fromPartial} from '@total-typescript/shoehorn';
import {
  getActivePlugin,
  getLatestVersion,
  getActiveDocContext,
  getActiveVersion,
  getDocVersionSuggestions,
} from '../docsClientUtils';
import type {
  GlobalPluginData,
  GlobalVersion,
  ActivePlugin,
  GlobalDoc,
} from '../index';

function globalVersion(partial: Partial<GlobalVersion>): GlobalVersion {
  return fromPartial<GlobalVersion>(partial);
}

function globalDoc(partial: Partial<GlobalDoc>): GlobalDoc {
  return fromPartial<GlobalDoc>(partial);
}

describe('docsClientUtils', () => {
  it('getActivePlugin', () => {
    const data: {[key: string]: GlobalPluginData} = {
      pluginIosId: {
        path: '/ios',
        versions: [],
        breadcrumbs: true,
      },
      pluginAndroidId: {
        path: '/android',
        versions: [],
        breadcrumbs: true,
      },
    };

    expect(getActivePlugin(data, '/')).toBeUndefined();
    expect(getActivePlugin(data, '/xyz')).toBeUndefined();

    expect(() =>
      getActivePlugin(data, '/', {failfast: true}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't find active docs plugin for "/" pathname, while it was expected to be found. Maybe you tried to use a docs feature that can only be used on a docs-related page? Existing docs plugin paths are: /ios, /android]`,
    );
    expect(() =>
      getActivePlugin(data, '/xyz', {failfast: true}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't find active docs plugin for "/xyz" pathname, while it was expected to be found. Maybe you tried to use a docs feature that can only be used on a docs-related page? Existing docs plugin paths are: /ios, /android]`,
    );

    const activePluginIos: ActivePlugin = {
      pluginId: 'pluginIosId',
      pluginData: data.pluginIosId!,
    };
    expect(getActivePlugin(data, '/ios')).toEqual(activePluginIos);
    expect(getActivePlugin(data, '/ios/')).toEqual(activePluginIos);
    expect(getActivePlugin(data, '/ios/abc/def')).toEqual(activePluginIos);

    const activePluginAndroid: ActivePlugin = {
      pluginId: 'pluginAndroidId',
      pluginData: data.pluginAndroidId!,
    };
    expect(getActivePlugin(data, '/android')).toEqual(activePluginAndroid);
    expect(getActivePlugin(data, '/android/')).toEqual(activePluginAndroid);
    expect(getActivePlugin(data, '/android/ijk')).toEqual(activePluginAndroid);

    // https://github.com/facebook/docusaurus/issues/6434
    const onePluginAtRoot: {[key: string]: GlobalPluginData} = {
      pluginIosId: {
        path: '/',
        versions: [],
        breadcrumbs: true,
      },
      pluginAndroidId: {
        path: '/android',
        versions: [],
        breadcrumbs: true,
      },
    };
    expect(getActivePlugin(onePluginAtRoot, '/android/foo')!.pluginId).toBe(
      'pluginAndroidId',
    );
    const onePluginAtRootReversed: {[key: string]: GlobalPluginData} = {
      pluginAndroidId: {
        path: '/android',
        versions: [],
        breadcrumbs: true,
      },
      pluginIosId: {
        path: '/',
        versions: [],
        breadcrumbs: true,
      },
    };
    expect(
      getActivePlugin(onePluginAtRootReversed, '/android/foo')!.pluginId,
    ).toBe('pluginAndroidId');
  });

  it('getLatestVersion', () => {
    const versions: GlobalVersion[] = [
      globalVersion({
        isLast: false,
      }),
      globalVersion({
        isLast: true,
      }),
      globalVersion({
        isLast: false,
      }),
    ];

    expect(
      getLatestVersion(
        fromPartial({
          versions,
        }),
      ),
    ).toEqual(versions[1]);
  });

  describe('getActiveVersion', () => {
    function testActiveVersion(versions: GlobalVersion[], path: string) {
      return getActiveVersion(fromPartial({versions}), path);
    }

    it('getActiveVersion for regular docs versions', () => {
      const versions: GlobalVersion[] = [
        globalVersion({
          name: 'next',
          path: '/docs/next',
        }),
        globalVersion({
          name: 'version2',
          path: '/docs',
        }),
        globalVersion({
          name: 'version1',
          path: '/docs/version1',
        }),
      ];

      expect(testActiveVersion(versions, '/someUnknownPath')).toBeUndefined();

      expect(testActiveVersion(versions, '/docs/next')?.name).toBe('next');
      expect(testActiveVersion(versions, '/docs/next/')?.name).toBe('next');
      expect(testActiveVersion(versions, '/docs/next/someDoc')?.name).toBe(
        'next',
      );

      expect(testActiveVersion(versions, '/docs')?.name).toBe('version2');
      expect(testActiveVersion(versions, '/docs/')?.name).toBe('version2');
      expect(testActiveVersion(versions, '/docs/someDoc')?.name).toBe(
        'version2',
      );

      expect(testActiveVersion(versions, '/docs/version1')?.name).toBe(
        'version1',
      );
      expect(testActiveVersion(versions, '/docs/version1/')?.name).toBe(
        'version1',
      );
      expect(testActiveVersion(versions, '/docs/version1/someDoc')?.name).toBe(
        'version1',
      );
    });

    it('getActiveVersion is not sensitive to version order', () => {
      const v1 = globalVersion({
        name: 'version1',
        path: '/docs',
      });
      const v2 = globalVersion({
        name: 'version2',
        path: '/docs/v2',
      });

      expect(testActiveVersion([v1, v2], '/docs')?.name).toBe('version1');
      expect(testActiveVersion([v2, v1], '/docs')?.name).toBe('version1');
      expect(testActiveVersion([v1, v2], '/docs/myDoc')?.name).toBe('version1');
      expect(testActiveVersion([v2, v1], '/docs/myDoc')?.name).toBe('version1');

      expect(testActiveVersion([v1, v2], '/docs/v2')?.name).toBe('version2');
      expect(testActiveVersion([v2, v1], '/docs/v2')?.name).toBe('version2');
      expect(testActiveVersion([v1, v2], '/docs/v2/myDoc')?.name).toBe(
        'version2',
      );
      expect(testActiveVersion([v2, v1], '/docs/v2/myDoc')?.name).toBe(
        'version2',
      );
    });

    it('getActiveVersion is not sensitive to isLast attribute', () => {
      const v1 = globalVersion({
        name: 'version1',
        path: '/docs',
        isLast: false,
      });
      const v2 = globalVersion({
        name: 'version2',
        path: '/docs/v2',
        isLast: false,
      });

      expect(testActiveVersion([v1, v2], '/docs')?.name).toBe('version1');
      expect(testActiveVersion([v1, v2], '/docs/v2')?.name).toBe('version2');

      expect(
        testActiveVersion([{...v1, isLast: true}, v2], '/docs')?.name,
      ).toBe('version1');
      expect(
        testActiveVersion([{...v1, isLast: true}, v2], '/docs/v2')?.name,
      ).toBe('version2');

      expect(
        testActiveVersion([v1, {...v2, isLast: true}], '/docs')?.name,
      ).toBe('version1');
      expect(
        testActiveVersion([v1, {...v2, isLast: true}], '/docs/v2')?.name,
      ).toBe('version2');
    });

    it('getActiveVersion matches first version when same paths', () => {
      const v1 = globalVersion({
        name: 'version1',
        path: '/docs',
      });
      const v2 = globalVersion({
        name: 'version2',
        path: '/docs',
      });

      expect(testActiveVersion([v1, v2], '/docs')?.name).toBe('version1');
      expect(testActiveVersion([v2, v1], '/docs')?.name).toBe('version2');
      expect(testActiveVersion([v1, v2], '/docs/myDoc')?.name).toBe('version1');
      expect(testActiveVersion([v2, v1], '/docs/myDoc')?.name).toBe('version2');
    });

    it('getActiveVersion without trailing slash', () => {
      const versions = [
        globalVersion({
          name: 'current',
          path: '/docs',
        }),
        globalVersion({
          name: 'version2',
          path: '/docs/version2',
        }),
        globalVersion({
          name: 'version1',
          path: '/docs/version1',
        }),
      ];

      expect(testActiveVersion(versions, '/docs')?.name).toBe('current');
    });

    it('getActiveVersion with trailing slash', () => {
      const versions = [
        globalVersion({
          name: 'current',
          path: '/docs/',
        }),
        globalVersion({
          name: 'version2',
          path: '/docs/version2/',
        }),
        globalVersion({
          name: 'version1',
          path: '/docs/version1/',
        }),
      ];

      expect(testActiveVersion(versions, '/docs')?.name).toBe('current');
    });

    it('getActiveVersion - docs only without trailing slash', () => {
      const versions = [
        globalVersion({
          name: 'current',
          path: '/',
        }),
        globalVersion({
          name: 'version2',
          path: '/version2',
        }),
        globalVersion({
          name: 'version1',
          path: '/version1',
        }),
      ];

      expect(testActiveVersion(versions, '/')?.name).toBe('current');
    });

    it('getActiveVersion - docs only with trailing slash', () => {
      const versions = [
        globalVersion({
          name: 'current',
          path: '/',
        }),
        globalVersion({
          name: 'version2',
          path: '/version2/',
        }),
        globalVersion({
          name: 'version1',
          path: '/version1/',
        }),
      ];

      expect(testActiveVersion(versions, '/')?.name).toBe('current');
    });
  });

  it('getActiveDocContext', () => {
    const versionNext: GlobalVersion = globalVersion({
      name: 'next',
      path: '/docs/next',
      docs: [
        globalDoc({
          id: 'doc1',
          path: '/docs/next/',
        }),
        globalDoc({
          id: 'doc2',
          path: '/docs/next/doc2',
        }),
      ],
    });

    const version2: GlobalVersion = globalVersion({
      name: 'version2',
      path: '/docs',
      docs: [
        globalDoc({
          id: 'doc1',
          path: '/docs/',
        }),
        globalDoc({
          id: 'doc2',
          path: '/docs/doc2',
        }),
      ],
    });

    const version1: GlobalVersion = globalVersion({
      name: 'version1',
      path: '/docs/version1',
      docs: [
        globalDoc({
          id: 'doc1',
          path: '/docs/version1/',
        }),
      ],
    });

    // Shuffle, because order shouldn't matter
    const versions: GlobalVersion[] = _.shuffle([
      versionNext,
      version2,
      version1,
    ]);

    const data: GlobalPluginData = {
      path: 'docs',
      versions,
      breadcrumbs: true,
    };

    expect(getActiveDocContext(data, '/doesNotExist')).toEqual({
      activeVersion: undefined,
      activeDoc: undefined,
      alternateDocVersions: {},
    });

    expect(getActiveDocContext(data, '/docs/next/doesNotExist')).toEqual({
      activeVersion: versionNext,
      activeDoc: undefined,
      alternateDocVersions: {},
    });

    expect(getActiveDocContext(data, '/docs/next')).toEqual({
      activeVersion: versionNext,
      activeDoc: versionNext.docs[0],
      alternateDocVersions: {
        next: versionNext.docs[0],
        version2: version2.docs[0],
        version1: version1.docs[0],
      },
    });
    expect(getActiveDocContext(data, '/docs/next/doc2')).toEqual({
      activeVersion: versionNext,
      activeDoc: versionNext.docs[1],
      alternateDocVersions: {
        next: versionNext.docs[1],
        version2: version2.docs[1],
        version1: undefined,
      },
    });

    expect(getActiveDocContext(data, '/docs/')).toEqual({
      activeVersion: version2,
      activeDoc: version2.docs[0],
      alternateDocVersions: {
        next: versionNext.docs[0],
        version2: version2.docs[0],
        version1: version1.docs[0],
      },
    });
    expect(getActiveDocContext(data, '/docs/doc2')).toEqual({
      activeVersion: version2,
      activeDoc: version2.docs[1],
      alternateDocVersions: {
        next: versionNext.docs[1],
        version2: version2.docs[1],
        version1: undefined,
      },
    });

    expect(getActiveDocContext(data, '/docs/version1')).toEqual({
      activeVersion: version1,
      activeDoc: version1.docs[0],
      alternateDocVersions: {
        next: versionNext.docs[0],
        version2: version2.docs[0],
        version1: version1.docs[0],
      },
    });
    expect(getActiveDocContext(data, '/docs/version1/doc2')).toEqual({
      activeVersion: version1,
      activeDoc: undefined,
      alternateDocVersions: {},
    });
  });

  it('getDocVersionSuggestions', () => {
    const versionNext: GlobalVersion = globalVersion({
      name: 'next',
      path: '/docs/next',
      docs: [
        globalDoc({
          id: 'doc1',
          path: '/docs/next/',
        }),
        globalDoc({
          id: 'doc2',
          path: '/docs/next/doc2',
        }),
      ],
    });

    const version2: GlobalVersion = globalVersion({
      name: 'version2',
      path: '/docs',
      isLast: true,
      docs: [
        globalDoc({
          id: 'doc1',
          path: '/docs/',
        }),
        globalDoc({
          id: 'doc2',
          path: '/docs/doc2',
        }),
      ],
    });

    const version1: GlobalVersion = globalVersion({
      name: 'version1',
      path: '/docs/version1',
      docs: [
        globalDoc({
          id: 'doc1',
          path: '/docs/version1/',
        }),
      ],
    });

    // Shuffle, because order shouldn't matter
    const versions: GlobalVersion[] = _.shuffle([
      versionNext,
      version2,
      version1,
    ]);

    const data: GlobalPluginData = {
      path: 'docs',
      versions,
      breadcrumbs: true,
    };

    expect(getDocVersionSuggestions(data, '/doesNotExist')).toEqual({
      latestDocSuggestion: undefined,
      latestVersionSuggestion: version2,
    });

    expect(getDocVersionSuggestions(data, '/docs/next')).toEqual({
      latestDocSuggestion: version2.docs[0],
      latestVersionSuggestion: version2,
    });
    expect(getDocVersionSuggestions(data, '/docs/next/doc2')).toEqual({
      latestDocSuggestion: version2.docs[1],
      latestVersionSuggestion: version2,
    });

    expect(getDocVersionSuggestions(data, '/docs/')).toEqual({
      latestDocSuggestion: version2.docs[0],
      latestVersionSuggestion: version2,
    });
    expect(getDocVersionSuggestions(data, '/docs/doc2')).toEqual({
      latestDocSuggestion: version2.docs[1],
      latestVersionSuggestion: version2,
    });

    expect(getDocVersionSuggestions(data, '/docs/version1/')).toEqual({
      latestDocSuggestion: version2.docs[0],
      latestVersionSuggestion: version2,
    });
    expect(getDocVersionSuggestions(data, '/docs/version1/doc2')).toEqual({
      latestDocSuggestion: undefined, // Because /docs/version1/doc2 does not exist
      latestVersionSuggestion: version2,
    });
  });
});
