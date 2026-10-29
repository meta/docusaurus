/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import type {Node} from 'unist';
import type {MdxJsxAttributeValueExpression} from 'mdast-util-mdx';

/**
 * Util to transform one node type to another node type
 * The input node is mutated in place
 * @param node the node to mutate
 * @param newNode what the original node should become become
 */
export function transformNode<NewNode extends Node>(
  node: Node,
  newNode: NewNode,
): NewNode {
  Object.keys(node).forEach((key) => {
    // @ts-expect-error: unsafe but ok
    delete node[key];
  });
  Object.keys(newNode).forEach((key) => {
    // @ts-expect-error: unsafe but ok
    node[key] = newNode[key];
  });
  return node as NewNode;
}

export function assetRequireAttributeValue(
  requireString: string,
  hash: string,
): MdxJsxAttributeValueExpression {
  return {
    type: 'mdxJsxAttributeValueExpression',
    value: `require("${requireString}")${hash && ` + '${hash}'`}`,
    data: {
      estree: {
        type: 'Program',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'Identifier',
                  name: 'require',
                },
                arguments: [
                  {
                    type: 'Literal',
                    value: requireString,
                    raw: `"${requireString}"`,
                  },
                ],
                optional: false,
              },
              operator: '+',
              right: {
                type: 'Literal',
                value: hash,
                raw: `"${hash}"`,
              },
            },
          },
        ],
        sourceType: 'module',
        comments: [],
      },
    },
  };
}

function formatNodePosition(node: Node): string | undefined {
  return node.position?.start
    ? logger.interpolate`number=${node.position.start.line}:number=${node.position.start.column}`
    : undefined;
}

// Returns " (line:column)" when position info is available
// The initial space is useful to append easily to any existing message
export function formatNodePositionExtraMessage(node: Node): string {
  const position = formatNodePosition(node);
  return `${position ? ` (${position})` : ''}`;
}
