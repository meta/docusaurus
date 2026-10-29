/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {addPrefix, removeSuffix} from './stringUtils';
import type {DocusaurusConfig} from '@docusaurus/types';

export type ApplyTrailingSlashParams = Pick<
  DocusaurusConfig,
  'trailingSlash' | 'baseUrl'
>;

export function addTrailingSlash(str: string): string {
  return str.endsWith('/') ? str : `${str}/`;
}

/**
 * Apply/remove a trailing slash on an URL path according to site config options
 * Usually applied on permalinks / URL paths, but also works with absolute URL
 */
export default function applyTrailingSlash(
  path: string,
  options: ApplyTrailingSlashParams,
): string {
  const {trailingSlash, baseUrl} = options;

  if (path.startsWith('#')) {
    // Never apply trailing slash to an anchor link
    return path;
  }

  function handleTrailingSlash(str: string, trailing: boolean): string {
    return trailing ? addTrailingSlash(str) : removeTrailingSlash(str);
  }

  // undefined = legacy retrocompatible behavior
  if (typeof trailingSlash === 'undefined') {
    return path;
  }

  // The trailing slash should be handled before the ?search#hash !
  const [pathname] = path.split(/[#?]/) as [string, ...string[]];
  const queryHash = path.slice(pathname.length);

  // Never transform '/' to ''
  // Never remove the baseUrl trailing slash!
  // If baseUrl = /myBase/, we want to emit /myBase/index.html and not
  // /myBase.html! See https://github.com/facebook/docusaurus/issues/5077
  const shouldNotApply = pathname === '/' || pathname === baseUrl;

  const newPathname = shouldNotApply
    ? pathname
    : handleTrailingSlash(pathname, trailingSlash);

  return `${newPathname}${queryHash}`;
}

/** Appends a leading slash to `str`, if one doesn't exist. */
export function addLeadingSlash(str: string): string {
  return addPrefix(str, '/');
}

/** Removes the trailing slash from `str`. */
export function removeTrailingSlash(str: string): string {
  return removeSuffix(str, '/');
}
