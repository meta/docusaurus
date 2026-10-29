/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

function DebugNavLink({to, children}: {to: string; children: ReactNode}) {
  return (
    <Link
      className={styles.navlink}
      isNavLink
      to={to}
      exact
      activeStyle={{
        backgroundColor: '#363739',
      }}>
      {children}
    </Link>
  );
}

export default function DebugLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <Head>
        <html lang="en" />
        <title>Docusaurus debug panel</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div>
        <nav className={styles.nav}>
          <DebugNavLink to="/__docusaurus/debug">Config</DebugNavLink>
          <DebugNavLink to="/__docusaurus/debug/metadata">
            Metadata
          </DebugNavLink>
          <DebugNavLink to="/__docusaurus/debug/registry">
            Registry
          </DebugNavLink>
          <DebugNavLink to="/__docusaurus/debug/routes">Routes</DebugNavLink>
          <DebugNavLink to="/__docusaurus/debug/content">Content</DebugNavLink>
          <DebugNavLink to="/__docusaurus/debug/globalData">
            Global data
          </DebugNavLink>
        </nav>
        <main className={styles.container}>{children}</main>
      </div>
    </>
  );
}
