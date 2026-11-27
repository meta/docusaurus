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
    it('generates inline script with default announcement id and namespace', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {
          type: 'localStorage',
          namespace: '',
        },
      });
      expect(script).toContain(
        'localStorage.getItem(\'docusaurus.announcement.id\') !== "announcement-bar"',
      );
      expect(script).toContain(
        "localStorage.getItem('docusaurus.announcement.dismiss') === 'true'",
      );
      expect(script).toContain(
        "document.documentElement.setAttribute('data-announcement-bar-initially-dismissed', isDismissed())",
      );
    });

    it('generates inline script with custom announcement id and custom namespace', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {
          type: 'localStorage',
          namespace: '.custom-namespace',
        },
        announcementBar: {
          id: 'announcement-v2',
        },
      });
      expect(script).toContain(
        'localStorage.getItem(\'docusaurus.announcement.id.custom-namespace\') !== "announcement-v2"',
      );
      expect(script).toContain(
        "localStorage.getItem('docusaurus.announcement.dismiss.custom-namespace') === 'true'",
      );
    });

    it('evaluates to false when a new announcement id differs from dismissed one', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {
          type: 'localStorage',
          namespace: '',
        },
        announcementBar: {
          id: 'announcement-v2',
        },
      });

      const store = new Map<string, string>();
      const mockLocalStorage = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      };
      let attributeValue = '';
      const mockDocument = {
        documentElement: {
          setAttribute: (_name: string, value: string | boolean) => {
            attributeValue = String(value);
          },
        },
      };

      const fn = new Function('localStorage', 'document', script);

      // Simulate a user who dismissed announcement-v1
      mockLocalStorage.setItem('docusaurus.announcement.id', 'announcement-v1');
      mockLocalStorage.setItem('docusaurus.announcement.dismiss', 'true');

      fn(mockLocalStorage, mockDocument);
      expect(attributeValue).toBe('false');

      // Simulate missing stored announcement ID while dismissal flag is true
      store.delete('docusaurus.announcement.id');
      fn(mockLocalStorage, mockDocument);
      expect(attributeValue).toBe('false');

      // Simulate when user has dismissed current announcement-v2
      mockLocalStorage.setItem('docusaurus.announcement.id', 'announcement-v2');

      fn(mockLocalStorage, mockDocument);
      expect(attributeValue).toBe('true');
    });

    it('escapes closing script tags in announcement id', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {
          type: 'localStorage',
          namespace: '',
        },
        announcementBar: {
          id: 'x</script><script>alert(1)</script>',
        },
      });
      expect(script).not.toContain('</script>');
      expect(script).toContain('\\u003c/script>');

      const store = new Map<string, string>();
      const mockLocalStorage = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      };
      let attributeValue = '';
      const mockDocument = {
        documentElement: {
          setAttribute: (_name: string, value: string | boolean) => {
            attributeValue = String(value);
          },
        },
      };

      const fn = new Function('localStorage', 'document', script);
      mockLocalStorage.setItem(
        'docusaurus.announcement.id',
        'x</script><script>alert(1)</script>',
      );
      mockLocalStorage.setItem('docusaurus.announcement.dismiss', 'true');
      fn(mockLocalStorage, mockDocument);
      expect(attributeValue).toBe('true');
    });
  });
});
