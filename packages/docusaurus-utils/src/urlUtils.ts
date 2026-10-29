/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import resolvePathnameUnsafe from 'resolve-pathname';

/**
 * Much like `path.join`, but much better. Takes an array of URL segments, and
 * joins them into a reasonable URL.
 *
 * - `["file:", "/home", "/user/", "website"]` => `file:///home/user/website`
 * - `["file://", "home", "/user/", "website"]` => `file://home/user/website` (relative!)
 * - Remove trailing slash before parameters or hash.
 * - Replace `?` in query parameters with `&`.
 * - Dedupe forward slashes in the entire path, avoiding protocol slashes.
 *
 * @throws {TypeError} If any of the URL segment is not a string, this throws.
 */
export function normalizeUrl(rawUrls: string[]): string {
  const urls = [...rawUrls];
  const resultArray = [];

  let hasStartingSlash = false;
  let hasEndingSlash = false;

  const isNonEmptyArray = (arr: string[]): arr is [string, ...string[]] =>
    arr.length > 0;

  if (!isNonEmptyArray(urls)) {
    return '';
  }

  // If the first part is a plain protocol, we combine it with the next part.
  if (urls[0].match(/^[^/:]+:\/*$/) && urls.length > 1) {
    const first = urls.shift()!;
    if (first.startsWith('file:') && urls[0].startsWith('/')) {
      // Force a double slash here, else we lose the information that the next
      // segment is an absolute path
      urls[0] = `${first}//${urls[0]}`;
    } else {
      urls[0] = first + urls[0];
    }
  }

  // There must be two or three slashes in the file protocol,
  // two slashes in anything else.
  const replacement = urls[0].match(/^file:\/\/\//) ? '$1:///' : '$1://';
  urls[0] = urls[0].replace(/^(?<protocol>[^/:]+):\/*/, replacement);

  for (let i = 0; i < urls.length; i += 1) {
    let component = urls[i];

    if (typeof component !== 'string') {
      throw new TypeError(`Url must be a string. Received ${typeof component}`);
    }

    if (component === '') {
      if (i === urls.length - 1 && hasEndingSlash) {
        resultArray.push('/');
      }
      continue;
    }

    if (component !== '/') {
      if (i > 0) {
        // Removing the starting slashes for each component but the first.
        component = component.replace(
          /^\/+/,
          // Special case where the first element of rawUrls is empty
          // ["", "/hello"] => /hello
          component.startsWith('/') && !hasStartingSlash ? '/' : '',
        );
      }

      hasEndingSlash = component.endsWith('/');
      // Removing the ending slashes for each component but the last. For the
      // last component we will combine multiple slashes to a single one.
      component = component.replace(/\/+$/, i < urls.length - 1 ? '' : '/');
    }

    hasStartingSlash = true;
    resultArray.push(component);
  }

  let str = resultArray.join('/');
  // Each input component is now separated by a single slash except the possible
  // first plain protocol part.

  // Remove trailing slash before parameters or hash.
  str = str.replace(/\/(?<search>\?|&|#[^!/])/g, '$1');

  // Replace ? in parameters with &.
  const parts = str.split('?');
  str = parts.shift()! + (parts.length > 0 ? '?' : '') + parts.join('&');

  // Dedupe forward slashes in the entire path, avoiding protocol slashes.
  str = str.replace(/(?<textBefore>[^:/]\/)\/+/g, '$1');

  // Dedupe forward slashes at the beginning of the path.
  str = str.replace(/^\/+/g, '/');

  return str;
}

/**
 * Takes a file's path, relative to its content folder, and computes its edit
 * URL. If `editUrl` is `undefined`, this returns `undefined`, as is the case
 * when the user doesn't want an edit URL in her config.
 */
export function getEditUrl(
  fileRelativePath: string,
  editUrl?: string,
): string | undefined {
  return editUrl
    ? // Don't use posixPath for this: we need to force a forward slash path
      normalizeUrl([editUrl, fileRelativePath.replace(/\\/g, '/')])
    : undefined;
}

/**
 * Converts file path to a reasonable URL path, e.g. `'index.md'` -> `'/'`,
 * `'foo/bar.js'` -> `'/foo/bar'`
 */
export function fileToPath(file: string): string {
  const indexRE = /(?<dirname>^|.*\/)index\.(?:mdx?|jsx?|tsx?)$/i;
  const extRE = /\.(?:mdx?|jsx?|tsx?)$/;

  if (indexRE.test(file)) {
    return file.replace(indexRE, '/$1');
  }
  return `/${file.replace(extRE, '').replace(/\\/g, '/')}`;
}

/**
 * Similar to `encodeURI`, but uses `encodeURIComponent` and assumes there's no
 * query.
 *
 * `encodeURI("/question?/answer")` => `"/question?/answer"`;
 * `encodePath("/question?/answer#section")` => `"/question%3F/answer%23section"`
 */
export function encodePath(userPath: string): string {
  return userPath
    .split('/')
    .map((item) => encodeURIComponent(item))
    .join('/');
}

/**
 * Whether `str` is a valid pathname. It must be absolute, and not contain
 * special characters.
 */
export function isValidPathname(str: string): boolean {
  if (!str.startsWith('/')) {
    return false;
  }
  const url = URL.parse(str, 'https://domain.com');
  if (url === null) {
    return false;
  }
  const parsedPathname = url.pathname;
  return parsedPathname === str || parsedPathname === encodeURI(str);
}

export function parseURLOrPath(str: string, base?: string | URL): URL {
  const url = URL.parse(str, base ?? 'https://example.com');
  if (url) {
    return url;
  }
  throw new Error(`Can't parse URL ${str}${base ? ` with base ${base}` : ''}`);
}

export type URLPath = {pathname: string; search?: string; hash?: string};

export function toURLPath(url: URL): URLPath {
  const {pathname} = url;

  // Only the part before the fragment can contain the query string. A "?"
  // inside the hash (e.g. "/foo#bar?baz") must not be read as an empty query.
  const beforeHash = url.hash ? url.href.slice(0, -url.hash.length) : url.href;

  // Fixes annoying url.search behavior
  // "" => undefined
  // "?" => ""
  // "?param => "param"
  const search = url.search
    ? url.search.slice(1)
    : beforeHash.includes('?')
      ? ''
      : undefined;

  // Fixes annoying url.hash behavior
  // "" => undefined
  // "#" => ""
  // "#param => "param"
  const hash = url.hash
    ? url.hash.slice(1)
    : url.href.includes('#')
      ? ''
      : undefined;

  return {
    pathname,
    search,
    hash,
  };
}

/**
 * Let's name the concept of (pathname + search + hash) as URLPath
 * See also https://x.com/kettanaito/status/1741768992866308120
 * Note: this function also resolves relative pathnames while parsing!
 */
export function parseURLPath(urlPath: string, fromPath?: string): URLPath {
  const base = fromPath ? parseURLOrPath(fromPath) : undefined;
  const url = parseURLOrPath(urlPath, base);
  return toURLPath(url);
}

/**
 * This returns results for strings like "foo", "../foo", "./foo.mdx?qs#hash"
 * Unlike "parseURLPath()" above, this will not resolve the pathnames
 * Te returned pathname of "../../foo.mdx" will be "../../foo.mdx", not "/foo"
 * This returns null if the url is not "local" (contains domain/protocol etc)
 */
export function parseLocalURLPath(urlPath: string): URLPath | null {
  // Workaround because URL("") requires a protocol
  const unspecifiedProtocol = 'unspecified:';

  const url = parseURLOrPath(urlPath, `${unspecifiedProtocol}//`);
  // Ignore links with specified protocol / host
  // (usually fully qualified links starting with https://)
  if (
    url.protocol !== unspecifiedProtocol ||
    url.host !== '' ||
    url.username !== '' ||
    url.password !== ''
  ) {
    return null;
  }

  // We can't use "new URL()" result because it always tries to resolve urls
  // IE it will remove any "./" or "../" in the pathname, which we don't want
  // We have to parse it manually...
  let localUrlPath = urlPath;

  // Extract and remove the #hash part
  const hashIndex = localUrlPath.indexOf('#');
  const hash =
    hashIndex !== -1 ? localUrlPath.substring(hashIndex + 1) : undefined;
  localUrlPath =
    hashIndex !== -1 ? localUrlPath.substring(0, hashIndex) : localUrlPath;

  // Extract and remove ?search part
  const searchIndex = localUrlPath.indexOf('?');
  const search =
    searchIndex !== -1 ? localUrlPath.substring(searchIndex + 1) : undefined;
  localUrlPath =
    searchIndex !== -1 ? localUrlPath.substring(0, searchIndex) : localUrlPath;

  return {
    pathname: localUrlPath,
    search,
    hash,
  };
}

export function serializeURLPath(urlPath: URLPath): string {
  const search = urlPath.search === undefined ? '' : `?${urlPath.search}`;
  const hash = urlPath.hash === undefined ? '' : `#${urlPath.hash}`;
  return `${urlPath.pathname}${search}${hash}`;
}

/**
 * Resolve pathnames and fail-fast if resolution fails. Uses standard URL
 * semantics (provided by `resolve-pathname` which is used internally by React
 * router)
 */
export function resolvePathname(to: string, from?: string): string {
  // TODO do we really need resolve-pathname lib anymore?
  //  possible alternative: decodeURI(parseURLPath(to, from).pathname);
  return resolvePathnameUnsafe(to, from);
}

/** Constructs an SSH URL that can be used to push to GitHub. */
export function buildSshUrl(
  githubHost: string,
  organizationName: string,
  projectName: string,
  githubPort?: string,
): string {
  if (githubPort) {
    return `ssh://git@${githubHost}:${githubPort}/${organizationName}/${projectName}.git`;
  }
  return `git@${githubHost}:${organizationName}/${projectName}.git`;
}

/** Constructs an HTTP URL that can be used to push to GitHub. */
export function buildHttpsUrl(
  gitCredentials: string,
  githubHost: string,
  organizationName: string,
  projectName: string,
  githubPort?: string,
): string {
  if (githubPort) {
    return `https://${gitCredentials}@${githubHost}:${githubPort}/${organizationName}/${projectName}.git`;
  }
  return `https://${gitCredentials}@${githubHost}/${organizationName}/${projectName}.git`;
}

/**
 * Whether the current URL is an SSH protocol. In addition to looking for
 * `ssh:`, it will also allow protocol-less URLs like
 * `git@github.com:facebook/docusaurus.git`.
 */
export function hasSSHProtocol(sourceRepoUrl: string): boolean {
  const url = URL.parse(sourceRepoUrl);
  if (url === null) {
    // Recognizes SCP-style addresses, implying SSH
    // Example: git@github.com:facebook/docusaurus.git
    return /^(?:[\w-]+@)?[\w.-]+:[\w./-]+/.test(sourceRepoUrl);
  }
  return url.protocol === 'ssh:';
}
