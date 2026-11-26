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
  overrides: [
    {
      files: ['packages/docusaurus-infima/styles/**/*.css'],
      // Fixing these would change the Infima output, or its cascade order
      rules: {
        'comment-whitespace-inside': null, // Breaks the /*rtl:raw: directive
        'declaration-block-no-redundant-longhand-properties': null,
        'declaration-property-value-keyword-no-deprecated': null,
        'media-feature-range-notation': null,
        'no-descending-specificity': null,
        'property-no-deprecated': null,
        'selector-not-notation': null,
        'value-keyword-case': null, // Font family names
      },
    },
  ],
};
