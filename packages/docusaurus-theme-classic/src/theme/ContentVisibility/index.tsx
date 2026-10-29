/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';

import type {Props} from '@theme/ContentVisibility';
import Draft from '@theme/ContentVisibility/Draft';
import Unlisted from '@theme/ContentVisibility/Unlisted';

export default function ContentVisibility({metadata}: Props): ReactNode {
  const {unlisted, frontMatter} = metadata;
  // Reading draft/unlisted status from frontMatter is useful to display
  // the banners in dev mode (in dev, metadata.unlisted is always false)
  // See https://github.com/facebook/docusaurus/issues/8285
  return (
    <>
      {(unlisted || frontMatter.unlisted) && <Unlisted />}
      {frontMatter.draft && <Draft />}
    </>
  );
}
