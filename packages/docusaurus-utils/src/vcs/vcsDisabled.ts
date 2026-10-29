/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {VcsConfig} from '@docusaurus/types';

/**
 * This VCS implementation always returns null values
 */
export const VcsDisabled: VcsConfig = {
  initialize: () => {
    // Noop
  },

  getFileCreationInfo: async (_filePath) => {
    return null;
  },

  getFileLastUpdateInfo: async (_ilePath) => {
    return null;
  },
};
