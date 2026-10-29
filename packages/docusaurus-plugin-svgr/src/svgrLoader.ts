/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {
  getAssetRuleUtils,
  findAssetRule,
  posixPath,
  simpleHash,
} from '@docusaurus/utils';

import type {SVGRConfig, SVGOConfig} from './options';
import type {Configuration, RuleSetRule} from 'webpack';

// SVGO minifies the ids of each SVG file independently (cleanupIds plugin),
// so most SVGs end up using the same short ids ("a", "b"...) for their
// gradients, masks, clip paths... When several SVGs are inlined in the same
// page, these ids clash and SVGs render with each other's gradients/masks.
// We prefix ids with a short hash of the SVG file path to make them unique.
// The path is relative to the site dir so that ids are stable across machines.
// See https://github.com/facebook/docusaurus/issues/8297
// See https://github.com/facebook/docusaurus/issues/10679
function getSVGIdPrefix({
  siteDir,
  filePath,
}: {
  siteDir: string;
  filePath: string;
}): string {
  const relativeFilePath = posixPath(path.relative(siteDir, filePath));
  return `svg-${simpleHash(relativeFilePath, 6)}-`;
}

function createDefaultSVGOConfig({siteDir}: {siteDir: string}): SVGOConfig {
  return {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeTitle: false,
            removeViewBox: false,
          },
        },
      },
      {
        name: 'prefixIds',
        params: {
          delim: '',
          prefix: (_node: unknown, info: {path?: string}) =>
            getSVGIdPrefix({siteDir, filePath: info.path ?? ''}),
          // Class names are left untouched on purpose: users may target them
          // with their own CSS to style inline SVGs
          prefixClassNames: false,
        },
      },
    ],
  };
}

function createDefaultSVGRConfig({siteDir}: {siteDir: string}): SVGRConfig {
  return {
    prettier: false,
    svgo: true,
    svgoConfig: createDefaultSVGOConfig({siteDir}),
    titleProp: true,
  };
}

type Params = {siteDir: string; isServer: boolean; svgrConfig: SVGRConfig};

export function createSVGRConfig({
  siteDir,
  svgrConfig,
}: Pick<Params, 'siteDir' | 'svgrConfig'>): SVGRConfig {
  return {
    ...createDefaultSVGRConfig({siteDir}),
    ...svgrConfig,
  };
}

function createSVGRRule(params: Params): RuleSetRule {
  return {
    loader: require.resolve('@svgr/webpack'),
    options: createSVGRConfig(params),
  };
}

export function enhanceConfig(config: Configuration, params: Params): void {
  const utils = getAssetRuleUtils(params.isServer);

  const {parentRules, rule: existingSvgRule} = (() => {
    const result = findAssetRule({
      rules: config?.module?.rules as RuleSetRule[],
      test: utils.rules.svgs().test,
    });
    if (!result) {
      throw new Error(
        "Docusaurus built-in SVG rule couldn't be found. The SVGR plugin can't enhance it.",
      );
    }
    return result;
  })();

  const newSvgRule: RuleSetRule = {
    test: /\.svg$/i,
    with: {type: {not: 'text'}},
    oneOf: [
      {
        use: [createSVGRRule(params)],
        // SVGR components are JS modules, not assets
        type: 'javascript/auto',
        // new URL('./img.svg', import.meta.url) references the SVG asset URL
        dependency: {not: 'url'},
        // We don't want to use SVGR loader for non-React source code
        // ie we don't want to use SVGR for CSS files...
        issuer: {
          and: [/\.(?:tsx?|jsx?|mdx?)$/i],
        },
      },
      existingSvgRule,
    ],
  };

  // This is annoying, but we have to "wrap" the existing SVG rule
  // Adding another extra SVG rule (first or last) will not "override"
  // the default: both rules will be applied (from last to bottom) leading to
  // conflicting behavior.
  const index = parentRules.indexOf(existingSvgRule);
  parentRules[index] = newSvgRule;
}
