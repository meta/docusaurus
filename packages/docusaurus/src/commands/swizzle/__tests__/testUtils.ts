/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';

export const ThemePath = path.join(__dirname, '__fixtures__/theme');

export const Components = {
  ComponentInSubFolder: 'ComponentInFolder/ComponentInSubFolder',
  Sibling: 'ComponentInFolder/Sibling',
  ComponentInFolder: 'ComponentInFolder',
  FirstLevelComponent: 'FirstLevelComponent',
  JsComponent: 'JsComponent',
  NoIndex: 'NoIndex',
  NoIndexComp1: 'NoIndex/NoIndexComp1',
  NoIndexComp2: 'NoIndex/NoIndexComp2',
  NoIndexSub: 'NoIndex/NoIndexSub',
  NoIndexSubComp: 'NoIndex/NoIndexSub/NoIndexSubComp',
};

export async function createTempSiteDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'docusaurus-test-swizzle-siteDir'));
}
