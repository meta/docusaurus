/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createRule} from '../util';
import type {TSESTree} from '@typescript-eslint/types';

const docsUrl = 'https://docusaurus.io/docs/docusaurus-core#link';

type Options = [
  {
    ignoreFullyResolved: boolean;
  },
];

type MessageIds = 'link';

function isFullyResolvedUrl(urlString: string): boolean {
  const url = URL.parse(String(urlString));
  return !!(url && url.protocol);
}

export default createRule<Options, MessageIds>({
  name: 'no-html-links',
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce using Docusaurus Link component instead of <a> tag',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreFullyResolved: {
            description:
              'Set to true will not report any <a> tags with absolute URLs including a protocol.',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ignoreFullyResolved: false}],
    messages: {
      link: `Do not use an \`<a>\` element to navigate. Use the \`<Link />\` component from \`@docusaurus/Link\` instead. See: ${docsUrl}`,
    },
  },
  defaultOptions: [
    {
      ignoreFullyResolved: false,
    },
  ],

  create(context, [options]) {
    const {ignoreFullyResolved} = options;

    return {
      JSXOpeningElement(node) {
        if ((node.name as TSESTree.JSXIdentifier).name !== 'a') {
          return;
        }

        if (ignoreFullyResolved) {
          const hrefAttr = node.attributes.find(
            (attr): attr is TSESTree.JSXAttribute =>
              attr.type === 'JSXAttribute' && attr.name.name === 'href',
          );

          if (hrefAttr?.value?.type === 'Literal') {
            if (isFullyResolvedUrl(String(hrefAttr.value.value))) {
              return;
            }
          }
          if (hrefAttr?.value?.type === 'JSXExpressionContainer') {
            const container: TSESTree.JSXExpressionContainer = hrefAttr.value;
            const {expression} = container;
            if (expression.type === 'TemplateLiteral') {
              // Simple static string template literals
              if (
                expression.expressions.length === 0 &&
                expression.quasis.length === 1 &&
                expression.quasis[0]?.type === 'TemplateElement' &&
                isFullyResolvedUrl(String(expression.quasis[0].value.raw))
              ) {
                return;
              }
              // TODO add more complex TemplateLiteral cases here
            }
          }
        }

        context.report({node, messageId: 'link'});
      },
    };
  },
});
