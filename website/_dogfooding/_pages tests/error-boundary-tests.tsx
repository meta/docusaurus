/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Interpolate from '@docusaurus/Interpolate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ErrorBoundaryTestButton from '@site/src/components/ErrorBoundaryTestButton';

export default function ErrorBoundaryTests(): ReactNode {
  return (
    <>
      <ErrorBoundaryTestButton>Crash outside layout</ErrorBoundaryTestButton>
      <Layout>
        <main className="container margin-vert--xl">
          <Heading as="h1">Error boundary tests</Heading>
          <div>
            <ErrorBoundaryTestButton>
              Crash inside layout
            </ErrorBoundaryTestButton>
          </div>
          <Interpolate values={{foo: <span>FooFoo</span>, bar: <b>BarBar</b>}}>
            {'{foo} is {bar}'}
          </Interpolate>
        </main>
      </Layout>
    </>
  );
}
