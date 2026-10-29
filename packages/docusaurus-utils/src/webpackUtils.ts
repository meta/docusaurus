/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {
  ASSET_INLINE_MAX_SIZE,
  OUTPUT_STATIC_ASSETS_DIR_NAME,
} from './constants';
import type {RuleSetRule, LoaderContext} from 'webpack';

export type WebpackCompilerName = 'server' | 'client';

export function getWebpackLoaderCompilerName(
  context: LoaderContext<unknown>,
): WebpackCompilerName {
  const compilerName = context._compiler?.name;
  switch (compilerName) {
    case 'server':
    case 'client':
      return compilerName;
    default:
      throw new Error(
        `Cannot get valid Docusaurus webpack compiler name. Found compilerName=${compilerName}`,
      );
  }
}

type AssetFolder = 'images' | 'files' | 'fonts' | 'medias';

/**
 * How an asset request created with `createAssetRequest()` is handled:
 * - `image`: emitted as an image file, or inlined as a data URL if small
 * - `image-file`: always emitted as an image file, never inlined
 * - `file`: always emitted as a file, whatever its extension
 */
export type AssetRequestType = 'image' | 'image-file' | 'file';

const AssetRequestQueryParam = 'docusaurus-asset';

/**
 * Creates a request that always resolves to an asset URL string, for
 * Docusaurus-generated code (Markdown images, links, front matter assets...).
 *
 * The `!` prefix disables the configured normal loaders, and the resource query
 * selects a dedicated asset rule. This way, other plugins (ideal-image,
 * SVGR...) do not transform those assets.
 * See https://webpack.js.org/concepts/loaders/#inline
 *
 * @param assetPath the already escaped asset path to require
 * @param search an optional user-provided query string, starting with `?`
 */
export function createAssetRequest({
  assetPath,
  search,
  type,
}: {
  assetPath: string;
  search?: string;
  type: AssetRequestType;
}): string {
  const query = `${AssetRequestQueryParam}=${type}`;
  return `!${assetPath}${search ? `${search}&${query}` : `?${query}`}`;
}

type AssetRuleUtils = {
  rules: {
    /**
     * The single rule handling all assets, made of the rules below.
     * It is a `oneOf` rule: the first matching child rule wins.
     */
    assets: () => RuleSetRule;
    images: () => RuleSetRule;
    svgs: () => RuleSetRule;
    fonts: () => RuleSetRule;
    media: () => RuleSetRule;
    otherAssets: () => RuleSetRule;
  };
};

function createAssetRuleUtils({isServer}: {isServer: boolean}): AssetRuleUtils {
  const generator = (folder: AssetFolder) => ({
    filename: path.posix.join(
      OUTPUT_STATIC_ASSETS_DIR_NAME,
      folder,
      '[name]-[contenthash][ext]',
    ),
    // The server compilation does not need to emit assets
    emit: !isServer,
  });

  // An asset emitted as a file, or inlined as a data URL if small enough
  const asset = (folder: AssetFolder): RuleSetRule => ({
    type: 'asset',
    parser: {dataUrlCondition: {maxSize: ASSET_INLINE_MAX_SIZE ?? 10000}},
    generator: generator(folder),
  });

  // An asset always emitted as a file
  const assetResource = (folder: AssetFolder): RuleSetRule => ({
    type: 'asset/resource',
    generator: generator(folder),
  });

  const assetRequestRule = (
    type: AssetRequestType,
    rule: RuleSetRule,
  ): RuleSetRule => ({
    resourceQuery: new RegExp(`[?&]${AssetRequestQueryParam}=${type}(?:&|$)`),
    ...rule,
  });

  const rules: AssetRuleUtils['rules'] = {
    assets: () => ({
      with: {type: {not: 'text'}},
      oneOf: [
        // Requests created with createAssetRequest() come first on purpose
        // They must not be handled by other asset rules (ideal-image, SVGR...)
        assetRequestRule('image', asset('images')),
        assetRequestRule('image-file', assetResource('images')),
        assetRequestRule('file', assetResource('files')),
        rules.images(),
        rules.svgs(),
        rules.fonts(),
        rules.media(),
        rules.otherAssets(),
      ],
    }),

    images: () => ({
      test: /\.(?:ico|jpe?g|png|gif|webp|avif)$/i,
      ...asset('images'),
    }),

    /**
     * The SVG rule is isolated on purpose: our SVGR plugin enhances it
     * See https://github.com/facebook/docusaurus/pull/10820
     */
    svgs: () => ({
      test: /\.svg$/i,
      ...asset('images'),
    }),

    fonts: () => ({
      test: /\.(?:woff2?|eot|ttf|otf)$/i,
      ...asset('fonts'),
    }),

    media: () => ({
      test: /\.(?:mp4|avi|mov|mkv|mpg|mpeg|vob|wmv|m4v|webm|ogv|wav|mp3|m4a|aac|oga|flac)$/i,
      ...asset('medias'),
    }),

    otherAssets: () => ({
      test: /\.(?:pdf|docx?|xlsx?|zip|rar)$/i,
      ...assetResource('files'),
    }),
  };

  return {rules};
}

const AssetRuleUtilsMap = {
  server: createAssetRuleUtils({isServer: true}),
  client: createAssetRuleUtils({isServer: false}),
};

/**
 * Returns the bundler asset module rules to be used for various file types.
 * Inspired by https://github.com/gatsbyjs/gatsby/blob/8e6e021014da310b9cc7d02e58c9b3efe938c665/packages/gatsby/src/utils/webpack-utils.ts#L447
 */
export function getAssetRuleUtils(isServer: boolean): AssetRuleUtils {
  return isServer ? AssetRuleUtilsMap.server : AssetRuleUtilsMap.client;
}

/**
 * Finds a rule in the asset `oneOf` rule, so that plugins can enhance it.
 * The rule is found by comparing its `test` condition.
 */
export function findAssetRule({
  rules,
  test,
}: {
  rules: RuleSetRule[];
  test: RuleSetRule['test'];
}): {parentRules: RuleSetRule[]; rule: RuleSetRule} | undefined {
  for (const rule of rules) {
    if (String(rule.test) === String(test)) {
      return {parentRules: rules, rule};
    }
    if (rule.oneOf) {
      const result = findAssetRule({
        rules: rule.oneOf as RuleSetRule[],
        test,
      });
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}
