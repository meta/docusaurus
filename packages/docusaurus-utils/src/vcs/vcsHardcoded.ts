/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {VcsConfig, VcsChangeInfo} from '@docusaurus/types';

export const VCS_HARDCODED_CREATION_INFO: VcsChangeInfo = {
  timestamp: 1490997600000, // 1st Apr 2017
  author: 'Creator',
};

export const VCS_HARDCODED_LAST_UPDATE_INFO: VcsChangeInfo = {
  timestamp: 1539502055000, // 14th Oct 2018
  author: 'Author',
};

export const VCS_HARDCODED_UNTRACKED_FILE_PATH = `file/path/${Math.random()}.mdx`;

/**
 * This VCS implementation always returns hardcoded values for testing purposes.
 * It is also useful in dev environments where VCS info is not important.
 * Reading information from the VCS can be slow and is not always necessary.
 */
export const VcsHardcoded: VcsConfig = {
  initialize: () => {
    // Noop
  },

  getFileCreationInfo: async (filePath: string) => {
    if (filePath === VCS_HARDCODED_UNTRACKED_FILE_PATH) {
      return null;
    }
    return VCS_HARDCODED_CREATION_INFO;
  },

  getFileLastUpdateInfo: async (filePath: string) => {
    if (filePath === VCS_HARDCODED_UNTRACKED_FILE_PATH) {
      return null;
    }
    return VCS_HARDCODED_LAST_UPDATE_INFO;
  },
};
