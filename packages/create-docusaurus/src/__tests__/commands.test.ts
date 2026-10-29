/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {runCommand} from '../commands';

describe('runCommand', () => {
  it('returns the exit code and output', async () => {
    await expect(
      runCommand('node', [
        '-e',
        `process.stdout.write('out'); process.stderr.write('err'); process.exit(3)`,
      ]),
    ).resolves.toEqual({exitCode: 3, stdout: 'out', stderr: 'err'});
  });

  it('handles split multi-byte characters', async () => {
    const script = `process.stdout.write(Buffer.from([0xc3]));
      setTimeout(() => process.stdout.write(Buffer.from([0xb1])), 50);`;
    await expect(runCommand('node', ['-e', script])).resolves.toEqual({
      exitCode: 0,
      stdout: 'ñ',
      stderr: '',
    });
  });
});
