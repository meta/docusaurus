/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useThemeConfig} from './useThemeConfig';
import styles from './anchorUtils.module.css';

/**
 * When the navbar is sticky, this ensures that when clicking a hash link,
 * we do not navigate to an anchor that will appear below the navbar.
 * This happens in particular for MDX headings and footnotes.
 *
 * See https://github.com/facebook/docusaurus/issues/11232
 * See also headings case https://x.com/JoshWComeau/status/1332015868725891076
 */
export function useAnchorTargetClassName(
  id: string | undefined,
): string | undefined {
  const {
    navbar: {hideOnScroll},
  } = useThemeConfig();
  if (typeof id === 'undefined') {
    return undefined;
  }
  return hideOnScroll
    ? styles.anchorTargetHideOnScrollNavbar
    : styles.anchorTargetStickyNavbar;
}
