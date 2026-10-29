/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {base64} from '../lqip';

const imgPath = path.join(__dirname, '__fixtures__', 'endi.jpg');
const invalidPath = path.join(__dirname, '__fixtures__', 'docusaurus.svg');

describe('base64', () => {
  it('rejects unknown or unsupported file format', async () => {
    await expect(base64(invalidPath)).rejects.toThrow(
      /Error: Input file is missing or uses unsupported image format, lqip v.*/,
    );
  });

  it('generates a valid base64', async () => {
    const expectedBase64 = 'data:image/jpeg;base64,/9j/2wBDA';
    await expect(base64(imgPath)).resolves.toContain(expectedBase64);
  });
});
