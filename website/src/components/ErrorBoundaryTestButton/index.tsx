/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type ReactNode, useState} from 'react';

export default function ErrorBoundaryTestButton({
  children = 'Boom!',
  message = 'Boom!\nSomething bad happened, but you can try again!',
  cause,
}: {
  children?: ReactNode;
  message?: string;
  cause?: string;
}): ReactNode {
  const [state, setState] = useState(false);
  if (state) {
    throw new Error(message, {
      cause: cause ? new Error(cause) : undefined,
    });
  }
  return (
    <button
      className="button button--danger"
      type="button"
      onClick={() => setState(true)}>
      {children}
    </button>
  );
}
