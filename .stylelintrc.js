/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-copyright'],
  rules: {
    'docusaurus/copyright-header': [
      true,
      {
        header: `*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.`,
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        // :global is a CSS modules feature to escape from class name hashing
        ignorePseudoClasses: ['global'],
      },
    ],
    'selector-class-pattern': null,
    'custom-property-empty-line-before': null,
    'selector-id-pattern': null,
    'declaration-empty-line-before': null,
    'comment-empty-line-before': null,
    'value-keyword-case': ['lower', {camelCaseSvgKeywords: true}],
  },
};
