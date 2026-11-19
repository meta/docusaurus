/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
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
    it('generates announcement bar script with announcement id', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {id: 'announcement-2'},
      });
      expect(script).toContain(
        'localStorage.getItem(\'docusaurus.announcement.id\') !== "announcement-2"',
      );
      expect(script).toContain(
        "localStorage.getItem('docusaurus.announcement.dismiss') === 'true'",
      );
    });

    it('generates announcement bar script with custom namespace', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: '.custom'},
        announcementBar: {id: 'announcement-special'},
      });
      expect(script).toContain(
        'localStorage.getItem(\'docusaurus.announcement.id.custom\') !== "announcement-special"',
      );
      expect(script).toContain(
        "localStorage.getItem('docusaurus.announcement.dismiss.custom') === 'true'",
      );
    });

    it('sets data-announcement-bar-initially-dismissed to false when stored id differs from current id', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {id: 'announcement-2'},
      });

      const store: Record<string, string> = {
        'docusaurus.announcement.id': 'announcement-1',
        'docusaurus.announcement.dismiss': 'true',
      };
      const setAttribute = vi.fn();

      const runScript = new Function('localStorage', 'document', script);

      runScript(
        {
          getItem: (key: string) => store[key] ?? null,
        },
        {
          documentElement: {setAttribute},
        },
      );

      expect(setAttribute).toHaveBeenCalledWith(
        'data-announcement-bar-initially-dismissed',
        false,
      );
    });

    it('sets data-announcement-bar-initially-dismissed to true when stored id matches and is dismissed', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {id: 'announcement-2'},
      });

      const store: Record<string, string> = {
        'docusaurus.announcement.id': 'announcement-2',
        'docusaurus.announcement.dismiss': 'true',
      };
      const setAttribute = vi.fn();

      const runScript = new Function('localStorage', 'document', script);

      runScript(
        {
          getItem: (key: string) => store[key] ?? null,
        },
        {
          documentElement: {setAttribute},
        },
      );

      expect(setAttribute).toHaveBeenCalledWith(
        'data-announcement-bar-initially-dismissed',
        true,
      );
    });

    it('sets data-announcement-bar-initially-dismissed to false on fresh visit (no stored id)', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {id: 'announcement-1'},
      });

      const setAttribute = vi.fn();
      const runScript = new Function('localStorage', 'document', script);

      runScript(
        {
          getItem: () => null,
        },
        {
          documentElement: {setAttribute},
        },
      );

      expect(setAttribute).toHaveBeenCalledWith(
        'data-announcement-bar-initially-dismissed',
        false,
      );
    });
  });
});
