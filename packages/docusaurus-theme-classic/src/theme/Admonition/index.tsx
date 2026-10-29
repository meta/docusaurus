/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ComponentType, ReactNode} from 'react';
import type {Props} from '@theme/Admonition';
import AdmonitionTypes from '@theme/Admonition/Types';

function getAdmonitionTypeComponent(type: string): ComponentType<Props> {
  const component = AdmonitionTypes[type];
  if (component) {
    return component;
  }
  console.warn(
    `No admonition component found for admonition type "${type}". Using Info as fallback.`,
  );
  return AdmonitionTypes.info!;
}

export default function Admonition(props: Props): ReactNode {
  const AdmonitionTypeComponent = getAdmonitionTypeComponent(props.type);
  // eslint-disable-next-line react-hooks/static-components
  return <AdmonitionTypeComponent {...props} />;
}
