/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ContentPaths} from '@docusaurus/utils';

export type BlogContentPaths = ContentPaths;

export type BlogMarkdownLoaderOptions = {
  truncateMarker: RegExp;
};
