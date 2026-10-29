/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

// Repro for hydration issue https://github.com/facebook/docusaurus/issues/5617
function BuggyText() {
  return (
    <span>
      Built using the <Link to="https://www.electronjs.org/">Electron</Link> ,
      based on <Link to="https://www.chromium.org/">Chromium</Link>, and written
      using <Link to="https://www.typescriptlang.org/">TypeScript</Link> ,
      Xplorer promises you an unprecedented experience.
    </span>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout>
      <BuggyText />
    </Layout>
  );
}
