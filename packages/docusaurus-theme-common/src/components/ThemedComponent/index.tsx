/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useColorMode} from '../../contexts/colorMode';

import styles from './styles.module.css';

type Theme = 'light' | 'dark';

type RenderFn = ({
  theme,
  className,
}: {
  theme: Theme;
  className: string;
}) => React.ReactNode;

type Props = {
  children: RenderFn;
  className?: string;
};

/**
 * Generic component to render anything themed in light/dark
 * Note: it's preferable to use CSS for theming because this component
 * will need to render all the variants during SSR to avoid a theme flash.
 *
 * Use this only when CSS customizations are not convenient or impossible.
 * For example, rendering themed images or SVGs...
 *
 * @param className applied to all the variants
 * @param children function to render a theme variant
 * @constructor
 */
export default function ThemedComponent({
  className,
  children,
}: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const {colorMode} = useColorMode();

  function getThemesToRender(): Theme[] {
    if (isBrowser) {
      return colorMode === 'dark' ? ['dark'] : ['light'];
    }
    // We need to render both components on the server / hydration to avoid:
    // - a flash of wrong theme before hydration
    // - React hydration mismatches
    // See https://github.com/facebook/docusaurus/pull/3730
    return ['light', 'dark'];
  }

  return (
    <>
      {getThemesToRender().map((theme) => {
        const themedElement = children({
          theme,
          className: clsx(
            className,
            styles.themedComponent,
            styles[`themedComponent--${theme}`],
          ),
        });
        return <React.Fragment key={theme}>{themedElement}</React.Fragment>;
      })}
    </>
  );
}
