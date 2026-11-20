/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  getThemeInlineScript,
  getAnnouncementBarInlineScript,
} from '../inlineScripts';

function runInlineScript(
  script: string,
  initialLocalStorage: Record<string, string> = {},
) {
  const store = {...initialLocalStorage};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  };
  let attributeValue: string | null = null;
  const mockDocument = {
    documentElement: {
      setAttribute: (name: string, value: string) => {
        if (name === 'data-announcement-bar-initially-dismissed') {
          attributeValue = String(value);
        }
      },
    },
  };

  const fn = new Function('localStorage', 'document', script);
  fn(mockLocalStorage, mockDocument);
  return attributeValue;
}

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
    it('sets attribute to false when no announcement has been dismissed', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {
          id: 'announcement-1',
          content: 'Hello',
          backgroundColor: '#fff',
          textColor: '#000',
          isCloseable: true,
        },
      });

      expect(runInlineScript(script, {})).toBe('false');
    });

    it('sets attribute to true when the same announcement was dismissed', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {
          id: 'announcement-1',
          content: 'Hello',
          backgroundColor: '#fff',
          textColor: '#000',
          isCloseable: true,
        },
      });

      expect(
        runInlineScript(script, {
          'docusaurus.announcement.id': 'announcement-1',
          'docusaurus.announcement.dismiss': 'true',
        }),
      ).toBe('true');
    });

    it('sets attribute to false on first load when announcement id has changed', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {
          id: 'announcement-2',
          content: 'New Announcement',
          backgroundColor: '#fff',
          textColor: '#000',
          isCloseable: true,
        },
      });

      // User previously dismissed announcement-1
      expect(
        runInlineScript(script, {
          'docusaurus.announcement.id': 'announcement-1',
          'docusaurus.announcement.dismiss': 'true',
        }),
      ).toBe('false');
    });

    it('respects siteStorage namespace', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: '.my-site'},
        announcementBar: {
          id: 'announcement-1',
          content: 'Hello',
          backgroundColor: '#fff',
          textColor: '#000',
          isCloseable: true,
        },
      });

      expect(
        runInlineScript(script, {
          'docusaurus.announcement.id.my-site': 'announcement-1',
          'docusaurus.announcement.dismiss.my-site': 'true',
        }),
      ).toBe('true');

      // Dismissed in different namespace should not affect it
      expect(
        runInlineScript(script, {
          'docusaurus.announcement.id': 'announcement-1',
          'docusaurus.announcement.dismiss': 'true',
        }),
      ).toBe('false');
    });

    it('escapes less-than characters to prevent script tag injection', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {
          id: 'release-</script><script>alert(1)</script>',
          content: 'Hello',
          backgroundColor: '#fff',
          textColor: '#000',
          isCloseable: true,
        },
      });

      expect(script).not.toContain('</script>');
      expect(script).toContain('\\u003c/script>');

      // Verifies correct execution when matching stored id
      expect(
        runInlineScript(script, {
          'docusaurus.announcement.id':
            'release-</script><script>alert(1)</script>',
          'docusaurus.announcement.dismiss': 'true',
        }),
      ).toBe('true');
    });
  });
});
