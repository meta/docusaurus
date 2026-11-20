/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Plugin} from '../../../packages/docusaurus-types/src/index';

export const plugin: Plugin = {
  name: 'example-plugin',
  configureWebpack(config) {
    return {
      devServer: {
        ...config.devServer,
        open: '/docs',
        client: {overlay: false},
      },
      optimization: {minimize: false},
      mergeStrategy: {'module.rules': 'prepend'},
    };
  },
};

type WebpackResult = Exclude<
  ReturnType<NonNullable<Plugin['configureWebpack']>>,
  void
>;

export const invalidConfig: WebpackResult = {
  devServer: {
    // @ts-expect-error The dev server open option does not accept numbers.
    open: 42,
  },
};
