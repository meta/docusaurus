/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import type {UpdateInfo} from 'update-notifier';
import {ignoreUpdate} from '../beforeCli.mjs';

describe('beforeCli ignoreUpdate', () => {
  it('returns false when update is undefined or current is missing', () => {
    expect(ignoreUpdate(undefined)).toBe(false);
    expect(ignoreUpdate({} as UpdateInfo)).toBe(false);
  });

  it('ignores legacy 0.0.0 canary releases', () => {
    expect(
      ignoreUpdate({
        current: '0.0.0-1234',
        latest: '3.7.0',
        name: '@docusaurus/core',
        type: 'major',
      }),
    ).toBe(true);
  });

  it('ignores versions with canary suffix (closes #11013)', () => {
    expect(
      ignoreUpdate({
        current: '3.7.0-canary-6264',
        latest: '3.7.0',
        name: '@docusaurus/core',
        type: 'patch',
      }),
    ).toBe(true);
    expect(
      ignoreUpdate({
        current: '3.8.0-canary-7123+7b6826b',
        latest: '3.8.0',
        name: '@docusaurus/core',
        type: 'patch',
      }),
    ).toBe(true);
  });

  it('ignores prerelease versions', () => {
    expect(
      ignoreUpdate({
        current: '4.0.0-alpha.0',
        latest: '4.0.0',
        name: '@docusaurus/core',
        type: 'major',
      }),
    ).toBe(true);
    expect(
      ignoreUpdate({
        current: '4.0.0-beta.1',
        latest: '4.0.0',
        name: '@docusaurus/core',
        type: 'major',
      }),
    ).toBe(true);
  });

  it('does not ignore regular stable versions', () => {
    expect(
      ignoreUpdate({
        current: '3.6.0',
        latest: '3.7.0',
        name: '@docusaurus/core',
        type: 'minor',
      }),
    ).toBe(false);
    expect(
      ignoreUpdate({
        current: '3.7.0',
        latest: '3.7.1',
        name: '@docusaurus/core',
        type: 'patch',
      }),
    ).toBe(false);
  });
});