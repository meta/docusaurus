/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ComponentProps, ReactNode} from 'react';

export function ButtonExample(props: ComponentProps<'button'>): ReactNode {
  return (
    <button
      type="button"
      {...props}
      style={{
        backgroundColor: 'white',
        color: 'black',
        border: 'solid red',
        borderRadius: 20,
        padding: 10,
        cursor: 'pointer',
        ...props.style,
      }}
    />
  );
}
