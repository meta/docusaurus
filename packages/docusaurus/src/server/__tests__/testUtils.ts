/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {loadSite, type LoadContextParams, type Site} from '../site';

export async function loadSiteFixture(
  name: string,
  options?: Partial<LoadContextParams>,
): Promise<Site> {
  return loadSite({
    siteDir: path.join(__dirname, '__fixtures__', name),
    ...options,
  });
}
