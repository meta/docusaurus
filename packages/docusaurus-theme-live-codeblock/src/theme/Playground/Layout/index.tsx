/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import PlaygroundPreview from '@theme/Playground/Preview';
import PlaygroundEditor from '@theme/Playground/Editor';
import type {Props} from '@theme/Playground/Layout';

import type {ThemeConfig} from '@docusaurus/theme-live-codeblock';

function useLiveCodeBlockThemeConfig() {
  const themeConfig = useThemeConfig() as unknown as ThemeConfig;
  return themeConfig.liveCodeBlock;
}

export default function PlaygroundLayout(props: Props): ReactNode {
  const themeConfig = useLiveCodeBlockThemeConfig();
  const position = props.position ?? themeConfig.playgroundPosition;
  return (
    <>
      {position === 'top' ? (
        <>
          <PlaygroundPreview />
          <PlaygroundEditor />
        </>
      ) : (
        <>
          <PlaygroundEditor />
          <PlaygroundPreview />
        </>
      )}
    </>
  );
}
