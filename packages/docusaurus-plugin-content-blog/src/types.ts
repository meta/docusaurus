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
  siteDir: string;
  // Mutable map (see contentHelpers), keyed by aliased source path.
  // Used to rebase in-page anchor links in truncated previews, see #9731.
  sourceToPermalink: Map<string, string>;
};
