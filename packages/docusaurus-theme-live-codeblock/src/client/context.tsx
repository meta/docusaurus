/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createContext, useContext, type ReactNode} from 'react';

type PlaygroundContextValue = {
  reset: () => void;
};

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

export function PlaygroundProvider({
  value,
  children,
}: {
  value: PlaygroundContextValue;
  children: ReactNode;
}): ReactNode {
  return <PlaygroundContext value={value}>{children}</PlaygroundContext>;
}

export function usePlayground(): PlaygroundContextValue {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error('usePlayground must be used within PlaygroundProvider');
  }
  return context;
}
