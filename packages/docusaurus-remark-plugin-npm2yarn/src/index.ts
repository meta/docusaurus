/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';
import npmToYarn from 'npm-to-yarn';
import type {Code, Literal} from 'mdast';
import type {
  MdxJsxFlowElement,
  MdxJsxAttribute,
  MdxjsEsm,
} from 'mdast-util-mdx';
import type {Node, Parent} from 'unist';
import type {Transformer, Plugin} from 'unified';

type KnownConverter = 'yarn' | 'pnpm' | 'bun';

type CustomConverter = [name: string, cb: (npmCode: string) => string];

type Converter = CustomConverter | KnownConverter;

type PluginOptions = {
  sync?: boolean;
  converters?: Converter[];
};

function createAttribute(
  attributeName: string,
  attributeValue: MdxJsxAttribute['value'],
): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name: attributeName,
    value: attributeValue,
  };
}

function createTabItem({
  code,
  node,
  value,
  label,
}: {
  code: string;
  node: Code;
  value: string;
  label?: string;
}): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'TabItem',
    attributes: [
      createAttribute('value', value),
      label && createAttribute('label', label),
    ].filter((attr): attr is MdxJsxAttribute => Boolean(attr)),
    children: [
      {
        type: node.type,
        lang: node.lang,
        value: code,
      },
    ],
  };
}

const transformNode = (
  node: Code,
  isSync: boolean,
  converters: Converter[],
) => {
  const groupIdProp = isSync
    ? {
        type: 'mdxJsxAttribute',
        name: 'groupId',
        value: 'npm2yarn',
      }
    : undefined;
  const npmCode = node.value;

  function createConvertedTabItem(converter: Converter) {
    if (typeof converter === 'string') {
      return createTabItem({
        code: npmToYarn(npmCode, converter),
        node,
        value: converter,
        label: getLabelForConverter(converter),
      });
    }
    const [converterName, converterFn] = converter;
    return createTabItem({
      code: converterFn(npmCode),
      node,
      value: converterName,
    });
  }

  function getLabelForConverter(converter: KnownConverter) {
    switch (converter) {
      case 'yarn':
        return 'Yarn';
      case 'bun':
        return 'Bun';
      default:
        return converter;
    }
  }

  return [
    {
      type: 'mdxJsxFlowElement',
      name: 'Tabs',
      attributes: [groupIdProp].filter(Boolean),
      children: [
        createTabItem({code: npmCode, node, value: 'npm'}),
        ...converters.flatMap(createConvertedTabItem),
      ],
    },
  ] as any[];
};

const isMdxEsmLiteral = (node: Node): node is Literal =>
  node.type === 'mdxjsEsm';
// TODO legacy approximation, good-enough for now but not 100% accurate
const isTabsImport = (node: Node): boolean =>
  isMdxEsmLiteral(node) && node.value.includes('@theme/Tabs');

const isParent = (node: Node): node is Parent =>
  Array.isArray((node as Parent).children);
const isNpm2Yarn = (node: Node): node is Code =>
  node.type === 'code' && (node as Code).meta === 'npm2yarn';

function createImportNode(): MdxjsEsm {
  return {
    type: 'mdxjsEsm',
    value:
      "import Tabs from '@theme/Tabs'\nimport TabItem from '@theme/TabItem'",
    data: {
      estree: {
        type: 'Program',
        body: [
          {
            type: 'ImportDeclaration',
            attributes: [],
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: {type: 'Identifier', name: 'Tabs'},
              },
            ],
            source: {
              type: 'Literal',
              value: '@theme/Tabs',
              raw: "'@theme/Tabs'",
            },
          },
          {
            type: 'ImportDeclaration',
            attributes: [],
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: {type: 'Identifier', name: 'TabItem'},
              },
            ],
            source: {
              type: 'Literal',
              value: '@theme/TabItem',
              raw: "'@theme/TabItem'",
            },
          },
        ],
        sourceType: 'module',
      },
    },
  };
}

const plugin: Plugin<[PluginOptions?]> = (options = {}): Transformer => {
  const {sync = false, converters = ['yarn', 'pnpm', 'bun']} = options;
  return (root) => {
    let transformed = false;
    let alreadyImported = false;

    visit(root, (node: Node) => {
      if (isTabsImport(node)) {
        alreadyImported = true;
      }

      if (isParent(node)) {
        let index = 0;
        while (index < node.children.length) {
          const child = node.children[index]!;
          if (isNpm2Yarn(child)) {
            const result = transformNode(child, sync, converters);
            node.children.splice(index, 1, ...result);
            index += result.length;
            transformed = true;
          } else {
            index += 1;
          }
        }
      }
    });

    if (transformed && !alreadyImported) {
      (root as Parent).children.unshift(createImportNode());
    }
  };
};

export default plugin;
