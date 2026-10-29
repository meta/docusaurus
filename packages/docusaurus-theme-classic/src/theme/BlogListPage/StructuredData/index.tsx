/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import {useBlogListPageStructuredData} from '@docusaurus/plugin-content-blog/client';
import type {Props} from '@theme/BlogListPage/StructuredData';

export default function BlogListPageStructuredData(props: Props): ReactNode {
  const structuredData = useBlogListPageStructuredData(props);
  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Head>
  );
}
