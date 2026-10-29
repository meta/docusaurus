/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Playground from '@theme/Playground';

const TestCode = `function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`;

export default function LivePlaygroundTests(): ReactNode {
  return (
    <Layout title="Test Reset Button">
      <div style={{padding: '2rem'}}>
        <Heading as="h1">Live Playground tests</Heading>

        <Heading as="h2">Position bottom (default)</Heading>
        <Playground position="bottom">{TestCode}</Playground>

        <Heading as="h2">Position top</Heading>
        <Playground position="top">{TestCode}</Playground>
      </div>
    </Layout>
  );
}
