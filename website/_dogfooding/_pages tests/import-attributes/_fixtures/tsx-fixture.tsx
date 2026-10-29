/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type React from 'react';

export default function TsxFixture({name}: {name: string}): React.JSX.Element {
  return <div>TSX fixture {name}</div>;
}
