/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';

/**
 * Turns a "```js config-tabs" code block into a "plugin options" and a "preset
 * options" tab
 */
export default function plugin() {
  /** @type {import("unified").Transformer} */
  const transformer = (root) => {
    let hasConfigTabs = false;
    visit(root, 'code', (node, index, parent) => {
      if (!node.meta?.includes('config-tabs')) {
        return;
      }
      const {value} = node;
      const [presetMeta, pluginMeta] = value.split('\n');
      const {
        groups: {presetOptionName},
      } = presetMeta.match(/\/\/.*?: (?<presetOptionName>[A-Z]+)/i) ?? {
        groups: {presetOptionName: '[translation failure]'},
      };
      const {
        groups: {pluginName},
      } = pluginMeta.match(/\/\/.*?: (?<pluginName>[A-Z@/-]+)/i) ?? {
        groups: {pluginName: '[translation failure]'},
      };
      // Replace pragma comments
      const config = value
        .replace(presetMeta, '')
        .replace(pluginMeta, '')
        .trim()
        .replace(/^.*?= /, '')
        .replace(/;$/, '');

      const jsxNode = {
        type: 'mdxJsxFlowElement',
        name: 'ConfigTabs',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'pluginName',
            value: pluginName.trim(),
          },
          {
            type: 'mdxJsxAttribute',
            name: 'presetOptionName',
            value: presetOptionName.trim(),
          },
          {
            type: 'mdxJsxAttribute',
            name: 'code',
            value: config,
          },
        ],
        children: [],
      };

      parent.children.splice(index, 1, jsxNode);
      hasConfigTabs = true;
    });

    // Import ConfigTabs once, even if the file has multiple config-tabs blocks
    if (hasConfigTabs) {
      const importNode = {
        type: 'mdxjsEsm',
        value: 'import ConfigTabs from "@site/src/components/ConfigTabs"',
        data: {
          estree: {
            type: 'Program',
            body: [
              {
                type: 'ImportDeclaration',
                specifiers: [
                  {
                    type: 'ImportDefaultSpecifier',
                    local: {type: 'Identifier', name: 'ConfigTabs'},
                  },
                ],
                source: {
                  type: 'Literal',
                  value: '@site/src/components/ConfigTabs',
                  raw: "'@site/src/components/ConfigTabs'",
                },
              },
            ],
            sourceType: 'module',
          },
        },
      };
      root.children.unshift(importNode);
    }
  };
  return transformer;
}
