/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {VcsHardcoded} from './vcsHardcoded';
import {VscGitEager} from './vcsGitEager';
import type {VcsConfig} from '@docusaurus/types';

function getStrategy(): VcsConfig {
  return process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
    ? VcsHardcoded
    : VscGitEager;
}

/**
 * This VCS implements the default eager Git automatic strategy.
 * It is only enabled in production mode, reading the git repository eagerly.
 */
export const VcsDefault: VcsConfig = {
  initialize: (...params) => {
    return getStrategy().initialize(...params);
  },
  getFileCreationInfo: (...params) => {
    return getStrategy().getFileCreationInfo(...params);
  },
  getFileLastUpdateInfo: (...params) => {
    return getStrategy().getFileLastUpdateInfo(...params);
  },
};
