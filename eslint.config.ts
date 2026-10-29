/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {defineConfig, globalIgnores} from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
// @ts-expect-error: no types provided
import header from 'eslint-plugin-header';
import importPlugin from 'eslint-plugin-import';
import vitest from '@vitest/eslint-plugin';
// @ts-expect-error: no types provided
import jsxA11y from 'eslint-plugin-jsx-a11y';
import docusaurus from '@docusaurus/eslint-plugin';
import regexp from 'eslint-plugin-regexp';
import prettier from 'eslint-config-prettier/flat';

import rules from './eslint.rules';

const plugins = defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  reactHooks.configs.flat.recommended,
  reactYouMightNotNeedAnEffect.configs.recommended,
  importPlugin.flatConfigs.recommended,
  vitest.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  regexp.configs['flat/recommended'],
  prettier,
  docusaurus.configs.flat.all,

  // TODO replace by maintained plugin?
  // See https://github.com/facebook/docusaurus/pull/11803
  // This adapts the legacy plugin to flat config
  {
    plugins: {
      header: {
        meta: {
          name: 'eslint-plugin-header',
          version: 'whatever',
          namespace: 'header',
        },
        rules: header.rules,
      },
    },
  },
]);

const ignores = globalIgnores([
  '.claude',
  '.codex',
  '**/dist/**',
  '**/lib/**',
  // Not '**/build/**', it would ignore packages/docusaurus/src/commands/build
  'website/build',
  'test-website*/build',
  '**/.docusaurus/**',
  '**/__fixtures__/**',
  'node_modules',
  '.yarn',
  '.history',
  'coverage',
  'examples/',
  'packages/lqip-loader/lib/*',
  'packages/docusaurus/lib/*',
  'packages/docusaurus-*/lib/*',
  'packages/eslint-plugin/lib/',
  'packages/stylelint-copyright/lib/',
  'packages/create-docusaurus/lib/*',
  'website/i18n',
  'website/_dogfooding/_swizzle_theme_tests',
  'website/_dogfooding/_asset-tests/badSyntax.js',
  'packages/docusaurus-plugin-ideal-image/src/theme/IdealImageLegacy',
]);

export default defineConfig(plugins, rules, ignores, {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.commonjs,
      JSX: true,
    },
    parserOptions: {
      // projectService: true,
      // JSX runtime is automatic: JSX doesn't use the in-scope "React" variable
      // This lets @typescript-eslint/no-unused-vars report useless React imports
      jsxPragma: null,
    },
  },

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: '19',
    },
  },

  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
});
