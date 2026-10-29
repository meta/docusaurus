/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {SiteStorage} from '@docusaurus/types';
import type {ThemeConfig} from '@docusaurus/theme-common';

// Support for ?docusaurus-theme=dark
const ThemeQueryStringKey = 'docusaurus-theme';

// Support for ?docusaurus-data-mode=embed&docusaurus-data-myAttr=42
const DataQueryStringPrefixKey = 'docusaurus-data-';

export function getThemeInlineScript({
  colorMode: {disableSwitch, defaultMode, respectPrefersColorScheme},
  siteStorage,
}: {
  colorMode: ThemeConfig['colorMode'];
  siteStorage: SiteStorage;
}): string {
  // Need to be inlined to prevent dark mode FOUC
  // Make sure the key is the same as the one in the color mode React context
  // Currently defined in: `docusaurus-theme-common/src/contexts/colorMode.tsx`
  const themeStorageKey = `theme${siteStorage.namespace}`;
  const isThemeUserConfigurable = !disableSwitch;

  /* language=js */
  return `(function() {
  function getSystemColorMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
${
  isThemeUserConfigurable
    ? `  function getQueryStringTheme() {
    try {
      return new URLSearchParams(window.location.search).get('${ThemeQueryStringKey}')
    } catch (e) {}
  }
  function getStoredTheme() {
    try {
      return window['${siteStorage.type}'].getItem('${themeStorageKey}');
    } catch (err) {}
  }
  var initialTheme = getQueryStringTheme() || getStoredTheme();`
    : '  var initialTheme;'
}
  document.documentElement.setAttribute('data-theme', initialTheme || ${
    respectPrefersColorScheme ? 'getSystemColorMode()' : `'${defaultMode}'`
  });
  document.documentElement.setAttribute('data-theme-choice', initialTheme || ${
    respectPrefersColorScheme ? `'system'` : `'${defaultMode}'`
  });
})();`;
}

/* language=js */
export const DataAttributeQueryStringInlineJavaScript = `
(function() {
  try {
    const entries = new URLSearchParams(window.location.search).entries();
    for (var [searchKey, value] of entries) {
      if (searchKey.startsWith('${DataQueryStringPrefixKey}')) {
        var key = searchKey.replace('${DataQueryStringPrefixKey}',"data-")
        document.documentElement.setAttribute(key, value);
      }
    }
  } catch(e) {}
})();
`;

// We always render the announcement bar html on the server, to prevent layout
// shifts on React hydration. The theme can use CSS + the data attribute to hide
// the announcement bar asap (before React hydration)
export function getAnnouncementBarInlineScript({
  siteStorage,
}: {
  siteStorage: SiteStorage;
}): string {
  // Duplicated constant. Unfortunately we can't import it from theme-common, as
  // we need to support older nodejs versions without ESM support
  // TODO: import from theme-common once we support Node.js with ESM support
  // + move all those announcementBar stuff there too
  const AnnouncementBarDismissStorageKey = `docusaurus.announcement.dismiss${siteStorage.namespace}`;
  const AnnouncementBarDismissDataAttribute =
    'data-announcement-bar-initially-dismissed';

  /* language=js */
  return `(function() {
  function isDismissed() {
    try {
      return localStorage.getItem('${AnnouncementBarDismissStorageKey}') === 'true';
    } catch (err) {}
    return false;
  }
  document.documentElement.setAttribute('${AnnouncementBarDismissDataAttribute}', isDismissed());
})();`;
}
