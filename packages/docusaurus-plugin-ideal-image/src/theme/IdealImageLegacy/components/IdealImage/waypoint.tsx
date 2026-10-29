/*
This is a slimmed down copy of https://github.com/civiccc/react-waypoint
The MIT License (MIT)
Copyright (c) 2015 Brigade
 */

import React, {createRef, ReactNode} from 'react';

type ScrollContainer = Window | HTMLElement;

function addEventListener(
  element: ScrollContainer,
  type: 'scroll' | 'resize',
  listener: () => void,
  options: AddEventListenerOptions,
) {
  element.addEventListener(type, listener, options);
  return () => element.removeEventListener(type, listener, options);
}

// Because waypoint may fire before the setState() updates due to batching
// queueMicrotask is a better option than setTimeout() or React.flushSync()
// See https://github.com/facebook/docusaurus/issues/11018
// See https://github.com/civiccc/react-waypoint/blob/0905ac5a073131147c96dd0694bd6f1b6ee8bc97/src/onNextTick.js
function subscribeMicrotask(callback: () => void) {
  let subscribed = true;
  queueMicrotask(() => {
    if (subscribed) callback();
  });
  return () => (subscribed = false);
}

type Position = 'above' | 'inside' | 'below' | 'invisible';

type Props = {
  topOffset: number;
  bottomOffset: number;
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
};

export function Waypoint(props: Props) {
  return typeof window !== 'undefined' ? (
    <WaypointClient {...props}>{props.children}</WaypointClient>
  ) : (
    props.children
  );
}

// TODO maybe replace this with IntersectionObserver later?
//  IntersectionObserver doesn't support the "fast scroll" thing
//  but it's probably not a big deal
class WaypointClient extends React.Component<Props> {
  static defaultProps = {
    topOffset: 0,
    bottomOffset: 0,
    onEnter() {},
    onLeave() {},
  };

  scrollableAncestor?: ScrollContainer;
  previousPosition: Position | null = null;
  unsubscribe?: () => void;

  innerRef = createRef<HTMLElement>();

  override componentDidMount() {
    this.scrollableAncestor = findScrollableAncestor(this.innerRef.current!);

    const unsubscribeScroll = addEventListener(
      this.scrollableAncestor!,
      'scroll',
      this._handleScroll,
      {passive: true},
    );

    const unsubscribeResize = addEventListener(
      window,
      'resize',
      this._handleScroll,
      {passive: true},
    );

    const unsubscribeInitialScroll = subscribeMicrotask(() => {
      this._handleScroll();
    });

    this.unsubscribe = () => {
      unsubscribeScroll();
      unsubscribeResize();
      unsubscribeInitialScroll();
    };
  }

  override componentDidUpdate() {
    this._handleScroll();
  }

  override componentWillUnmount() {
    this.unsubscribe?.();
  }

  _handleScroll = () => {
    const node = this.innerRef.current;
    const {topOffset, bottomOffset, onEnter, onLeave} = this.props;

    const bounds = getBounds({
      node: node!,
      scrollableAncestor: this.scrollableAncestor!,
      topOffset,
      bottomOffset,
    });

    const currentPosition = getCurrentPosition(bounds);
    const previousPosition = this.previousPosition;
    this.previousPosition = currentPosition;

    if (previousPosition === currentPosition) {
      return;
    }

    if (currentPosition === 'inside') {
      onEnter();
    } else if (previousPosition === 'inside') {
      onLeave();
    }

    const isRapidScrollDown =
      previousPosition === 'below' && currentPosition === 'above';
    const isRapidScrollUp =
      previousPosition === 'above' && currentPosition === 'below';
    if (isRapidScrollDown || isRapidScrollUp) {
      onEnter();
      onLeave();
    }
  };

  override render() {
    // @ts-expect-error: fix this implicit API
    return React.cloneElement(this.props.children, {innerRef: this.innerRef});
  }
}

/**
 * Traverses up the DOM to find an ancestor container which has an overflow
 * style that allows for scrolling.
 *
 * @return {Object} the closest ancestor element with an overflow style that
 *   allows for scrolling. If none is found, the `window` object is returned
 *   as a fallback.
 */
function findScrollableAncestor(inputNode: HTMLElement): ScrollContainer {
  let node: HTMLElement = inputNode;

  while (node.parentNode) {
    // @ts-expect-error: it's fine
    node = node.parentNode!;

    if (node === document.body) {
      // We've reached all the way to the root node.
      return window;
    }

    const style = window.getComputedStyle(node);
    const overflow =
      style.getPropertyValue('overflow-y') ||
      style.getPropertyValue('overflow');

    if (
      overflow === 'auto' ||
      overflow === 'scroll' ||
      overflow === 'overlay'
    ) {
      return node;
    }
  }

  // A scrollable ancestor element was not found, which means that we need to
  // do stuff on window.
  return window;
}

type Bounds = {
  top: number;
  bottom: number;
  viewportTop: number;
  viewportBottom: number;
};

function getBounds({
  node,
  scrollableAncestor,
  topOffset,
  bottomOffset,
}: {
  node: Element;
  scrollableAncestor: ScrollContainer;
  topOffset: number;
  bottomOffset: number;
}): Bounds {
  const {top, bottom} = node.getBoundingClientRect();

  let contextHeight;
  let contextScrollTop;
  if (scrollableAncestor === window) {
    contextHeight = window.innerHeight;
    contextScrollTop = 0;
  } else {
    const ancestorElement = scrollableAncestor as HTMLElement;
    contextHeight = ancestorElement.offsetHeight;
    contextScrollTop = ancestorElement.getBoundingClientRect().top;
  }

  const contextBottom = contextScrollTop + contextHeight;

  return {
    top,
    bottom,
    viewportTop: contextScrollTop + topOffset,
    viewportBottom: contextBottom - bottomOffset,
  };
}

function getCurrentPosition(bounds: Bounds): Position {
  if (bounds.viewportBottom - bounds.viewportTop === 0) {
    return 'invisible';
  }
  // top is within the viewport
  if (bounds.viewportTop <= bounds.top && bounds.top <= bounds.viewportBottom) {
    return 'inside';
  }
  // bottom is within the viewport
  if (
    bounds.viewportTop <= bounds.bottom &&
    bounds.bottom <= bounds.viewportBottom
  ) {
    return 'inside';
  }
  // top is above the viewport and bottom is below the viewport
  if (
    bounds.top <= bounds.viewportTop &&
    bounds.viewportBottom <= bounds.bottom
  ) {
    return 'inside';
  }
  if (bounds.viewportBottom < bounds.top) {
    return 'below';
  }
  if (bounds.top < bounds.viewportTop) {
    return 'above';
  }
  return 'invisible';
}
