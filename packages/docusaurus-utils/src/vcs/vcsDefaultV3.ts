/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {VcsHardcoded} from './vcsHardcoded';
import {VcsGitAdHoc} from './vcsGitAdHoc';
import type {VcsConfig} from '@docusaurus/types';

function getDynamicStrategy(): VcsConfig {
  return process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
    ? VcsHardcoded
    : VcsGitAdHoc;
}

/**
 * This VCS implements the historical Docusaurus v3 Git automatic strategy.
 * It is only enabled in production mode, using ad-hoc git log commands.
 */
export const VcsDefaultV3: VcsConfig = {
  initialize: (...params) => {
    return getDynamicStrategy().initialize(...params);
  },
  getFileCreationInfo: (...params) => {
    return getDynamicStrategy().getFileCreationInfo(...params);
  },
  getFileLastUpdateInfo: (...params) => {
    return getDynamicStrategy().getFileLastUpdateInfo(...params);
  },
};
