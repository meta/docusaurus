/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  VCS_HARDCODED_CREATION_INFO,
  VCS_HARDCODED_LAST_UPDATE_INFO,
  VCS_HARDCODED_UNTRACKED_FILE_PATH,
  VcsHardcoded,
} from './vcsHardcoded';
import {VcsGitAdHoc} from './vcsGitAdHoc';
import {VscGitEager} from './vcsGitEager';
import {VcsDisabled} from './vcsDisabled';
import {VcsDefault} from './vcsDefault';
import {VcsDefaultV3} from './vcsDefaultV3';
import type {VcsConfig, VcsPreset} from '@docusaurus/types';

const VcsPresets: Record<VcsPreset, VcsConfig> = {
  'git-ad-hoc': VcsGitAdHoc,
  'git-eager': VscGitEager,
  hardcoded: VcsHardcoded,
  disabled: VcsDisabled,

  default: VcsDefault,
  'default-v3': VcsDefaultV3,
};

export const VcsPresetNames = Object.keys(VcsPresets) as VcsPreset[];

function findVcsPreset(presetName: string): VcsConfig | undefined {
  return VcsPresets[presetName as VcsPreset];
}

export function getVcsPreset(presetName: VcsPreset): VcsConfig {
  const vcs = findVcsPreset(presetName);
  if (vcs) {
    return vcs;
  } else {
    throw new Error(
      `Unknown Docusaurus VCS preset name: ${process.env.DOCUSAURUS_VCS}`,
    );
  }
}

// Convenient export for writing unit tests depending on VCS
export const TEST_VCS = {
  CREATION_INFO: VCS_HARDCODED_CREATION_INFO,
  LAST_UPDATE_INFO: VCS_HARDCODED_LAST_UPDATE_INFO,
  UNTRACKED_FILE_PATH: VCS_HARDCODED_UNTRACKED_FILE_PATH,
  ...VcsHardcoded,
};
