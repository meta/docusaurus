/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {LiveEditor} from 'react-live';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Translate from '@docusaurus/Translate';
import PlaygroundHeader from '@theme/Playground/Header';
import ResetButton from '@theme/Playground/Buttons/ResetButton';
import styles from './styles.module.css';

export default function PlaygroundEditor(): ReactNode {
  const isBrowser = useIsBrowser();
  return (
    <>
      <PlaygroundHeader buttons={<ResetButton />}>
        <Translate
          id="theme.Playground.liveEditor"
          description="The live editor label of the live codeblocks">
          Live Editor
        </Translate>
      </PlaygroundHeader>
      <LiveEditor
        // We force remount the editor on hydration,
        // otherwise dark prism theme is not applied
        key={String(isBrowser)}
        className={styles.playgroundEditor}
      />
    </>
  );
}
