/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {extractThemeCodeMessages} from '../utils';

describe('extractThemeCodeMessages', () => {
  it('throws with invalid syntax', async () => {
    await expect(() =>
      extractThemeCodeMessages([path.join(__dirname, '__fixtures__/theme')]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Please make sure all theme translations are static!
      Some warnings were found!

      Translate content could not be extracted. It has to be a static string and use optional but static props, like <Translate id="my-id" description="my-description">text</Translate>.
      File: <PROJECT_ROOT>/packages/docusaurus-theme-translations/src/__tests__/__fixtures__/theme/index.js at line 5
      Full code: <Translate>{index}</Translate>
      ]
    `);
  });
});
