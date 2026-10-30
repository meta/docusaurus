/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  addTrailingSlash,
  removeSuffix,
  removeTrailingSlash,
} from '@docusaurus/utils-common';
import type {RedirectItem} from './types';

const ExtensionAdditionalMessage =
  'If the redirect extension system is not good enough for your use case, you can create redirects yourself with the "createRedirects" plugin option.';

const validateExtension = (ext: string) => {
  if (!ext) {
    throw new Error(
      `Extension "${ext}" is not allowed.\n${ExtensionAdditionalMessage}`,
    );
  }
  if (ext.includes('.')) {
    throw new Error(
      `Extension "${ext}" contains a "." (dot) which is not allowed.\n${ExtensionAdditionalMessage}`,
    );
  }
  if (ext.includes('/')) {
    throw new Error(
      `Extension "${ext}" contains a "/" (slash) which is not allowed.\n${ExtensionAdditionalMessage}`,
    );
  }
  if (encodeURIComponent(ext) !== ext) {
    throw new Error(
      `Extension "${ext}" contains invalid URI characters.\n${ExtensionAdditionalMessage}`,
    );
  }
};

const addLeadingDot = (extension: string) => `.${extension}`;

/**
 * Create new `/path` that redirects to existing an `/path.html`
 */
export function createToExtensionsRedirects(
  paths: string[],
  extensions: string[],
): RedirectItem[] {
  extensions.forEach(validateExtension);

  const dottedExtensions = extensions.map(addLeadingDot);

  const createPathRedirects = (path: string): RedirectItem[] => {
    const extensionFound = dottedExtensions.find((ext) => path.endsWith(ext));
    if (extensionFound) {
      return [{from: removeSuffix(path, extensionFound), to: path}];
    }
    return [];
  };

  return paths.flatMap(createPathRedirects);
}

/**
 * Create new `/path.html/index.html` that redirects to existing an `/path`
 * The filename pattern might look weird but it's on purpose (see
 * https://github.com/meta/docusaurus/issues/5055)
 */
export function createFromExtensionsRedirects(
  paths: string[],
  extensions: string[],
): RedirectItem[] {
  extensions.forEach(validateExtension);

  const dottedExtensions = extensions.map(addLeadingDot);

  const alreadyEndsWithAnExtension = (str: string) =>
    dottedExtensions.some((ext) => str.endsWith(ext));

  const createPathRedirects = (path: string): RedirectItem[] => {
    if (path === '' || path === '/' || alreadyEndsWithAnExtension(path)) {
      return [];
    }
    return extensions.map((ext) => ({
      // /path => /path.html
      // /path/ => /path.html/
      from: path.endsWith('/')
        ? addTrailingSlash(`${removeTrailingSlash(path)}.${ext}`)
        : `${path}.${ext}`,
      to: path,
    }));
  };

  return paths.flatMap(createPathRedirects);
}
