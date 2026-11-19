/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';

const containerClassNameRegex =
  /containerClassName=(?<quote>["'])(?<containerClassName>.*?)\1/;
const previewOnlyRegex = /\bpreviewOnly\b/;

/**
 * Inserts a live preview of the HTML before each "```html" code block
 * Use "```html containerClassName="my-class"" to style the preview container
 * Use "```html previewOnly" to replace the code block by its preview
 */
export default function plugin() {
  /** @type {import("unified").Transformer} */
  const transformer = (root) => {
    visit(root, 'code', (node, index, parent) => {
      if (node.lang !== 'html') {
        return undefined;
      }
      const containerClassName = node.meta?.match(containerClassNameRegex)
        ?.groups.containerClassName;
      const previewOnly = previewOnlyRegex.test(node.meta ?? '');

      const previewNode = createPreviewNode({
        html: node.value,
        containerClassName,
      });
      const newNodes = previewOnly
        ? [previewNode]
        : [previewNode, createLineBreakNode(), node];
      parent.children.splice(index, 1, ...newNodes);

      // Continue after the new nodes
      return index + newNodes.length;
    });
  };
  return transformer;
}

// <div className={containerClassName} dangerouslySetInnerHTML={{__html}} />
function createPreviewNode({html, containerClassName}) {
  const classNameAttributes = containerClassName
    ? [createStringAttribute('className', containerClassName)]
    : [];
  return {
    type: 'mdxJsxFlowElement',
    name: 'div',
    attributes: [...classNameAttributes, createInnerHTMLAttribute(html)],
    children: [],
  };
}

function createLineBreakNode() {
  return {
    type: 'mdxJsxFlowElement',
    name: 'br',
    attributes: [],
    children: [],
  };
}

function createStringAttribute(name, value) {
  return {type: 'mdxJsxAttribute', name, value};
}

function createInnerHTMLAttribute(html) {
  const objectExpression = {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        kind: 'init',
        key: {type: 'Identifier', name: '__html'},
        value: {type: 'Literal', value: html, raw: JSON.stringify(html)},
      },
    ],
  };
  return {
    type: 'mdxJsxAttribute',
    name: 'dangerouslySetInnerHTML',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      data: {
        estree: {
          type: 'Program',
          body: [{type: 'ExpressionStatement', expression: objectExpression}],
          sourceType: 'module',
        },
      },
    },
  };
}
