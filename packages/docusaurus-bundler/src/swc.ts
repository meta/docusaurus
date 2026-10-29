/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getClientQueries, getServerTargets} from './browserslist';
import type {SwcLoaderOptions} from '@rspack/core';

export function getSwcLoaderOptions({
  isServer,
}: {
  isServer: boolean;
}): SwcLoaderOptions {
  return {
    env: {
      // Rspack resolves the client queries with its own Browserslist data
      targets: isServer ? getServerTargets() : getClientQueries(),
    },
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
      experimental: {
        // Required to match import attributes in rules, see
        // https://rspack.rs/config/module-rules#ruleswith
        keepImportAttributes: true,
      },
    },
  };
}
