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

  it('inline javascript for announcement bar with id', () => {
    expect(
      getAnnouncementBarInlineScript({
        siteStorage: {
          type: 'localStorage',
          namespace: '',
        },
        announcementBar: {
          id: 'announcement-2',
        },
      }),
    ).toContain('var configuredId = "announcement-2";');
  });

  it('evaluates announcement bar dismissal correctly with configuredId and viewedId', () => {
    function evaluateScript(script: string, storage: Record<string, string>) {
      let resultAttr = '';
      const fakeLocalStorage = {
        getItem: (k: string) => storage[k] ?? null,
      };
      const fakeDocElement = {
        setAttribute: (_attr: string, val: string | boolean) => {
          resultAttr = String(val);
        },
      };
      // Execute the IIFE with stubbed globals
      const fn = new Function('localStorage', 'document', script);
      fn(fakeLocalStorage, {documentElement: fakeDocElement});
      return resultAttr;
    }

    const scriptWithId = getAnnouncementBarInlineScript({
      siteStorage: {
        type: 'localStorage',
        namespace: '',
      },
      announcementBar: {
        id: 'announcement-2',
      },
    });

    // Case 1: No stored viewedId (or empty) despite previously dismissed announcement -> should NOT be dismissed
    expect(
      evaluateScript(scriptWithId, {
        'docusaurus.announcement.dismiss': 'true',
      }),
    ).toBe('false');

    // Case 2: Stored viewedId differs from configuredId -> should NOT be dismissed
    expect(
      evaluateScript(scriptWithId, {
        'docusaurus.announcement.dismiss': 'true',
        'docusaurus.announcement.id': 'announcement-1',
      }),
    ).toBe('false');

    // Case 3: Stored viewedId matches configuredId and dismissed -> should be dismissed
    expect(
      evaluateScript(scriptWithId, {
        'docusaurus.announcement.dismiss': 'true',
        'docusaurus.announcement.id': 'announcement-2',
      }),
    ).toBe('true');

    // Case 4: No configuredId but dismissed -> should be dismissed
    const scriptWithoutId = getAnnouncementBarInlineScript({
      siteStorage: {
        type: 'localStorage',
        namespace: '',
      },
    });
    expect(
      evaluateScript(scriptWithoutId, {
        'docusaurus.announcement.dismiss': 'true',
      }),
    ).toBe('true');
  });
});
