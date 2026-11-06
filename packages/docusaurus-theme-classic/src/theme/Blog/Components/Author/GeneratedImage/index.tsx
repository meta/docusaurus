/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/Blog/Components/Author/GeneratedImage';

export default function GeneratedImage({name, className}: Props): JSX.Element {
  return (
    <div className={clsx('avatar__photo', className)}>
      {name[0]?.toLocaleUpperCase()}
    </div>
  );
}
