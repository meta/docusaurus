/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, it} from 'vitest';
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
    beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute(
        'data-announcement-bar-initially-dismissed',
      );
    });

    it('sets attribute to false when not dismissed', () => {
      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {id: 'announcement-1'},
      });

      eval(script);
      expect(
        document.documentElement.getAttribute(
          'data-announcement-bar-initially-dismissed',
        ),
      ).toBe('false');
    });

    it('sets attribute to true when dismissed for the current id', () => {
      localStorage.setItem('docusaurus.announcement.dismiss', 'true');
      localStorage.setItem('docusaurus.announcement.id', 'announcement-1');

      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {id: 'announcement-1'},
      });

      eval(script);
      expect(
        document.documentElement.getAttribute(
          'data-announcement-bar-initially-dismissed',
        ),
      ).toBe('true');
    });

    it('sets attribute to false when id changed even if previous was dismissed', () => {
      localStorage.setItem('docusaurus.announcement.dismiss', 'true');
      localStorage.setItem('docusaurus.announcement.id', 'announcement-1');

      const script = getAnnouncementBarInlineScript({
        siteStorage: {type: 'localStorage', namespace: ''},
        announcementBar: {id: 'announcement-2'},
      });

      eval(script);
      expect(
        document.documentElement.getAttribute(
          'data-announcement-bar-initially-dismissed',
        ),
      ).toBe('false');
    });
  });
});
