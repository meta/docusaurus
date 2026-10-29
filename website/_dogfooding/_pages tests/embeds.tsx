/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import IframeWindow from '@site/src/components/BrowserWindow/IframeWindow';
import PagePartial from './_pagePartial.mdx';

// See https://github.com/facebook/docusaurus/issues/8672
export default function Embeds(): ReactNode {
  return (
    <Layout>
      <div style={{padding: 10}}>
        <Heading as="h1">Test Embeds</Heading>
        <section>
          <Heading as="h2">MDX Embeds</Heading>
          <PagePartial />
        </section>
        <section>
          <Heading as="h2">Iframe Embeds</Heading>
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            <IframeWindow url="/?docusaurus-theme=light" />
            <IframeWindow url="/?docusaurus-theme=dark" />
            <IframeWindow url="/?docusaurus-theme=unexpected-value" />
            <IframeWindow url="/" />
            <IframeWindow url="https://docusaurus.io/" />
            <IframeWindow url="https://tutorial.docusaurus.io/" />
          </div>
        </section>
      </div>
    </Layout>
  );
}
