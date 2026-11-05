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
    it('generates inline script with announcement bar id check', () => {
      expect(
        getAnnouncementBarInlineScript({
          siteStorage: {
            type: 'localStorage',
            namespace: '',
          },
          announcementBar: {
            id: 'announcement-2',
            content: 'Hello',
            isCloseable: true,
            backgroundColor: '#000',
            textColor: '#fff',
          },
        }),
      ).toMatchSnapshot();
    });

    it('generates inline script with storage namespace', () => {
      expect(
        getAnnouncementBarInlineScript({
          siteStorage: {
            type: 'localStorage',
            namespace: '.subpath',
          },
          announcementBar: {
            id: 'announcement-1',
            content: 'Hello',
            isCloseable: true,
            backgroundColor: '#000',
            textColor: '#fff',
          },
        }),
      ).toMatchSnapshot();
    });

    it('generates inline script without announcementBar', () => {
      expect(
        getAnnouncementBarInlineScript({
          siteStorage: {
            type: 'localStorage',
            namespace: '',
          },
        }),
      ).toMatchSnapshot();
    });
  });
});
