/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {fileURLToPath} from 'node:url';
import {defineConfig, type ViteUserConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

import {transformWithOxc} from 'vite';

// Force UTC so snapshots involving dates are stable across local & CI runs.
process.env.TZ = 'UTC';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

const ignorePatterns = [
  '.claude',
  '.codex',
  '**/node_modules/**',
  '**/__fixtures__/**',
  '**/__mocks__/**',
  '**/testUtils.ts',
  // Built outputs — we test sources, not the compiled `lib/`.
  '**/packages/docusaurus/lib/**',
  '**/packages/docusaurus-logger/lib/**',
  '**/packages/docusaurus-utils/lib/**',
  '**/packages/docusaurus-utils-common/lib/**',
  '**/packages/docusaurus-utils-validation/lib/**',
  '**/packages/docusaurus-plugin-content-blog/lib/**',
  '**/packages/docusaurus-plugin-content-docs/lib/**',
  '**/packages/docusaurus-plugin-content-pages/lib/**',
  '**/packages/docusaurus-theme-classic/lib/**',
  '**/packages/docusaurus-theme-common/lib/**',
  '**/test/**',
  '**/argos/**',
];

type AliasOptions = NonNullable<ViteUserConfig['resolve']>['alias'];

const resolveAliases: AliasOptions = [
  // Resolve `@docusaurus/<exportName>` to `docusaurus-core` source files
  {
    find: /^@docusaurus\/(BrowserOnly|ComponentCreator|constants|ExecutionEnvironment|Head|Interpolate|isInternalUrl|Link|Noop|renderRoutes|router|Translate|use.*)$/,
    replacement: `${rootDir}packages/docusaurus/src/client/exports/$1`,
  },

  // Stub `@generated/*` modules for tests
  {find: /^@generated\/.*/, replacement: `${rootDir}test/emptyModule.ts`},

  // Resolve `@theme/*` aliases to theme-classic components
  // This won't always be true, but good enough for now
  {
    find: /^@theme\/(.*)$/,
    replacement: `${rootDir}packages/docusaurus-theme-classic/src/theme/$1`,
  },

  // Resolve `@site/*` aliases against our own website
  // Because our own site can have tests involving that alias
  {find: /^@site\/(.*)$/, replacement: `${rootDir}website/$1`},

  // Resolving content plugins client exports to src instead of lib
  // This way, tests work without having to rebuild those packages
  {
    find: /^@docusaurus\/plugin-content-(docs|blog|pages)\/client$/,
    replacement: `${rootDir}packages/docusaurus-plugin-content-$1/src/client/index.ts`,
  },
  // Resolve content plugins (bare package) to src instead of lib.
  {
    find: /^@docusaurus\/plugin-content-(docs|blog|pages)$/,
    replacement: `${rootDir}packages/docusaurus-plugin-content-$1/src/index.ts`,
  },
  // Resolve @docusaurus/utils to src instead of lib.
  {
    find: /^@docusaurus\/utils$/,
    replacement: `${rootDir}packages/docusaurus-utils/src/index.ts`,
  },
  // Resolve @docusaurus/glob to src instead of lib.
  {
    find: /^@docusaurus\/glob$/,
    replacement: `${rootDir}packages/docusaurus-glob/src/index.ts`,
  },
  // Resolve @docusaurus/fs to src instead of lib.
  {
    find: /^@docusaurus\/fs$/,
    replacement: `${rootDir}packages/docusaurus-fs/src/index.ts`,
  },
  // Resolve @docusaurus/utils-validation to src instead of lib.
  {
    find: /^@docusaurus\/utils-validation$/,
    replacement: `${rootDir}packages/docusaurus-utils-validation/src/index.ts`,
  },
];

// Apparently Vitest can't interpret .js files as JSX?
// and we have many files like that in theme lib/theme output dir
// Not sure why we need this to ensure .js files are parsed as JSX by Oxc
// This must be configurable??? But can't find how
function docusaurusJsAsJsx() {
  return {
    name: 'docusaurus-js-as-jsx',
    enforce: 'pre' as const,
    async transform(code: string, id: string) {
      const cleanId = id.split('?')[0];
      if (
        cleanId.endsWith('.js') &&
        cleanId.includes('/packages/docusaurus-')
      ) {
        return transformWithOxc(code, cleanId, {
          lang: 'jsx',
        });
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [docusaurusJsAsJsx(), react()],
  resolve: {
    alias: resolveAliases,
  },
  test: {
    setupFiles: ['test/setup.ts'],
    environment: 'node',
    environmentOptions: {
      jsdom: {
        url: 'https://docusaurus.io/',
      },
    },
    // Default 5s timeout often fails on Windows runners.
    // See https://github.com/facebook/docusaurus/pull/8259
    testTimeout: 25000,
    include: [
      // Vitest default
      '**/*.{test,spec}.?(c|m)[jt]s?(x)',
      // Legacy code, forked from react-ideal-image
      'packages/docusaurus-plugin-ideal-image/src/theme/IdealImageLegacy/__tests__/*.js',
    ],
    exclude: ignorePatterns,
    snapshotSerializers: [
      // TOP: applied last
      // Capture Error.cause in snapshots, see https://github.com/vitest-dev/vitest/issues/10339
      `test/snapshotErrorCause.ts`,
      // Normalize absolute/Windows/posix/temp paths across machines/CI.
      `test/snapshotPathNormalizer.ts`,
      // Turns ANSI escape sequences into human-readable `<cyan>…</color>` tags
      'jest-serializer-ansi-escapes',
      // Serializes react-helmet-async output predictably.
      'jest-serializer-react-helmet-async',
      // BOTTOM: applied first
    ],
  },
});
