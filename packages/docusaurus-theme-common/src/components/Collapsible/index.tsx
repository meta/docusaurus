/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type React from 'react';
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type RefObject,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import {prefersReducedMotion} from '../../utils/accessibilityUtils';

const DefaultAnimationEasing = 'ease-in-out';

/**
 * This hook is a very thin wrapper around a `useState`.
 */
export function useCollapsible({
  initialState,
}: {
  /** The initial state. Will be non-collapsed by default. */
  initialState?: boolean | (() => boolean);
}): {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  toggleCollapsed: () => void;
} {
  const [collapsed, setCollapsed] = useState(initialState ?? false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((expanded) => !expanded);
  }, []);

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
  };
}

const CollapsedStyles = {
  display: 'none',
  overflow: 'hidden',
  height: '0px',
} as const;

const ExpandedStyles = {
  display: 'block',
  overflow: 'visible',
  height: 'auto',
} as const;

function applyCollapsedStyle(el: HTMLElement, collapsed: boolean) {
  const collapsedStyles = collapsed ? CollapsedStyles : ExpandedStyles;
  el.style.display = collapsedStyles.display;
  el.style.overflow = collapsedStyles.overflow;
  el.style.height = collapsedStyles.height;
}

/*
Lex111: Dynamic transition duration is used in Material design, this technique
is good for a large number of items.
https://material.io/archive/guidelines/motion/duration-easing.html#duration-easing-dynamic-durations
https://github.com/mui-org/material-ui/blob/e724d98eba018e55e1a684236a2037e24bcf050c/packages/material-ui/src/styles/createTransitions.js#L40-L43
 */
function getAutoHeightDuration(height: number) {
  if (prefersReducedMotion()) {
    // Not using 0 because it prevents onTransitionEnd to fire and bubble up :/
    // See https://github.com/facebook/docusaurus/pull/8906
    return 1;
  }
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

type CollapsibleAnimationConfig = {
  duration?: number;
  easing?: string;
};

function useCollapseAnimation({
  collapsibleRef,
  collapsed,
  animation,
}: {
  collapsibleRef: RefObject<HTMLElement | null>;
  collapsed: boolean;
  animation?: CollapsibleAnimationConfig;
}) {
  const mounted = useRef(false);

  useEffect(() => {
    const el = collapsibleRef.current!;

    function getTransitionStyles() {
      const height = el.scrollHeight;
      const duration = animation?.duration ?? getAutoHeightDuration(height);
      const easing = animation?.easing ?? DefaultAnimationEasing;
      return {
        transition: `height ${duration}ms ${easing}`,
        height: `${height}px`,
      };
    }

    function applyTransitionStyles() {
      const transitionStyles = getTransitionStyles();
      el.style.transition = transitionStyles.transition;
      el.style.height = transitionStyles.height;
    }

    // On mount, we just apply styles, no animated transition
    if (!mounted.current) {
      applyCollapsedStyle(el, collapsed);
      mounted.current = true;
      return undefined;
    }

    el.style.willChange = 'height';

    function startAnimation() {
      const animationFrame = requestAnimationFrame(() => {
        // When collapsing
        if (collapsed) {
          applyTransitionStyles();

          requestAnimationFrame(() => {
            el.style.height = CollapsedStyles.height;
            el.style.overflow = CollapsedStyles.overflow;
          });
        }
        // When expanding
        else {
          el.style.display = 'block';
          requestAnimationFrame(() => {
            applyTransitionStyles();
          });
        }
      });

      return () => cancelAnimationFrame(animationFrame);
    }

    return startAnimation();
  }, [collapsibleRef, collapsed, animation]);
}

type CollapsibleElementType = React.ElementType<
  Pick<React.HTMLAttributes<unknown>, 'className' | 'onTransitionEnd' | 'style'>
>;

type CollapsibleBaseProps = {
  /** The actual DOM element to be used in the markup. */
  as?: CollapsibleElementType;
  /** Initial collapsed state. */
  collapsed: boolean;
  children: ReactNode;
  /** Configuration of animation, like `duration` and `easing` */
  animation?: CollapsibleAnimationConfig;
  /**
   * A callback fired when the collapse transition animation ends. Receives
   * the **new** collapsed state: e.g. when
   * expanding, `collapsed` will be `false`. You can use this for some "cleanup"
   * like applying new styles when the container is fully expanded.
   */
  onCollapseTransitionEnd?: (collapsed: boolean) => void;
  /** Class name for the underlying DOM element. */
  className?: string;
};

function CollapsibleBase({
  as: As = 'div',
  collapsed,
  children,
  animation,
  onCollapseTransitionEnd,
  className,
}: CollapsibleBaseProps) {
  const collapsibleRef = useRef<HTMLElement>(null);

  useCollapseAnimation({collapsibleRef, collapsed, animation});

  return (
    <As
      // @ts-expect-error: the "too complicated type" is produced from
      // "CollapsibleElementType" being a huge union
      ref={collapsibleRef as RefObject<never>} // Refs are contravariant, which is not expressible in TS
      onTransitionEnd={(e: React.TransitionEvent) => {
        if (e.propertyName !== 'height') {
          return;
        }

        applyCollapsedStyle(collapsibleRef.current!, collapsed);
        onCollapseTransitionEnd?.(collapsed);
      }}
      className={className}>
      {children}
    </As>
  );
}

function CollapsibleLazy({collapsed, ...props}: CollapsibleBaseProps) {
  const [mounted, setMounted] = useState(!collapsed);
  // Updated in effect so that first expansion transition can work
  const [lazyCollapsed, setLazyCollapsed] = useState(collapsed);

  useLayoutEffect(() => {
    if (!collapsed) {
      setMounted(true);
    }
  }, [collapsed]);

  useLayoutEffect(() => {
    if (mounted) {
      setLazyCollapsed(collapsed);
    }
  }, [mounted, collapsed]);

  return mounted ? (
    <CollapsibleBase {...props} collapsed={lazyCollapsed} />
  ) : null;
}

type CollapsibleProps = CollapsibleBaseProps & {
  /**
   * Delay rendering of the content till first expansion. Marked as required to
   * force us to think if content should be server-rendered or not. This has
   * perf impact since it reduces html file sizes, but could undermine SEO.
   * @see https://github.com/facebook/docusaurus/issues/4753
   */
  lazy: boolean;
};

/**
 * A headless component providing smooth and uniform collapsing behavior. The
 * component will be invisible (zero height) when collapsed. Doesn't provide
 * interactivity by itself: collapse state is toggled through props.
 */
export function Collapsible({lazy, ...props}: CollapsibleProps): ReactNode {
  const Comp = lazy ? CollapsibleLazy : CollapsibleBase;
  return <Comp {...props} />;
}
