/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useLayoutEffect} from 'react';

// TODO Docusaurus v5: remove this deprecated hook
/**
 * This hook is now just React's `useLayoutEffect`.
 *
 * It used to fall back to `useEffect` on the server to avoid the
 * `useLayoutEffect` SSR warning, which React 19 removed.
 * See https://github.com/facebook/react/pull/26395
 *
 * We only keep it for retro-compatibility, because third-party code might
 * import `@docusaurus/useIsomorphicLayoutEffect`.
 *
 * @deprecated Use React's `useLayoutEffect` instead.
 */
const useIsomorphicLayoutEffect = useLayoutEffect;

export default useIsomorphicLayoutEffect;
