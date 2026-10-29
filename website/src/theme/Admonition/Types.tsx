/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import type {Props} from '@theme/Admonition';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import Heading from '@theme/Heading';

function MyCustomAdmonition(props: Props): ReactNode {
  return (
    <div style={{border: 'solid red', padding: 10}}>
      <Heading as="h5" style={{color: 'blue', fontSize: 30}}>
        {props.title}
      </Heading>
      <div>{props.children}</div>
    </div>
  );
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,

  // Add all your custom admonition types here...
  // you can also override the default ones
  'my-custom-admonition': MyCustomAdmonition,
};

export default AdmonitionTypes;
