/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {TitleFormatterFnDefault} from '../titleFormatterUtils';

describe('TitleFormatterFnDefault', () => {
  it('works', () => {
    expect(
      TitleFormatterFnDefault({
        title: 'a page',
        siteTitle: 'my site',
        titleDelimiter: '·',
        plugin: {id: 'default', name: 'docusaurus-plugin-content-pages'},
      }),
    ).toBe('a page · my site');
  });

  it('ignores empty title', () => {
    expect(
      TitleFormatterFnDefault({
        title: '    ',
        siteTitle: 'my site',
        titleDelimiter: '·',
        plugin: {id: 'default', name: 'docusaurus-plugin-content-pages'},
      }),
    ).toBe('my site');
  });

  it('does not duplicate site title', () => {
    // Users may pass <Layout title={siteTitle}> leading to duplicate titles
    // By default it's preferable to avoid duplicate siteTitle
    // See also https://github.com/facebook/docusaurus/issues/5878#issuecomment-961505856
    expect(
      TitleFormatterFnDefault({
        title: 'my site',
        siteTitle: 'my site',
        titleDelimiter: '·',
        plugin: {id: 'default', name: 'docusaurus-plugin-content-pages'},
      }),
    ).toBe('my site');
  });
});
