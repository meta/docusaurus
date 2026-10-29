/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import OriginalToggle from '@theme-original/ColorModeToggle';
import {
  lightStorage,
  darkStorage,
  type ColorState,
  updateDOMColors,
  LIGHT_PRIMARY_COLOR,
  DARK_PRIMARY_COLOR,
  LIGHT_BACKGROUND_COLOR,
  DARK_BACKGROUND_COLOR,
  COLOR_SHADES,
} from '@site/src/utils/colorUtils';
import type {Props} from '@theme/ColorModeToggle';

// The ColorGenerator modifies the DOM styles. The styles are persisted in
// session storage, and we need to apply the same style when toggling modes even
// when we are not on the styling-layout page. The only way to do this so far is
// by hooking into the Toggle component.
export default function ColorModeToggle(props: Props): ReactNode {
  return (
    <OriginalToggle
      {...props}
      onChange={(colorMode) => {
        props.onChange(colorMode);
        const isDarkMode = colorMode === 'dark';
        const storage = isDarkMode ? darkStorage : lightStorage;
        const colorState = (JSON.parse(
          storage.get() ?? 'null',
        ) as ColorState | null) ?? {
          baseColor: isDarkMode ? DARK_PRIMARY_COLOR : LIGHT_PRIMARY_COLOR,
          background: isDarkMode
            ? DARK_BACKGROUND_COLOR
            : LIGHT_BACKGROUND_COLOR,
          shades: COLOR_SHADES,
        };
        updateDOMColors(colorState, isDarkMode);
      }}
    />
  );
}
