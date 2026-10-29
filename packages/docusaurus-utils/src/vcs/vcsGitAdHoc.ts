/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getGitLastUpdate, getGitCreation} from './gitUtils';
import type {VcsConfig} from '@docusaurus/types';

/**
 * A VCS strategy to query Git information in an ad-hoc way.
 * This is the default/historical Docusaurus Git VCS implementation.
 * Unfortunately, it is a major bottleneck for large sites/repositories.
 *
 * See also https://github.com/facebook/docusaurus/issues/11208
 */
export const VcsGitAdHoc: VcsConfig = {
  initialize: () => {
    // Nothing to do here for the default/historical Git implementation
  },

  getFileCreationInfo: async (filePath: string) => {
    return getGitCreation(filePath);
  },

  getFileLastUpdateInfo: async (filePath: string) => {
    return getGitLastUpdate(filePath);
  },
};
