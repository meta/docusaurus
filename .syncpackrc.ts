/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {RcFile} from 'syncpack';

// const lernaJson = await fs.readJSON('./lerna.json');
// const CurrentDocusaurusVersion = lernaJson.version;

export default {
  source: [
    'package.json',
    'packages/*/package.json',
    'website/package.json',
    'argos/package.json',
    'admin/scripts/package.json',
    'packages/create-docusaurus/templates/*/package.json',
  ],

  semverGroups: [
    {
      label: 'Use ~ for TypeScript monorepo root and init templates',
      // We temporarily use a Dual TypeScript 6 + 7 setup
      // See https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0
      //  TODO remove once TS-ESLint add TS 7 support
      //   https://github.com/typescript-eslint/typescript-eslint/issues/10940
      dependencies: ['typescript', '@typescript/native'],
      range: '~',
    },
  ],

  versionGroups: [
    {
      // We temporarily use a Dual TypeScript 6 + 7 setup
      // See https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0
      //  TODO remove once TS-ESLint add TS 7 support
      //   https://github.com/typescript-eslint/typescript-eslint/issues/10940
      label: 'Dual TypeScript 6 + 7 setup, installed through npm aliases',
      dependencies: ['typescript', '@typescript/native'],
      specifierTypes: ['alias'],
    },

    {
      label: 'Ignore the exact @types/react version in type-alias packages',
      packages: [
        '@docusaurus/module-type-aliases',
        '@docusaurus/theme-common',
        '@docusaurus/types',
      ],
      dependencies: ['@types/react'],
      isIgnored: true,
    },

    {
      label: 'Ignore broad ESLint peerDep range in ESLint plugin',
      packages: ['@docusaurus/eslint-plugin'],
      dependencyTypes: ['peer'],
      dependencies: ['eslint'],
      isIgnored: true,
    },

    {
      label: 'Ignore >= TS range in @docusaurus/tsconfig',
      packages: ['@docusaurus/tsconfig'],
      dependencyTypes: ['peer'],
      isIgnored: true,
    },

    {
      label:
        'Templates should use pinned versions, not the workspace:* protocol',
      packages: [
        'docusaurus-2-classic-template',
        'docusaurus-2-classic-typescript-template',
      ],
      dependencies: ['@docusaurus/**'],
      pinVersion: '4.0.0', // TODO make this dynamic
    },

    {
      label:
        'Internal @docusaurus/* monorepo packages use the workspace:* protocol',
      dependencies: [
        '@docusaurus/**',
        'create-docusaurus',
        'stylelint-copyright',

        // These are not monorepo packages
        '!@docusaurus/responsive-loader',
      ],
      // Skip the "local" dependency type, which is each monorepo package's
      // own "version" field (e.g. "version": "4.0.0" in its package.json).
      // It can't be pinned to workspace:*, and since syncpack v15 including
      // it prints a RefuseToPinLocal warning for every internal package.
      dependencyTypes: ['!local'],
      pinVersion: 'workspace:*',
    },

    {
      label:
        "Templates can't use catalogs, lintCatalogs.js checks their versions against the catalogs",
      packages: [
        'docusaurus-2-classic-template',
        'docusaurus-2-classic-typescript-template',
      ],
      isIgnored: true,
    },

    {
      // Runtime dependencies use the default catalog ("catalog:")
      // Dev-only dependencies use the dev catalog ("catalog:dev")
      // lintCatalogs.js checks the catalogs content
      label: 'All the other dependencies must use a pnpm catalog',
      dependencyTypes: ['prod', 'dev', 'peer'],
      policy: 'catalog',
    },
  ],
} satisfies RcFile;
