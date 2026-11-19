/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type React from 'react';
import {useCallback, useRef, type ComponentProps, type ReactNode} from 'react';
import {useHistory} from '@docusaurus/router';
import {translate} from '@docusaurus/Translate';
import {useLocationChange} from './useLocationChange';
import {useTitleFormatter} from './titleFormatterUtils';

/**
 * The id of the element that should become focused on a page
 * that does not have a <main> html tag.
 * Focusing the Docusaurus Layout children is a reasonable fallback.
 *
 * __ prefix allows search crawlers (Algolia/DocSearch) to ignore anchors
 * https://github.com/meta/docusaurus/issues/8883#issuecomment-1516328368
 */
export const SkipToContentFallbackId = '__docusaurus_skipToContent_fallback';

/**
 * Returns the skip to content element to focus when the link is clicked.
 */
function getSkipToContentTarget(): HTMLElement | null {
  return (
    // Try to focus the <main> in priority
    // Note: this will only work if JS is enabled
    // See https://github.com/meta/docusaurus/issues/6411#issuecomment-1284136069
    document.querySelector('main:first-of-type') ??
    // Then try to focus the fallback element (usually the Layout children)
    document.getElementById(SkipToContentFallbackId)
  );
}

function programmaticFocus(el: HTMLElement) {
  el.setAttribute('tabindex', '-1');
  el.focus();
  el.removeAttribute('tabindex');
}

/** This hook wires the logic for a skip-to-content link. */
function useSkipToContent(title?: string): {
  /**
   * The ref to the container. On page transition, the container will be focused
   * so that keyboard navigators can instantly interact with the link and jump
   * to content.
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Callback fired when the skip to content link has been clicked.
   * It will programmatically focus the main content.
   */
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const {action} = useHistory();
  const titleFormatter = useTitleFormatter();
  const formattedTitle = title ? titleFormatter.format(title) : '';

  const onClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetElement = getSkipToContentTarget();
    if (targetElement) {
      programmaticFocus(targetElement);
    }
  }, []);

  // "Reset" focus when navigating.
  // See https://github.com/meta/docusaurus/pull/8204#issuecomment-1276547558
  useLocationChange(({location}) => {
    if (containerRef.current && !location.hash && action === 'PUSH') {
      // Announce the page title when navigating, so screen reader users know
      // which page they landed on. The container's aria-label is restored to
      // the skip link label on the next render.
      if (formattedTitle) {
        containerRef.current.setAttribute('aria-label', formattedTitle);
      }
      programmaticFocus(containerRef.current);
    }
  });

  return {containerRef, onClick};
}

const DefaultSkipToContentLabel = translate({
  id: 'theme.common.skipToMainContent',
  description:
    'The skip to content label used for accessibility, allowing to rapidly navigate to main content with keyboard tab/enter navigation',
  message: 'Skip to main content',
});

type SkipToContentLinkProps = Omit<ComponentProps<'a'>, 'href' | 'onClick'> & {
  /**
   * The page title, announced by screen readers when navigating to a new page.
   */
  title?: string;
};

export function SkipToContentLink(props: SkipToContentLinkProps): ReactNode {
  const {title, ...linkProps} = props;
  const linkLabel = linkProps.children ?? DefaultSkipToContentLabel;
  const {containerRef, onClick} = useSkipToContent(title);
  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={DefaultSkipToContentLabel}>
      {/* eslint-disable-next-line @docusaurus/no-html-links */}
      <a
        {...linkProps}
        // Note this is a fallback href in case JS is disabled
        // It has limitations, see https://github.com/meta/docusaurus/issues/6411#issuecomment-1284136069
        href={`#${SkipToContentFallbackId}`}
        onClick={onClick}>
        {linkLabel}
      </a>
    </div>
  );
}
