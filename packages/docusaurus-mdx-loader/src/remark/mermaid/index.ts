/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';
import {transformNode} from '../utils';

import type {Transformer} from 'unified';
import type {Root} from 'mdast';

// TODO: this plugin shouldn't be in the core MDX loader
// After we allow plugins to provide Remark/Rehype plugins (see
// https://github.com/facebook/docusaurus/issues/6370), this should be provided
// by theme-mermaid itself
export default function plugin(): Transformer<Root> {
  return (root) => {
    visit(root, 'code', (node) => {
      if (node.lang === 'mermaid') {
        // TODO migrate to mdxJsxFlowElement? cf admonitions
        transformNode(node, {
          type: 'mermaidCodeBlock',
          data: {
            hName: 'mermaid',
            hProperties: {
              value: node.value,
            },
          },
        });
      }
    });
  };
}
