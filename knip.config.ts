/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {KnipConfig, KnipConfiguration} from 'knip';

type WorkspaceConfig = NonNullable<KnipConfiguration['workspaces']>[string];

// Plugins and themes expose their theme components through getThemePath():
// all these files can be resolved through the @theme/* alias or swizzled.
function themePackageConfig({
  entry = [],
  ...rest
}: WorkspaceConfig = {}): WorkspaceConfig {
  return {
    entry: ['src/theme/**/*.{js,jsx,ts,tsx}!', ...[entry].flat()],
    ...rest,
  };
}

// `pnpm lint:knip:public-api` passes --include-entry-exports to report the
// unused exports of package entry points. They are public API that sites,
// plugins and themes can use: only warn about them, see AGENTS.md
const publicApiConfig: KnipConfiguration = {
  rules: {exports: 'warn', types: 'warn'},
  // Public API used in ways Knip can't follow
  ignoreIssues: {
    // Theme components, resolved through @theme/* aliases or swizzled
    'packages/*/src/theme/**': ['exports', 'types'],
    // Plugin and theme modules: Docusaurus loads their values by name from the
    // site config
    'packages/docusaurus-{plugin,preset}-*/src/index.ts': ['exports'],
    'packages/docusaurus-theme-!(common|translations)/src/index.ts': [
      'exports',
    ],
    // Core has no package entry point: Docusaurus loads its files by path or
    // through the @docusaurus/* and @theme/* aliases
    'packages/docusaurus/**': ['exports', 'types'],
    // Knip doesn't link the imports of @docusaurus/types to this package
    'packages/docusaurus-types/**': ['exports', 'types'],
  },
};

// Knip calls this function with its parsed CLI arguments
//
// Entry patterns ending with "!" are production entries:
// - `knip` ignores this suffix and starts from all entries, tests included
// - `knip --production` only starts from production entries and skips tests
// The package.json main/exports/bin fields are production entries, but the
// entries written here need the suffix. A leading "!" is an unrelated negation.
// See https://knip.dev/features/production-mode
const config: KnipConfig = ({
  production,
  'include-entry-exports': includeEntryExports,
}) => ({
  // Production mode reports the exports only used by tests, except the ones
  // also used in their own file: they are often exported to be tested
  ignoreExportsUsedInFile: production,
  // Fail on useless configuration entries
  treatConfigHintsAsErrors: true,
  ignore: ['**/__fixtures__/**'],
  ignoreDependencies: [
    // Docusaurus client API aliases, see packages/docusaurus/src/client/exports
    // Plugins and themes depend on @docusaurus/core for these aliases
    /^@docusaurus\/(?:BrowserOnly|ComponentCreator|constants|ErrorBoundary|ExecutionEnvironment|Head|Interpolate|isInternalUrl|Link|Noop|renderRoutes|router|Translate|use[A-Z]\w*)$/,
    '@docusaurus/core',
    // Docusaurus theme aliases and generated modules
    /^@(?:theme|theme-init|theme-original|generated)\//,
    /^@site\//,
    // Compiled code imports helpers, see importHelpers in tsconfig.base.json
    'tslib',
  ],
  ignoreBinaries: [
    // System binaries
    'awk',
    'openssl',
    // Not installed, expected to be run through npx
    'serve',
  ],
  workspaces: {
    '.': {
      entry: [
        // Vitest alias for @generated/* modules
        'test/emptyModule.ts',
      ],
      ignore: ['examples/**'],
      ignoreDependencies: [
        // Only needed to typecheck DocSearch
        '@ai-sdk/react',
        // Resolved by tests through Vitest aliases
        '@docusaurus/plugin-content-blog',
        '@docusaurus/plugin-content-pages',
      ],
      ignoreBinaries: [
        // False positives, not binaries
        'create',
        'typecheck',
      ],
    },
    'admin/new.docusaurus.io': {
      // Knip enables this plugin from dependencies, but the site has none
      // The plugin reads functions entry points from netlify.toml
      netlify: true,
    },
    'admin/scripts': {
      // Run directly with node, or through the package bin commands
      entry: ['*.js'],
    },
    'packages/create-docusaurus': {
      // Used to test the CLI package
      ignoreBinaries: ['create-docusaurus'],
    },
    'packages/docusaurus': {
      entry: [
        // Programmatic API, imported by bin/docusaurus.mjs as lib/index.js
        'src/index.ts!',
        // Resolved with path.join(__dirname, ...)
        'src/client/clientEntry.tsx!',
        'src/client/serverEntry.tsx!',
        'src/client/exports/*.{ts,tsx}!',
        'src/client/theme-fallback/**/*.tsx!',
        'src/ssg/ssgWorkerThread.ts!',
        // Ambient declarations with triple-slash directives
        'src/**/*.d.ts!',
      ],
      ignoreDependencies: [
        // Resolved from the site dir, only when using a theme
        '@docusaurus/theme-common',
      ],
    },
    'packages/docusaurus-module-type-aliases': {
      // Knip doesn't detect imports in "declare module" blocks
      ignoreDependencies: [/.*/],
    },
    'packages/docusaurus-plugin-content-blog': {
      // Knip doesn't detect imports in "declare module" blocks
      ignoreDependencies: ['utility-types'],
    },
    'packages/docusaurus-plugin-content-docs': {
      // Knip doesn't detect imports in "declare module" blocks
      ignoreDependencies: ['@types/react-router-config'],
    },
    'packages/docusaurus-plugin-debug': themePackageConfig(),
    // Client modules are resolved through getClientModules()
    'packages/docusaurus-plugin-google-gtag': {
      entry: ['src/gtag.ts!', 'src/vendor-gtag.ts!'],
    },
    'packages/docusaurus-plugin-ideal-image': themePackageConfig({
      entry: [
        // Internal modules of the react-ideal-image fork, not theme components
        '!src/theme/IdealImageLegacy/components/**',
      ],
    }),
    'packages/docusaurus-plugin-pwa': themePackageConfig({
      entry: ['src/registerSw.ts!', 'src/sw.ts!'],
    }),
    'packages/docusaurus-plugin-vercel-analytics': {
      entry: ['src/analytics.ts!'],
    },
    'packages/docusaurus-theme-classic': themePackageConfig({
      entry: ['src/nprogress.ts!', 'src/prism-include-languages.ts!'],
      ignoreDependencies: [
        // Resolved with require.resolve(`infima/...`)
        'infima',
        // Knip doesn't detect imports in "declare module" blocks
        '@docusaurus/mdx-loader',
        'utility-types',
      ],
    }),
    'packages/docusaurus-theme-live-codeblock': themePackageConfig(),
    'packages/docusaurus-theme-mermaid': themePackageConfig(),
    'packages/docusaurus-types': {
      // All types are public: this package has no exports field
      entry: ['src/*.d.ts!'],
    },
    'packages/docusaurus-theme-search-algolia': themePackageConfig({
      // Knip doesn't detect imports in "declare module" blocks
      ignoreDependencies: ['utility-types'],
    }),
    website: {
      entry: [
        'docusaurus.config*.{js,ts}!',
        'sidebars*.{js,ts}!',
        '*.d.json.ts!',
        '_dogfooding/*-sidebars.js!',
        '_dogfooding/{clientModuleExample,migrateStorageNamespace}.ts!',
        '_dogfooding/_{docs,blog,pages} tests/**/*.{js,jsx,ts,tsx}!',
        '**/*.mdx!',
        // Knip ignores MDX imports in ```mdx-code-block fences
        'src/components/**/*.{js,jsx,ts,tsx}!',
        'blog/**/*.{js,jsx,ts,tsx}!',
        'src/theme/**/*.{js,jsx,ts,tsx}!',
        'src/plugins/changelog/index.ts!',
        'src/plugins/changelog/theme/**/*.{js,jsx,ts,tsx}!',
        'src/plugins/featureRequests/FeatureRequestsPlugin.js!',
        'src/plugins/featureRequests/FeatureRequestsPage.tsx!',
        'src/sw.js!',
      ],
      ignore: [
        // Intentionally broken files for testing purposes
        '_dogfooding/_asset-tests/**',
      ],
      ignoreDependencies: [
        // Plugins and themes referenced by short name in docusaurus.config.ts
        '@docusaurus/plugin-pwa',
        '@docusaurus/plugin-rsdoctor',
        '@docusaurus/theme-mermaid',
        // Netlify build plugin, see netlify.toml
        'netlify-plugin-cache',
        // Used by theme components ejected in CI, see testSwizzleThemeClassic.mjs
        '@docusaurus/utils-common',
        '@types/prismjs',
        'copy-text-to-clipboard',
        'prismjs',
        'utility-types',
        // Imported in ```mdx-code-block fences
        'react-medium-image-zoom',
        // Used by versioned docs through !!raw-loader! imports
        'raw-loader',
        // Peer dependency of raw-loader
        'webpack',
      ],
    },
  },
  ...(includeEntryExports ? publicApiConfig : {}),
});

export default config;
