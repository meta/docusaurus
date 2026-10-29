/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MinimizerPlugin from 'minimizer-webpack-plugin';

// The minimizer-webpack-plugin built-in minify functions, without getTypes()
// Otherwise, the plugin also minifies the source that modules embed in JS
// Text imports (with {type: 'text'}) must remain the raw file content
// See https://github.com/webpack/minimizer-webpack-plugin#embedded-source
function withoutEmbeddedSource<Fn extends (...args: never[]) => unknown>(
  minify: Fn,
): Fn {
  const copy = (...args: Parameters<Fn>) => minify(...args);
  return Object.assign(copy, minify, {getTypes: undefined}) as unknown as Fn;
}

// Required by module path in the plugin's worker processes
export const swcMinify = withoutEmbeddedSource(MinimizerPlugin.swcMinify);

export const lightningCssMinify = withoutEmbeddedSource(
  MinimizerPlugin.lightningCssMinify,
);
