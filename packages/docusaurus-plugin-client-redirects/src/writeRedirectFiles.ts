/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import logger from '@docusaurus/logger';
import {normalizeUrl} from '@docusaurus/utils';

import {pathExists, outputFile} from '@docusaurus/fs';
import createRedirectPageContent from './createRedirectPageContent';

import type {PluginContext, RedirectItem} from './types';

export type WriteFilesPluginContext = Pick<PluginContext, 'baseUrl' | 'outDir'>;

export type RedirectFile = {
  fileAbsolutePath: string;
  fileContent: string;
};

export function createToUrl(baseUrl: string, to: string): string {
  if (to.startsWith('/')) {
    return normalizeUrl([baseUrl, to]);
  }
  return to;
}

// Create redirect file path
// Make sure this path has lower precedence over the original file path when
// served by host providers!
// Otherwise it can produce infinite redirect loops!
//
// See https://github.com/facebook/docusaurus/issues/5055
// See https://github.com/facebook/docusaurus/pull/5085
// See https://github.com/facebook/docusaurus/pull/5102
function getRedirectFilePath(
  fromPath: string,
  trailingSlash: boolean | undefined, // Now unused, on purpose
): string {
  const fileName = path.basename(fromPath);
  const filePath = path.dirname(fromPath);
  // Edge case for https://github.com/facebook/docusaurus/pull/5102
  // If the redirect source path is /xyz, with file /xyz.html
  // We can't write the redirect file at /xyz.html/index.html because for Unix
  // FS, a file/folder can't have the same name "xyz.html"
  // The only possible solution for a redirect file is thus /xyz.html.html (I
  // know, looks suspicious)
  if (trailingSlash === false && fileName.endsWith('.html')) {
    return path.join(filePath, `${fileName}.html`);
  }
  // If the target path is /xyz, with file /xyz/index.html, we don't want the
  // redirect file to be /xyz.html, otherwise it would be picked in priority and
  // the redirect file would redirect to itself. We prefer the redirect file to
  // be /xyz.html/index.html, served with lower priority for most static hosting
  // tools
  return path.join(filePath, `${fileName}/index.html`);
}

export function toRedirectFiles(
  redirects: RedirectItem[],
  pluginContext: WriteFilesPluginContext,
  trailingSlash: boolean | undefined,
): RedirectFile[] {
  // Perf: avoid rendering the template twice with the exact same "props"
  // We might create multiple redirect pages for the same destination url
  // note: the first fn arg is the cache key!
  const createPageContentMemoized = _.memoize((toUrl: string) =>
    createRedirectPageContent({toUrl}),
  );

  const createFileMetadata = (redirect: RedirectItem) => {
    const fileRelativePath = getRedirectFilePath(redirect.from, trailingSlash);
    const fileAbsolutePath = path.join(pluginContext.outDir, fileRelativePath);
    const toUrl = createToUrl(pluginContext.baseUrl, redirect.to);
    const fileContent = createPageContentMemoized(toUrl);
    return {
      ...redirect,
      fileAbsolutePath,
      fileContent,
    };
  };

  return redirects.map(createFileMetadata);
}

async function writeRedirectFile(file: RedirectFile): Promise<void> {
  try {
    // User-friendly security to prevent file overrides
    if (await pathExists(file.fileAbsolutePath)) {
      throw new Error(
        'The redirect plugin is not supposed to override existing files.',
      );
    }
    await outputFile(
      file.fileAbsolutePath,
      file.fileContent,
      // Hard security to prevent file overrides
      // See https://stackoverflow.com/a/34187712/82609
      {flag: 'wx'},
    );
  } catch (err) {
    logger.error`Redirect file creation error for path=${file.fileAbsolutePath}.`;
    throw err;
  }
}

export default async function writeRedirectFiles(
  redirectFiles: RedirectFile[],
): Promise<void> {
  await Promise.all(redirectFiles.map(writeRedirectFile));
}
