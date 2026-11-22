/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  getAnnouncementBarInlineScript,
  getThemeInlineScript,
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
    function runScript(
      storage: Record<string, string>,
      announcementBarId: string,
    ) {
      const attributes: Record<string, string> = {};
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBarId,
      });
      new Function('localStorage', 'document', script)(
        {getItem: (key: string) => storage[key] ?? null},
        {
          documentElement: {
            setAttribute: (name: string, value: string) => {
              attributes[name] = value;
            },
          },
        },
      );
      return String(attributes['data-announcement-bar-initially-dismissed']);
    }

    it('is dismissed when the current announcement was dismissed', () => {
      expect(
        runScript(
          {
            'docusaurus.announcement.dismiss': 'true',
            'docusaurus.announcement.id': 'announcement-1',
          },
          'announcement-1',
        ),
      ).toBe('true');
    });

    it('is not dismissed when the announcement id changed', () => {
      expect(
        runScript(
          {
            'docusaurus.announcement.dismiss': 'true',
            'docusaurus.announcement.id': 'announcement-1',
          },
          'announcement-2',
        ),
      ).toBe('false');
    });

    it('is not dismissed for a first visit', () => {
      expect(runScript({}, 'announcement-1')).toBe('false');
    });
  });
});
