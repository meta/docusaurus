/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode, useContext} from 'react';
import type {BrokenLinks} from '@docusaurus/useBrokenLinks';

export type StatefulBrokenLinks = BrokenLinks & {
  getCollectedLinks: () => string[];
  getCollectedAnchors: () => string[];
};

export const createStatefulBrokenLinks = (): StatefulBrokenLinks => {
  // Set to dedup, as it's not useful to collect multiple times the same value
  const allAnchors = new Set<string>();
  const allLinks = new Set<string>();
  return {
    collectAnchor: (anchor: string | undefined): void => {
      typeof anchor !== 'undefined' && allAnchors.add(anchor);
    },
    collectLink: (link: string | undefined): void => {
      typeof link !== 'undefined' && allLinks.add(link);
    },
    getCollectedAnchors: (): string[] => [...allAnchors],
    getCollectedLinks: (): string[] => [...allLinks],
  };
};

const Context = React.createContext<BrokenLinks>({
  collectAnchor: () => {
    // No-op for client
  },
  collectLink: () => {
    // No-op for client
  },
});

export const useBrokenLinksContext = (): BrokenLinks => useContext(Context);

export function BrokenLinksProvider({
  children,
  brokenLinks,
}: {
  children: ReactNode;
  brokenLinks: BrokenLinks;
}): ReactNode {
  return <Context value={brokenLinks}>{children}</Context>;
}
