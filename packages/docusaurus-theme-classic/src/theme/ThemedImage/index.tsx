/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {ThemedComponent} from '@docusaurus/theme-common';
import type {Props} from '@theme/ThemedImage';

export default function ThemedImage(props: Props): ReactNode {
  const {sources, className: parentClassName, alt, ...propsRest} = props;
  return (
    <ThemedComponent className={parentClassName}>
      {({theme, className}) => (
        <img
          src={sources[theme]}
          alt={alt}
          className={className}
          {...propsRest}
        />
      )}
    </ThemedComponent>
  );
}
