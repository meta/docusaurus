/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {
  createJsLoaderFactory,
  getCSSExtractPlugin,
  getMinimizers,
  getTargets,
} from '@docusaurus/bundler';
import {
  ASSET_INLINE_MAX_SIZE,
  getAssetRuleUtils,
  md5Hash,
} from '@docusaurus/utils';
import {realpath} from '@docusaurus/fs';
import {loadDocusaurusAliases, loadThemeAliases} from './aliases';
import {BundlerCPUProfilerPlugin} from './plugins/BundlerCPUProfilerPlugin';
import type {Configuration, RuleSetRule} from 'webpack';
import type {Configuration as RspackConfiguration} from '@rspack/core';
import type {ConfigureWebpackUtils, Props} from '@docusaurus/types';

const CSS_REGEX = /\.css$/i;
const CSS_MODULE_REGEX = /\.module\.css$/i;
export const clientDir = path.join(__dirname, '..', 'client');

// The RealContentHashPlugin replaces every occurrence of a provisional chunk
// hash in all assets, even inside unrelated hex strings (asset file
// names, colors, numbers...). The client and server compilations do it
// independently, so a false positive can make the SSG HTML reference a missing
// file. 10 chars instead of 8 makes it ~256x less likely.
// See https://github.com/web-infra-dev/rspack/issues/8474
const contentHash = '[contenthash:10]';

function getReactAliases(siteDir: string): Record<string, string> {
  // Escape hatch
  if (process.env.DOCUSAURUS_NO_REACT_ALIASES) {
    return {};
  }
  const resolveSitePkg = (id: string) =>
    require.resolve(id, {paths: [siteDir]});
  return {
    react: path.dirname(resolveSitePkg('react/package.json')),
    'react-dom': path.dirname(resolveSitePkg('react-dom/package.json')),
    '@mdx-js/react': path.dirname(resolveSitePkg('@mdx-js/react')),
  };
}

export function excludeJS(modulePath: string): boolean {
  // Always transpile client dir
  if (modulePath.startsWith(clientDir)) {
    return false;
  }
  // Don't transpile node_modules except any docusaurus npm package
  return (
    modulePath.includes('node_modules') &&
    !/docusaurus(?:(?!node_modules).)*\.jsx?$/.test(modulePath)
  );
}

export async function createBaseConfig({
  props,
  isServer,
  minify,
  configureWebpackUtils,
}: {
  props: Props;
  isServer: boolean;
  minify: boolean;
  configureWebpackUtils: ConfigureWebpackUtils;
}): Promise<Configuration> {
  const {
    outDir,
    siteDir,
    siteConfig,
    siteConfigPath,
    baseUrl,
    generatedFilesDir,
    routesPaths,
    siteMetadata,
    plugins,
  } = props;
  const totalPages = routesPaths.length;
  const isProd = process.env.NODE_ENV === 'production';
  const minimizeEnabled = minify && isProd;

  const assetRuleUtils = getAssetRuleUtils(isServer);

  const name = isServer ? 'server' : 'client';
  const mode = isProd ? 'production' : 'development';

  const themeAliases = await loadThemeAliases({siteDir, plugins});

  const createJsLoader = await createJsLoaderFactory({siteDir, siteConfig});

  const CSSExtractPlugin = await getCSSExtractPlugin({
    currentBundler: props.currentBundler,
  });

  // Can we share the same cache across locales?
  // Exploring that question at https://github.com/webpack/webpack/issues/13034
  function getCacheName() {
    return `${name}-${mode}-${props.i18n.currentLocale}`;
  }

  // When the version string changes, the cache is evicted
  function getCacheVersion() {
    const versionParts: unknown[] = [
      siteMetadata.docusaurusVersion,
      // Because Webpack does not evict the cache on alias/swizzle changes,
      // See https://github.com/webpack/webpack/issues/13627
      themeAliases,
      // Loader and minimizer options are not part of the cache key
      // Changing the target browsers or Node.js version must evict the cache
      // The same Browserslist queries can match other browsers over time and
      // after data upgrades, for example "baseline widely available"
      getTargets({isServer}),
      // The plugin code computing loader options is not a build dependency
      // Upgrading a third-party plugin must evict the cache
      siteMetadata.pluginVersions,
      // Asset module parser options are not part of the cache key
      // Changing the asset inline max size must evict the cache
      ASSET_INLINE_MAX_SIZE,
    ];
    return md5Hash(JSON.stringify(versionParts));
  }

  // When one of those modules/dependencies change (including transitive
  // deps), cache is invalidated
  function getCacheBuildDependencies(): string[] {
    return [
      __filename,
      path.join(__dirname, isServer ? 'server.js' : 'client.js'),
      // Docusaurus config changes can affect MDX/JSX compilation, so we'd
      // rather evict the cache.
      // See https://github.com/questdb/questdb.io/issues/493
      siteConfigPath,
    ];
  }

  function getCache(): Configuration['cache'] {
    // Use default: memory cache in dev, nothing in prod
    // See https://rspack.dev/config/cache#cache
    const disabledPersistentCacheValue = undefined;

    if (process.env.DOCUSAURUS_NO_PERSISTENT_CACHE) {
      return disabledPersistentCacheValue;
    }
    if (props.currentBundler.name === 'rspack') {
      const rspackCache: RspackConfiguration['cache'] = {
        type: 'persistent',
        // Rspack doesn't have "cache.name" like Webpack
        // This is not ideal but work around is to merge name/version
        // See https://github.com/web-infra-dev/rspack/pull/8920#issuecomment-2658938695
        version: `${getCacheName()}-${getCacheVersion()}`,
        buildDependencies: getCacheBuildDependencies(),
      };
      // Docusaurus bundler configs are typed with Webpack types
      return rspackCache as unknown as Configuration['cache'];
    }

    return {
      type: 'filesystem',
      name: getCacheName(),
      version: getCacheVersion(),
      buildDependencies: {
        config: getCacheBuildDependencies(),
      },
    };
  }

  const notTextImport: RuleSetRule['with'] = {type: {not: 'text'}};

  return {
    mode,
    name,
    cache: getCache(),
    output: {
      pathinfo: false,
      path: outDir,
      filename: isProd ? `assets/js/[name].${contentHash}.js` : '[name].js',
      chunkFilename: isProd
        ? `assets/js/[name].${contentHash}.js`
        : '[name].js',
      publicPath:
        siteConfig.future.experimental_router === 'hash' ? 'auto' : baseUrl,
      hashFunction: 'xxhash64',
    },
    // Don't throw warning when asset created is over 250kb
    performance: {
      hints: false,
    },
    devtool: isProd ? undefined : 'eval-cheap-module-source-map',
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
      symlinks: true, // See https://github.com/facebook/docusaurus/issues/3272
      roots: [
        // Allow resolution of url("/fonts/xyz.ttf") by webpack
        // See https://webpack.js.org/configuration/resolve/#resolveroots
        // See https://github.com/webpack-contrib/css-loader/issues/1256
        ...siteConfig.staticDirectories.map((dir) =>
          path.resolve(siteDir, dir),
        ),
        siteDir,
        process.cwd(),
      ],
      alias: {
        ...getReactAliases(siteDir),
        '@site': siteDir,
        '@generated': generatedFilesDir,
        ...(await loadDocusaurusAliases()),
        ...themeAliases,
      },
      // This allows you to set a fallback for where Webpack should look for
      // modules. We want `@docusaurus/core` own dependencies/`node_modules` to
      // "win" if there is conflict. Example: if there is core-js@3 in user's
      // own node_modules, but core depends on core-js@2, we should use
      // core-js@2.
      modules: [
        path.resolve(__dirname, '..', '..', 'node_modules'),
        'node_modules',
        path.resolve(await realpath(process.cwd()), 'node_modules'),
      ],
    },
    resolveLoader: {
      modules: ['node_modules', path.join(siteDir, 'node_modules')],
    },
    optimization: {
      // The optimization.mergeDuplicateChunks is expensive
      // - On the server, it's not useful to run it at all
      // - On the client, we compared assets/js before/after and see 0 change
      //   `du -sk js-before js-after` => the JS assets have the exact same size
      // See also https://github.com/facebook/docusaurus/pull/11176
      mergeDuplicateChunks: false,

      // Only minimize client bundle in production because server bundle is only
      // used for static site generation
      minimize: minimizeEnabled,
      minimizer: minimizeEnabled
        ? await getMinimizers({currentBundler: props.currentBundler})
        : undefined,
      splitChunks: isServer
        ? false
        : {
            // Since the chunk name includes all origin chunk names it's
            // recommended for production builds with long term caching to NOT
            // include [name] in the filenames
            name: false,
            cacheGroups: {
              // Disable the built-in cacheGroups
              default: false,
              common: {
                name: 'common',
                minChunks: totalPages > 2 ? totalPages * 0.5 : 2,
                priority: 40,
              },
              // Only create one CSS file to avoid
              // problems with code-split CSS loading in different orders
              // causing inconsistent/non-deterministic styling
              // See https://github.com/facebook/docusaurus/issues/2006
              styles: {
                name: 'styles',
                type: 'css/mini-extract',
                chunks: `all`,
                enforce: true,
                priority: 50,
              },
            },
          },
    },
    module: {
      parser: {
        javascript: {
          // Allow referencing assets with the standard and portable syntax:
          // new URL('./img.png', import.meta.url)
          // Relative URLs are needed for SSR: absolute URLs would otherwise
          // be resolved against the server bundle file:// URL
          // See https://github.com/facebook/docusaurus/pull/12655
          url: 'relative',
        },
      },
      rules: [
        assetRuleUtils.rules.assets(),
        {
          test: /\.[jt]sx?$/i,
          exclude: excludeJS,
          with: notTextImport,
          use: [createJsLoader({isServer})],
        },
        {
          test: CSS_REGEX,
          exclude: CSS_MODULE_REGEX,
          with: notTextImport,
          use: configureWebpackUtils.getStyleLoaders(isServer, {
            importLoaders: 1,
            sourceMap: !isProd,
          }),
        },
        // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
        // using the extension .module.css
        {
          test: CSS_MODULE_REGEX,
          with: notTextImport,
          use: configureWebpackUtils.getStyleLoaders(isServer, {
            modules: {
              // Using the same CSS Module class pattern in dev/prod on purpose
              // See https://github.com/facebook/docusaurus/pull/10423
              localIdentName: `[local]_[contenthash:base64:4]`,
              exportOnlyLocals: isServer,
              // Export CSS module class names compatible with css-loader v6
              // export ".themedComponent--dark" instead of .themedComponentDark
              // See https://github.com/webpack/css-loader/releases/tag/v7.0.0
              exportLocalsConvention: 'as-is',
            },
            importLoaders: 1,
            sourceMap: !isProd,
          }),
        },
      ],
    },
    plugins: [
      new CSSExtractPlugin({
        filename: isProd
          ? `assets/css/[name].${contentHash}.css`
          : '[name].css',
        chunkFilename: isProd
          ? `assets/css/[name].${contentHash}.css`
          : '[name].css',
        // Remove css order warnings if css imports are not sorted
        // alphabetically. See https://github.com/webpack-contrib/mini-css-extract-plugin/pull/422
        // for more reasoning
        ignoreOrder: true,
      }),
      process.env.DOCUSAURUS_BUNDLER_CPU_PROFILE &&
        new BundlerCPUProfilerPlugin(),
    ].filter(Boolean),
  };
}
