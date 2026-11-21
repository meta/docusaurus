/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import vm from 'node:vm';
import {describe, expect, it} from 'vitest';
import {
  getThemeInlineScript,
  getAnnouncementBarInlineScript,
} from '../inlineScripts';

describe('inlineScripts', () => {
  it('inline javascript for default options', () => {
    expect(
      getThemeInlineScript({
        colorMode: {
          disableSwitch: false,
          defaultMode: 'light',
          respectPrefersColorScheme: true,
        },
        siteStorage: {
          type: 'localStorage',
          namespace: '',
        },
      }),
    ).toMatchSnapshot();
  });

  it('inline javascript for default mode and no switch', () => {
    expect(
      getThemeInlineScript({
        colorMode: {
          disableSwitch: true,
          defaultMode: 'light',
          respectPrefersColorScheme: false,
        },
        siteStorage: {
          type: 'localStorage',
          namespace: '',
        },
      }),
    ).toMatchSnapshot();
  });

  describe('getAnnouncementBarInlineScript', () => {
    function runScript({
      id,
      namespace = '',
      storage,
    }: {
      id: string;
      namespace?: string;
      storage: Record<string, string>;
    }) {
      const script = getAnnouncementBarInlineScript({
        announcementBar: {
          id,
          content: 'Hello',
          isCloseable: true,
        },
        siteStorage: {
          type: 'localStorage',
          namespace,
        },
      });
      const attrs: Record<string, unknown> = {};
      vm.runInNewContext(script, {
        localStorage: {
          getItem: (key: string) => storage[key] ?? null,
        },
        document: {
          documentElement: {
            setAttribute: (name: string, value: unknown) => {
              attrs[name] = String(value);
            },
          },
        },
      });
      return attrs['data-announcement-bar-initially-dismissed'];
    }

    it('marks bar dismissed when stored id matches current id', () => {
      expect(
        runScript({
          id: 'announcement-1',
          storage: {
            'docusaurus.announcement.dismiss': 'true',
            'docusaurus.announcement.id': 'announcement-1',
          },
        }),
      ).toBe('true');
    });

    it('does not mark bar dismissed when announcement id changed', () => {
      expect(
        runScript({
          id: 'announcement-2',
          storage: {
            'docusaurus.announcement.dismiss': 'true',
            'docusaurus.announcement.id': 'announcement-1',
          },
        }),
      ).toBe('false');
    });

    it('respects siteStorage namespace and escapes special characters in id', () => {
      expect(
        runScript({
          id: "bob's-</script>-banner",
          namespace: '-site',
          storage: {
            'docusaurus.announcement.dismiss-site': 'true',
            'docusaurus.announcement.id-site': "bob's-</script>-banner",
          },
        }),
      ).toBe('true');
    });
  });
});
