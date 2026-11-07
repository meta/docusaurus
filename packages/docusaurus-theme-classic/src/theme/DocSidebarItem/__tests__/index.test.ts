/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

describe('DocSidebarItem label styles', () => {
  it('DocSidebarItem/Link contains bottom padding to prevent Firefox descender clipping', () => {
    const cssPath = path.resolve(__dirname, '../Link/styles.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toMatch(/\.linkLabel\s*\{[^}]*line-clamp:\s*2/);
    expect(cssContent).toMatch(/\.linkLabel\s*\{[^}]*padding-bottom:\s*1px/);
  });

  it('DocSidebarItem/Category contains bottom padding to prevent Firefox descender clipping', () => {
    const cssPath = path.resolve(__dirname, '../Category/styles.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toMatch(/\.categoryLinkLabel\s*\{[^}]*line-clamp:\s*2/);
    expect(cssContent).toMatch(/\.categoryLinkLabel\s*\{[^}]*padding-bottom:\s*1px/);
  });
});
