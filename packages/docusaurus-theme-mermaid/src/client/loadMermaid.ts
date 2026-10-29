/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Mermaid} from 'mermaid';

// We load Mermaid with a dynamic import to code split / lazy load the library
// It is only called inside a useEffect, so loading can be deferred
export async function loadMermaid(): Promise<Mermaid> {
  return (await import('mermaid')).default;
}
