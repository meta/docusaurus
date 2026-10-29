/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';
import {toEstree} from 'hast-util-to-estree';
import type {ElementContent, Root} from 'hast';
import type {MdxJsxAttribute} from 'mdast-util-mdx';
import type {Plugin} from 'unified';

// Moves the rich title fragment created by the admonitions Remark plugin to
// the title prop: <admonition title={<>rich title</>}>
// It must run after the user Rehype plugins, so that they can process titles
const plugin: Plugin<[], Root> = function plugin() {
  return (root) => {
    visit(root, 'mdxJsxFlowElement', (node) => {
      if (node.name !== 'admonition') {
        return;
      }
      const titleIndex = node.children.findIndex(isRichTitle);
      if (titleIndex === -1) {
        return;
      }
      const [title] = node.children.splice(titleIndex, 1);
      node.attributes.push(createTitleAttribute(title!));
    });
  };
};

export default plugin;

function isRichTitle(node: ElementContent): boolean {
  return (
    node.type === 'mdxJsxTextElement' && node.data?.admonitionTitle === true
  );
}

function createTitleAttribute(title: ElementContent): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name: 'title',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      // MDX only compiles the estree, the source code is not needed
      value: '',
      data: {estree: toEstree(title)},
    },
  };
}
