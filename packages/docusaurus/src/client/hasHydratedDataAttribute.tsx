/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useIsBrowser from '@docusaurus/useIsBrowser';

// See https://github.com/facebook/docusaurus/pull/9256
// Docusaurus adds a <html data-has-hydrated="true"> after hydration
export default function HasHydratedDataAttribute(): ReactNode {
  const isBrowser = useIsBrowser();
  return (
    <Head>
      <html data-has-hydrated={isBrowser} />
    </Head>
  );
}
