/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {name, version} from '../package.json';

import rules from './rules';

const plugin = {
  meta: {name, version, namespace: '@docusaurus'},
  rules,
};

const rulesRecommended = {
  '@docusaurus/string-literal-i18n-messages': 'error',
  '@docusaurus/no-html-links': 'warn',
  '@docusaurus/prefer-docusaurus-heading': 'warn',
};

const rulesAll = {
  '@docusaurus/string-literal-i18n-messages': 'error',
  '@docusaurus/no-untranslated-text': 'warn',
  '@docusaurus/no-html-links': 'warn',
  '@docusaurus/prefer-docusaurus-heading': 'warn',
};

// Supports both legacy/flat configs:
// https://eslint.org/docs/latest/extend/plugins#backwards-compatibility-for-legacy-configs
const compatPlugin = {
  ...plugin,
  configs: {
    recommended: {
      plugins: ['@docusaurus'],
      rules: rulesRecommended,
    },
    all: {
      plugins: ['@docusaurus'],
      rules: rulesAll,
    },
    flat: {
      recommended: {
        plugins: {
          '@docusaurus': plugin,
        },
        rules: rulesRecommended,
      },
      all: {
        plugins: {
          '@docusaurus': plugin,
        },
        rules: rulesAll,
      },
    },
  },
};

// @ts-expect-error: TODO try to remove later
export = compatPlugin;
