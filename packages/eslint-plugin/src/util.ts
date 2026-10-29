/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ESLintUtils, type TSESTree} from '@typescript-eslint/utils';

type CheckTranslateChildOptions = {
  ignoredStrings?: string[];
};

const isMadeOfIgnoredStrings = (text: string, ignoredStrings: string[]) =>
  text
    .trim()
    .split(/\s+/)
    .every((string) => !string || ignoredStrings.includes(string));

const isValidTranslationLabel = (
  text: unknown,
  {ignoredStrings}: CheckTranslateChildOptions = {},
) => {
  if (!ignoredStrings) {
    return typeof text === 'string';
  }
  return (
    typeof text === 'string' && !isMadeOfIgnoredStrings(text, ignoredStrings)
  );
};

export function isStringWithoutExpressions(
  text: TSESTree.Node,
  options?: CheckTranslateChildOptions,
): boolean {
  switch (text.type) {
    case 'Literal':
      return isValidTranslationLabel(text.value, options);
    case 'TemplateLiteral':
      return (
        text.expressions.length === 0 &&
        isValidTranslationLabel(text.quasis[0]!.value.raw, options)
      );
    default:
      return false;
  }
}

export function isTextLabelChild(
  child: TSESTree.JSXChild,
  options?: CheckTranslateChildOptions,
): boolean {
  switch (child.type) {
    case 'JSXText':
      return isValidTranslationLabel(child.value, options);
    case 'JSXExpressionContainer':
      return isStringWithoutExpressions(child.expression, options);
    default:
      return false;
  }
}

// Not sure if we really need this
// See https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/#custom-rule-metadocs-types
// See https://github.com/typescript-eslint/typescript-eslint/pull/9025
export interface PluginDocs {
  recommended: boolean | 'error';
}

export const createRule = ESLintUtils.RuleCreator<PluginDocs>(
  (name) =>
    `https://docusaurus.io/docs/api/misc/@docusaurus/eslint-plugin/${name}`,
);
