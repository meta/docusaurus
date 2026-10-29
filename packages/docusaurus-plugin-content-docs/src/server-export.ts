/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// APIs available to Node.js
// Those are undocumented but used by some third-party plugins
// For this reason it's preferable to avoid doing breaking changes
// See also https://github.com/facebook/docusaurus/pull/6477

export {
  CURRENT_VERSION_NAME,
  VERSIONED_DOCS_DIR,
  VERSIONED_SIDEBARS_DIR,
  VERSIONS_JSON_FILE,
} from './constants';

export {
  filterVersions,
  getDefaultVersionBanner,
  getVersionBadge,
  getVersionBanner,
} from './versions/version';
export {readVersionNames} from './versions/files';
