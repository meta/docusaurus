/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentType,
  type ReactNode,
} from 'react';
import {NavLink, Link as RRLink} from 'react-router-dom';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import useDocusaurusContext from './useDocusaurusContext';
import isInternalUrl from './isInternalUrl';
import ExecutionEnvironment from './ExecutionEnvironment';
import useBrokenLinks from './useBrokenLinks';
import {useBaseUrlUtils} from './useBaseUrl';
import type {Props} from '@docusaurus/Link';

// TODO all this wouldn't be necessary if we used ReactRouter basename feature
// We don't automatically add base urls to all links,
// only the "safe" ones, starting with / (like /docs/introduction)
// this is because useBaseUrl() actually transforms relative links
// like "introduction" to "/baseUrl/introduction" => bad behavior to fix
const shouldAddBaseUrlAutomatically = (to: string) => to.startsWith('/');

function Link({
  isNavLink,
  to,
  href,
  activeClassName,
  isActive,
  'data-noBrokenLinkCheck': noBrokenLinkCheck,
  autoAddBaseUrl = true,
  ...props
}: Props): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {trailingSlash, baseUrl} = siteConfig;
  const router = siteConfig.future.experimental_router;
  const {withBaseUrl} = useBaseUrlUtils();
  const brokenLinks = useBrokenLinks();
  const innerRef = useRef<HTMLAnchorElement | null>(null);

  useImperativeHandle(props.ref, () => innerRef.current!);

  // IMPORTANT: using to or href should not change anything
  // For example, MDX links will ALWAYS give us the href props
  // Using one prop or the other should not be used to distinguish
  // internal links (/docs/myDoc) from external links (https://github.com)
  const targetLinkUnprefixed = to || href;

  function maybeAddBaseUrl(str: string) {
    return autoAddBaseUrl && shouldAddBaseUrlAutomatically(str)
      ? withBaseUrl(str)
      : str;
  }

  const isInternal = isInternalUrl(targetLinkUnprefixed);

  // pathname:// is a special "protocol" we use to tell Docusaurus link
  // that a link is not "internal" and that we shouldn't use history.push()
  // this is not ideal but a good enough escape hatch for now
  // see https://github.com/facebook/docusaurus/issues/3309
  // note: we want baseUrl to be appended (see issue for details)
  // TODO read routes and automatically detect internal/external links?
  const targetLinkWithoutPathnameProtocol = targetLinkUnprefixed?.replace(
    'pathname://',
    '',
  );

  // TODO we should use ReactRouter basename feature instead!
  // Automatically apply base url in links that start with /
  let targetLink =
    typeof targetLinkWithoutPathnameProtocol !== 'undefined'
      ? maybeAddBaseUrl(targetLinkWithoutPathnameProtocol)
      : undefined;

  // TODO find a way to solve this problem properly
  // Fix edge case when useBaseUrl is used on a link
  // "./" is useful for images and other resources
  // But we don't need it for <Link>
  // unfortunately we can't really make the difference :/
  if (router === 'hash' && targetLink?.startsWith('./')) {
    targetLink = targetLink?.slice(1);
  }

  if (targetLink && isInternal) {
    targetLink = applyTrailingSlash(targetLink, {trailingSlash, baseUrl});
  }

  const preloaded = useRef(false);
  const LinkComponent = (isNavLink ? NavLink : RRLink) as ComponentType<Props>;

  const IOSupported = ExecutionEnvironment.canUseIntersectionObserver;

  const ioRef = useRef<IntersectionObserver>(undefined);

  const handleRef = useCallback(
    (el: HTMLAnchorElement | null) => {
      innerRef.current = el;
      ioRef.current?.disconnect();
      ioRef.current = undefined;

      if (IOSupported && el && isInternal) {
        // If IO supported and element reference found, set up Observer.
        const observer = new window.IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (el === entry.target) {
              // If element is in viewport, stop observing and run callback.
              // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
              if (entry.isIntersecting || entry.intersectionRatio > 0) {
                observer.unobserve(el);
                observer.disconnect();
                if (ioRef.current === observer) {
                  ioRef.current = undefined;
                }
                if (targetLink != null) {
                  window.docusaurus.prefetch(targetLink);
                }
              }
            }
          });
        });
        // Add element to the observer.
        ioRef.current = observer;
        observer.observe(el);
      }
    },
    [IOSupported, isInternal, targetLink],
  );

  const onInteractionEnter = () => {
    if (!preloaded.current && targetLink != null) {
      window.docusaurus.preload(targetLink);
      preloaded.current = true;
    }
  };

  useEffect(() => {
    // If IO is not supported. We prefetch by default (only once).
    if (!IOSupported && isInternal && ExecutionEnvironment.canUseDOM) {
      if (targetLink != null) {
        window.docusaurus.prefetch(targetLink);
      }
    }
  }, [targetLink, IOSupported, isInternal]);

  // It is simple local anchor link targeting current page?
  const isAnchorLink = targetLink?.startsWith('#') ?? false;

  // See also RR logic:
  // https://github.com/remix-run/react-router/blob/v5/packages/react-router-dom/modules/Link.js#L47
  const hasInternalTarget = !props.target || props.target === '_self';

  // Should we use a regular <a> tag instead of React-Router Link component?
  const isRegularHtmlLink =
    !targetLink ||
    !isInternal ||
    !hasInternalTarget ||
    // When using the hash router, we can't use the regular <a> link for anchors
    // We need to use React Router to navigate to /#/pathname/#anchor
    // And not /#anchor
    // See also https://github.com/facebook/docusaurus/pull/10311
    (isAnchorLink && router !== 'hash');

  if (!noBrokenLinkCheck && (isAnchorLink || !isRegularHtmlLink)) {
    brokenLinks.collectLink(targetLink!);
  }

  if (props.id) {
    brokenLinks.collectAnchor(props.id);
  }

  // These props are only added in unit tests to assert/capture the type of link
  const testOnlyProps =
    process.env.NODE_ENV === 'test'
      ? {'data-test-link-type': isRegularHtmlLink ? 'regular' : 'react-router'}
      : {};

  return isRegularHtmlLink ? (
    // eslint-disable-next-line jsx-a11y/anchor-has-content, @docusaurus/no-html-links
    <a
      ref={innerRef}
      href={targetLink}
      {...(targetLinkUnprefixed &&
        !isInternal && {target: '_blank', rel: 'noopener noreferrer'})}
      {...props}
      {...testOnlyProps}
    />
  ) : (
    <LinkComponent
      {...props}
      onMouseEnter={onInteractionEnter}
      onTouchStart={onInteractionEnter}
      innerRef={handleRef}
      to={targetLink}
      // Avoid "React does not recognize the `activeClassName` prop on a DOM
      // element"
      {...(isNavLink && {isActive, activeClassName})}
      {...testOnlyProps}
    />
  );
}

export default Link;
