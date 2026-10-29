/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {LoadedContent, Metadata} from '@docusaurus/plugin-content-pages';

function indexPagesBySource(content: LoadedContent): Map<string, Metadata> {
  return new Map(content.map((page) => [page.source, page]));
}

// TODO this is bad, we should have a better way to do this (new lifecycle?)
//  The source to page/permalink is a mutable map passed to the mdx loader
//  See https://github.com/facebook/docusaurus/pull/10457
//  See https://github.com/facebook/docusaurus/pull/10185
export function createContentHelpers() {
  const sourceToPage = new Map<string, Metadata>();
  const sourceToPermalink = new Map<string, string>();

  // Mutable map update :/
  function updateContent(content: LoadedContent): void {
    sourceToPage.clear();
    sourceToPermalink.clear();
    indexPagesBySource(content).forEach((value, key) => {
      sourceToPage.set(key, value);
      sourceToPermalink.set(key, value.permalink);
    });
  }

  return {updateContent, sourceToPage, sourceToPermalink};
}
