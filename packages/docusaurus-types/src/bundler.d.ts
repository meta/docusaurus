/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type webpack from 'webpack';

// We use Webpack and Rspack interchangeably because most Rspack APIs are
// compatible with Webpack. So it's ok to use Webpack types for Rspack too.
// When compatibility doesn't work, use "CurrentBundler.name"
// See https://github.com/facebook/docusaurus/pull/10402
export type CurrentBundler = {
  name: 'webpack' | 'rspack';
  instance: typeof webpack;
};
