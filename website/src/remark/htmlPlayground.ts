/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';
import type {Transformer} from 'unified';
import type {Root} from 'mdast';
import type {MdxJsxAttribute, MdxJsxFlowElement} from 'mdast-util-mdx';

const containerClassNameRegex =
  /containerClassName=(?<quote>["'])(?<containerClassName>.*?)\1/;
const previewOnlyRegex = /\bpreviewOnly\b/;

/**
 * Inserts a live preview of the HTML before each "```html" code block
 * Use "```html containerClassName="my-class"" to style the preview container
 * Use "```html previewOnly" to replace the code block by its preview
 */
export default function plugin(): Transformer<Root> {
  return (root) => {
    visit(root, 'code', (node, index, parent) => {
      if (node.lang !== 'html' || index === undefined || !parent) {
        return undefined;
      }
      const containerClassName = node.meta?.match(containerClassNameRegex)
        ?.groups?.containerClassName;
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
}

// <div className={containerClassName} dangerouslySetInnerHTML={{__html}} />
function createPreviewNode({
  html,
  containerClassName,
}: {
  html: string;
  containerClassName: string | undefined;
}): MdxJsxFlowElement {
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

function createLineBreakNode(): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'br',
    attributes: [],
    children: [],
  };
}

function createStringAttribute(name: string, value: string): MdxJsxAttribute {
  return {type: 'mdxJsxAttribute', name, value};
}

function createInnerHTMLAttribute(html: string): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name: 'dangerouslySetInnerHTML',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      // MDX only compiles the estree, the source code is not needed
      value: '',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'Property',
                    kind: 'init',
                    method: false,
                    shorthand: false,
                    computed: false,
                    key: {type: 'Identifier', name: '__html'},
                    value: {
                      type: 'Literal',
                      value: html,
                      raw: JSON.stringify(html),
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  };
}
