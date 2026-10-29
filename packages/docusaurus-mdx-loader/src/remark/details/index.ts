/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';
import type {Transformer} from 'unified';

import type {Root} from 'mdast';

// Transform <details> to <Details>
// MDX 2 doesn't allow to substitute html elements with the provider anymore
export default function plugin(): Transformer<Root> {
  return (root) => {
    visit(root, 'mdxJsxFlowElement', (node) => {
      if (node.name === 'details') {
        node.name = 'Details';
      }
    });
  };
}
