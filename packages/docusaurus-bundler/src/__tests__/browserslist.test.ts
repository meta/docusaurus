/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {getTargets} from '../browserslist';

const realNodeVersion = process.versions.node;

function stubNodeVersion(version: string) {
  Object.defineProperty(process.versions, 'node', {value: version});
}

describe('getTargets', () => {
  describe('server', () => {
    afterEach(() => {
      stubNodeVersion(realNodeVersion);
      vi.unstubAllEnvs();
    });

    it('targets the current Node.js version', () => {
      stubNodeVersion('26.8.1');
      expect(getTargets({isServer: true})).toEqual(['node 26.8.1']);
    });

    it('removes the pre-release tag of the current Node.js version', () => {
      stubNodeVersion('27.0.0-rc.1');
      expect(getTargets({isServer: true})).toEqual(['node 27.0.0']);
    });

    it('targets the DOCUSAURUS_SERVER_NODE_TARGET env variable', () => {
      vi.stubEnv('DOCUSAURUS_SERVER_NODE_TARGET', '24.18.0');
      expect(getTargets({isServer: true})).toEqual(['node 24.18.0']);
    });
  });
});
