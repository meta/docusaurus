/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  isTextLabelChild,
  isStringWithoutExpressions,
  createRule,
} from '../util';
import type {TSESTree} from '@typescript-eslint/types';

type Options = [];
type MessageIds = 'translateChildren' | 'translateArg';

export default createRule<Options, MessageIds>({
  name: 'string-literal-i18n-messages',
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce translate APIs to be called on plain text labels',
      recommended: 'error',
    },
    schema: [],
    messages: {
      translateChildren:
        '<Translate> children must be hardcoded strings. You can have in-string dynamic placeholders using the values prop.',
      translateArg:
        'translation message must be a hardcoded string. You can have in-string dynamic placeholders using the values argument.',
    },
  },
  defaultOptions: [],

  create(context) {
    return {
      JSXElement(node) {
        if (
          (node.openingElement.name as TSESTree.JSXIdentifier).name !==
          'Translate'
        ) {
          return;
        }
        if (node.children.some((child) => !isTextLabelChild(child))) {
          context.report({node, messageId: 'translateChildren'});
        }
      },
      CallExpression(node) {
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'translate'
        ) {
          return;
        }
        const param = node.arguments[0];
        if (!param || param.type !== 'ObjectExpression') {
          context.report({node, messageId: 'translateArg'});
          return;
        }
        const messageProperty = param.properties.find(
          (property): property is TSESTree.Property =>
            property.type === 'Property' &&
            (property.key as TSESTree.Identifier).name === 'message',
        );
        if (!messageProperty) {
          return;
        }

        if (!isStringWithoutExpressions(messageProperty.value)) {
          context.report({node, messageId: 'translateArg'});
        }
      },
    };
  },
});
