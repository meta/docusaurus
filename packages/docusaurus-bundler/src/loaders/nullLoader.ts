/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A loader returning an empty module, used to ignore some imports
// Replaces the unmaintained null-loader package and its outdated dependencies
// See https://github.com/webpack-contrib/null-loader

export default function nullLoader(): string {
  return '';
}

// Pitching short-circuits the loader chain: the file isn't even read
export function pitch(): string {
  return '';
}
