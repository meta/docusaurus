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

  it('announcement bar inline script without id', () => {
    expect(
      getAnnouncementBarInlineScript({
        siteStorage: {
          type: 'localStorage',
          namespace: '',
        },
      }),
    ).toContain(
      "storage.getItem('docusaurus.announcement.dismiss') === 'true'",
    );
  });

  it('announcement bar inline script with id', () => {
    const script = getAnnouncementBarInlineScript({
      siteStorage: {
        type: 'localStorage',
        namespace: '',
      },
      announcementBar: {
        id: 'announcement-2',
      },
    });
    expect(script).toContain("var storage = window['localStorage'];");
    expect(script).toContain(
      'storage.getItem(\'docusaurus.announcement.id\') !== "announcement-2"',
    );
    expect(script).toContain(
      "storage.getItem('docusaurus.announcement.dismiss') === 'true'",
    );
  });
});
