/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useCollapsible, Collapsible} from '../Collapsible';
import styles from './styles.module.css';

function isInSummary(node: HTMLElement | null): boolean {
  if (!node) {
    return false;
  }
  return node.tagName === 'SUMMARY' || isInSummary(node.parentElement);
}

function hasParent(node: HTMLElement | null, parent: HTMLElement): boolean {
  if (!node) {
    return false;
  }
  return node === parent || hasParent(node.parentElement, parent);
}

export type DetailsProps = {
  /**
   * Summary is provided as props, optionally including the wrapping
   * `<summary>` tag
   */
  summary?: ReactElement | string;
} & ComponentProps<'details'>;

/**
 * A mostly un-styled `<details>` element with smooth collapsing. Provides some
 * very lightweight styles, but you should bring your UI.
 */
export function Details({
  summary,
  children,
  ...props
}: DetailsProps): ReactNode {
  useBrokenLinks().collectAnchor(props.id);

  const isBrowser = useIsBrowser();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const {collapsed, setCollapsed} = useCollapsible({
    initialState: !props.open,
  });
  // Use a separate state for the actual details prop, because it must be set
  // only after animation completes, otherwise close animations won't work
  const [open, setOpen] = useState(props.open);

  const summaryElement = React.isValidElement(summary) ? (
    summary
  ) : (
    <summary>{summary ?? 'Details'}</summary>
  );

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <details
      {...props}
      ref={detailsRef}
      open={open}
      data-collapsed={collapsed}
      className={clsx(
        styles.details,
        isBrowser && styles.isBrowser,
        props.className,
      )}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        // Prevent a double-click to highlight summary text
        if (isInSummary(target) && e.detail > 1) {
          e.preventDefault();
        }
      }}
      onClick={(e) => {
        e.stopPropagation(); // For isolation of multiple nested details/summary
        const target = e.target as HTMLElement;
        const shouldToggle =
          isInSummary(target) && hasParent(target, detailsRef.current!);
        if (!shouldToggle) {
          return;
        }
        e.preventDefault();
        if (collapsed) {
          setCollapsed(false);
          setOpen(true);
        } else {
          setCollapsed(true);
          // Don't do this, it breaks close animation!
          // setOpen(false);
        }
      }}
      onToggle={(e) => {
        // The toggle event also fires when React syncs the open attribute
        // See https://github.com/facebook/docusaurus/pull/12277
        const isOpen = e.currentTarget.open;
        if (isOpen === !collapsed) {
          return;
        }
        setCollapsed(!isOpen);
        setOpen(isOpen);
      }}>
      {summaryElement}

      <Collapsible
        lazy={false} // Content might matter for SEO in this case
        collapsed={collapsed}
        onCollapseTransitionEnd={(newCollapsed) => {
          setCollapsed(newCollapsed);
          setOpen(!newCollapsed);
        }}>
        <div className={styles.collapsibleContent}>{children}</div>
      </Collapsible>
    </details>
  );
}
