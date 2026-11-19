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

function executeInlineScript({
  script,
  storage = {},
  throwsError = false,
}: {
  script: string;
  storage?: Record<string, string>;
  throwsError?: boolean;
}) {
  const attributes: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => {
      if (throwsError) {
        throw new Error('SecurityError: LocalStorage is disabled');
      }
      return storage[key] ?? null;
    },
  };
  const mockDocument = {
    documentElement: {
      setAttribute: (name: string, value: string | boolean) => {
        attributes[name] = String(value);
      },
      getAttribute: (name: string) => attributes[name] ?? null,
    },
  };
  const fn = new Function('localStorage', 'document', script);
  fn(mockLocalStorage, mockDocument);
  return attributes;
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
    const siteStorage = {
      type: 'localStorage' as const,
      namespace: '',
    };

    it('generates inline javascript with announcement bar id', () => {
      expect(
        getAnnouncementBarInlineScript({
          siteStorage,
          announcementBar: {
            id: 'announcement-1',
          },
        }),
      ).toMatchSnapshot();
    });

    it('generates inline javascript with custom siteStorage namespace', () => {
      expect(
        getAnnouncementBarInlineScript({
          siteStorage: {
            type: 'localStorage',
            namespace: '_custom_ns',
          },
          announcementBar: {
            id: 'announcement-1',
          },
        }),
      ).toMatchSnapshot();
    });

    it('generates inline javascript without announcementBar (fallback)', () => {
      expect(
        getAnnouncementBarInlineScript({
          siteStorage,
        }),
      ).toMatchSnapshot();
    });

    it('treats announcement as not dismissed when storage is empty', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage,
        announcementBar: {
          id: 'announcement-1',
        },
      });
      const attributes = executeInlineScript({script, storage: {}});
      expect(attributes['data-announcement-bar-initially-dismissed']).toBe(
        'false',
      );
    });

    it('treats announcement as dismissed when stored id matches and dismiss is true', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage,
        announcementBar: {
          id: 'announcement-1',
        },
      });
      const attributes = executeInlineScript({
        script,
        storage: {
          'docusaurus.announcement.id': 'announcement-1',
          'docusaurus.announcement.dismiss': 'true',
        },
      });
      expect(attributes['data-announcement-bar-initially-dismissed']).toBe(
        'true',
      );
    });

    it('treats announcement as not dismissed when new id is configured after previous dismissal', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage,
        announcementBar: {
          id: 'announcement-2',
        },
      });
      const attributes = executeInlineScript({
        script,
        storage: {
          'docusaurus.announcement.id': 'announcement-1',
          'docusaurus.announcement.dismiss': 'true',
        },
      });
      expect(attributes['data-announcement-bar-initially-dismissed']).toBe(
        'false',
      );
    });

    it('treats announcement as not dismissed when dismiss is false even with matching id', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage,
        announcementBar: {
          id: 'announcement-1',
        },
      });
      const attributes = executeInlineScript({
        script,
        storage: {
          'docusaurus.announcement.id': 'announcement-1',
          'docusaurus.announcement.dismiss': 'false',
        },
      });
      expect(attributes['data-announcement-bar-initially-dismissed']).toBe(
        'false',
      );
    });

    it('respects siteStorage namespace during execution', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {
          type: 'localStorage',
          namespace: '_my_docs',
        },
        announcementBar: {
          id: 'announcement-1',
        },
      });
      const dismissedAttrs = executeInlineScript({
        script,
        storage: {
          'docusaurus.announcement.id_my_docs': 'announcement-1',
          'docusaurus.announcement.dismiss_my_docs': 'true',
        },
      });
      expect(dismissedAttrs['data-announcement-bar-initially-dismissed']).toBe(
        'true',
      );

      const otherStorageAttrs = executeInlineScript({
        script,
        storage: {
          'docusaurus.announcement.id': 'announcement-1',
          'docusaurus.announcement.dismiss': 'true',
        },
      });
      expect(
        otherStorageAttrs['data-announcement-bar-initially-dismissed'],
      ).toBe('false');
    });

    it('escapes special characters in announcement bar id safely', () => {
      const complexId = 'announcement-"special"-\'quotes\'-id';
      const script = getAnnouncementBarInlineScript({
        siteStorage,
        announcementBar: {
          id: complexId,
        },
      });
      const attributes = executeInlineScript({
        script,
        storage: {
          'docusaurus.announcement.id': complexId,
          'docusaurus.announcement.dismiss': 'true',
        },
      });
      expect(attributes['data-announcement-bar-initially-dismissed']).toBe(
        'true',
      );
    });

    it('treats announcement as not dismissed when localStorage access throws', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage,
        announcementBar: {
          id: 'announcement-1',
        },
      });
      const attributes = executeInlineScript({
        script,
        throwsError: true,
      });
      expect(attributes['data-announcement-bar-initially-dismissed']).toBe(
        'false',
      );
    });
  });
});
