/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {useEffect, type ReactNode} from 'react';
import {useHistory} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

// Test for https://github.com/facebook/docusaurus/issues/10988
function BlockNavigation() {
  const history = useHistory();
  useEffect(() => {
    return history.block(() => {
      alert('navigation blocked successfully');
      return false;
    });
  }, [history]);
  return false;
}

export default function HistoryTestsPage(): ReactNode {
  return (
    <Layout>
      <Heading as="h1">History tests</Heading>
      <p>This page should block navigation</p>
      <BlockNavigation />
    </Layout>
  );
}
