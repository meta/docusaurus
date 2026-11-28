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
  // Mermaid's flowchart tooltips call selection.transition(). This method is
  // added by d3-transition, but can be tree-shaken when Mermaid imports only
  // selected exports from the side-effect-free d3 entry point. Load the
  // extension explicitly before Mermaid so it patches the same D3 selection.
  await import('d3-transition');
  return (await import('mermaid')).default;
}
