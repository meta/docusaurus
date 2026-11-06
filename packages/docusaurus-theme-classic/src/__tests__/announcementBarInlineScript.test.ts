/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom

import {describe, expect, it, beforeEach} from 'vitest';
import {getAnnouncementBarInlineScript} from '../inlineScripts';

describe('announcementBarInlineScript', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.removeAttribute(
      'data-announcement-bar-initially-dismissed',
    );
  });

  it('sets initially-dismissed to true when same announcement was dismissed', () => {
    localStorage.setItem('docusaurus.announcement.id', 'announcement-1');
    localStorage.setItem('docusaurus.announcement.dismiss', 'true');

    const script = getAnnouncementBarInlineScript({
      siteStorage: {type: 'localStorage', namespace: ''},
      announcementBar: {id: 'announcement-1'},
    });

    // Execute inline script
    eval(script);

    expect(
      document.documentElement.getAttribute(
        'data-announcement-bar-initially-dismissed',
      ),
    ).toBe('true');
  });

  it('sets initially-dismissed to false when a new announcement id is published', () => {
    localStorage.setItem('docusaurus.announcement.id', 'announcement-1');
    localStorage.setItem('docusaurus.announcement.dismiss', 'true');

    const script = getAnnouncementBarInlineScript({
      siteStorage: {type: 'localStorage', namespace: ''},
      announcementBar: {id: 'announcement-2'},
    });

    // Execute inline script
    eval(script);

    expect(
      document.documentElement.getAttribute(
        'data-announcement-bar-initially-dismissed',
      ),
    ).toBe('false');
  });

  it('sets initially-dismissed to true when sessionStorage holds the dismissed announcement', () => {
    sessionStorage.setItem('docusaurus.announcement.id', 'announcement-1');
    sessionStorage.setItem('docusaurus.announcement.dismiss', 'true');

    const script = getAnnouncementBarInlineScript({
      siteStorage: {type: 'sessionStorage', namespace: ''},
      announcementBar: {id: 'announcement-1'},
    });

    // Execute inline script
    eval(script);

    expect(
      document.documentElement.getAttribute(
        'data-announcement-bar-initially-dismissed',
      ),
    ).toBe('true');
  });

  it('sets initially-dismissed to false when no announcement was dismissed', () => {
    const script = getAnnouncementBarInlineScript({
      siteStorage: {type: 'localStorage', namespace: ''},
      announcementBar: {id: 'announcement-1'},
    });

    // Execute inline script
    eval(script);

    expect(
      document.documentElement.getAttribute(
        'data-announcement-bar-initially-dismissed',
      ),
    ).toBe('false');
  });
});
