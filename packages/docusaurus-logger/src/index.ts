/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import OriginalLogger from './logger';

export default OriginalLogger;

// Extra named export to avoid problems in ESM modules
// Notably: core .mjs CLI + create-docusaurus
// See https://github.com/facebook/docusaurus/pull/6661
// See https://github.com/facebook/docusaurus/pull/7295
export const logger = OriginalLogger;

export {PerfLogger} from './perfLogger';
