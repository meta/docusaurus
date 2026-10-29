/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import {usePlayground} from '@docusaurus/theme-live-codeblock/client';
import type {Props} from '@theme/Playground/Buttons/ResetButton';
import styles from './styles.module.css';

function Icon() {
  return (
    <svg
      className={styles.resetButtonIcon}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true">
      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
    </svg>
  );
}

function Label() {
  return (
    <Translate
      id="theme.Playground.buttons.reset"
      description="The reset button label for live code blocks">
      Reset
    </Translate>
  );
}

export default function ResetButton({className}: Props): ReactNode {
  const {reset} = usePlayground();
  return (
    <button
      type="button"
      aria-label="Reset code to original"
      title="Reset"
      className={clsx('clean-btn', className, styles.resetButton)}
      onClick={() => reset()}>
      <Icon />
      <Label />
    </button>
  );
}
