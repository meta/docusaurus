/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import {
  ThemeClassNames,
  DraftBannerTitle,
  DraftBannerMessage,
} from '@docusaurus/theme-common';
import Admonition from '@theme/Admonition';
import type {Props} from '@theme/ContentVisibility/Draft';

export default function Draft({className}: Props): ReactNode {
  return (
    <Admonition
      type="warning"
      title={<DraftBannerTitle />}
      className={clsx(className, ThemeClassNames.common.draftBanner)}>
      <DraftBannerMessage />
    </Admonition>
  );
}
