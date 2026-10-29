/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import {
  applyTrailingSlash,
  addTrailingSlash,
  removeTrailingSlash,
} from '@docusaurus/utils-common';
import {
  createFromExtensionsRedirects,
  createToExtensionsRedirects,
} from './extensionRedirects';
import {validateRedirect} from './redirectValidation';
import type {PluginOptions, RedirectOption} from './options';
import type {PluginContext, RedirectItem} from './types';

export default function collectRedirects(
  pluginContext: PluginContext,
  trailingSlash: boolean | undefined,
): RedirectItem[] {
  function normalizeRedirectTo(to: string) {
    return to.startsWith('/')
      ? applyTrailingSlash(to, {
          trailingSlash,
          baseUrl: pluginContext.baseUrl,
        })
      : to;
  }

  // For each plugin config option, create the appropriate redirects
  const redirects = [
    ...createFromExtensionsRedirects(
      pluginContext.relativeRoutesPaths,
      pluginContext.options.fromExtensions,
    ),
    ...createToExtensionsRedirects(
      pluginContext.relativeRoutesPaths,
      pluginContext.options.toExtensions,
    ),
    ...createRedirectsOptionRedirects(pluginContext.options.redirects),
    ...createCreateRedirectsOptionRedirects(
      pluginContext.relativeRoutesPaths,
      pluginContext.options.createRedirects,
    ),
  ].map((redirect) => ({
    ...redirect,
    // Given a redirect with `to: "/abc"` and `trailingSlash` enabled:
    //
    // - We don't want to reject `to: "/abc"`, as that unambiguously points to
    // `/abc/` now;
    // - We want to redirect `to: /abc/` without the user having to change all
    // her redirect plugin options
    //
    // It should be easy to toggle `trailingSlash` option without having to
    // change other configs
    to: normalizeRedirectTo(redirect.to),
  }));

  validateCollectedRedirects(redirects, pluginContext);
  return filterUnwantedRedirects(redirects, pluginContext);
}

function validateCollectedRedirects(
  redirects: RedirectItem[],
  pluginContext: PluginContext,
) {
  const redirectValidationErrors = redirects
    .map((redirect) => {
      try {
        validateRedirect(redirect);
        return undefined;
      } catch (err) {
        return (err as Error).message;
      }
    })
    .filter(Boolean);
  if (redirectValidationErrors.length > 0) {
    throw new Error(
      `Some created redirects are invalid:
- ${redirectValidationErrors.join('\n- ')}
`,
    );
  }

  const allowedToPaths = pluginContext.relativeRoutesPaths.map((p) =>
    decodeURI(p),
  );
  const toPaths = redirects
    .map((redirect) => redirect.to)
    // We now allow "to" to contain any string
    // We only do this "broken redirect" check from to that looks like pathnames
    // note: we allow querystring/anchors
    // See https://github.com/facebook/docusaurus/issues/6845
    .map((to) => {
      if (to.startsWith('/')) {
        const url = URL.parse(to, 'https://example.com');
        if (url) {
          return decodeURI(url.pathname);
        }
      }
      return undefined;
    })
    .filter((to): to is string => typeof to !== 'undefined');

  const trailingSlashConfig = pluginContext.siteConfig.trailingSlash;
  // Key is the path, value is whether a valid toPath with a different trailing
  // slash exists; if the key doesn't exist it means it's valid
  const differByTrailSlash = new Map(toPaths.map((path) => [path, false]));
  allowedToPaths.forEach((toPath) => {
    if (differByTrailSlash.has(toPath)) {
      differByTrailSlash.delete(toPath);
    } else if (differByTrailSlash.has(removeTrailingSlash(toPath))) {
      if (trailingSlashConfig === true) {
        differByTrailSlash.set(removeTrailingSlash(toPath), true);
      } else {
        differByTrailSlash.delete(removeTrailingSlash(toPath));
      }
    } else if (differByTrailSlash.has(addTrailingSlash(toPath))) {
      if (trailingSlashConfig === false) {
        differByTrailSlash.set(addTrailingSlash(toPath), true);
      } else {
        differByTrailSlash.delete(addTrailingSlash(toPath));
      }
    }
  });
  if (differByTrailSlash.size > 0) {
    const errors = Array.from(differByTrailSlash.entries());

    let message =
      'You are trying to create client-side redirections to invalid paths.\n';

    const [trailingSlashIssues, invalidPaths] = _.partition(
      errors,
      ([, differ]) => differ,
    );

    if (trailingSlashIssues.length) {
      message += `
These paths do exist, but because you have explicitly set trailingSlash=${trailingSlashConfig}, you need to write the path ${
        trailingSlashConfig ? 'with trailing slash' : 'without trailing slash'
      }:
- ${trailingSlashIssues.map(([p]) => p).join('\n- ')}
`;
    }

    if (invalidPaths.length) {
      message += `
These paths are redirected to but do not exist:
- ${invalidPaths.map(([p]) => p).join('\n- ')}

Valid paths you can redirect to:
- ${allowedToPaths.join('\n- ')}
`;
    }

    throw new Error(message);
  }
}

function filterUnwantedRedirects(
  redirects: RedirectItem[],
  pluginContext: PluginContext,
): RedirectItem[] {
  // We don't want to create the same redirect twice, since that would lead to
  // writing the same html redirection file twice.
  Object.entries(_.groupBy(redirects, (redirect) => redirect.from)).forEach(
    ([from, groupedFromRedirects]) => {
      if (groupedFromRedirects.length > 1) {
        logger.report(
          pluginContext.siteConfig.onDuplicateRoutes,
        )`name=${'@docusaurus/plugin-client-redirects'}: multiple redirects are created with the same "from" pathname: path=${from}
It is not possible to redirect the same pathname to multiple destinations:${groupedFromRedirects.map(
          (r) => JSON.stringify(r),
        )}`;
      }
    },
  );
  const collectedRedirects = _.uniqBy(redirects, (redirect) => redirect.from);

  const {false: newRedirects = [], true: redirectsOverridingExistingPath = []} =
    _.groupBy(collectedRedirects, (redirect) =>
      pluginContext.relativeRoutesPaths.includes(redirect.from),
    );
  if (redirectsOverridingExistingPath.length > 0) {
    logger.report(
      pluginContext.siteConfig.onDuplicateRoutes,
    )`name=${'@docusaurus/plugin-client-redirects'}: some redirects would override existing paths, and will be ignored:${redirectsOverridingExistingPath.map(
      (r) => JSON.stringify(r),
    )}`;
  }
  return newRedirects;
}

function createRedirectsOptionRedirects(
  redirectsOption: PluginOptions['redirects'],
): RedirectItem[] {
  // For convenience, user can use a string or a string[]
  function optionToRedirects(option: RedirectOption): RedirectItem[] {
    if (typeof option.from === 'string') {
      return [{from: option.from, to: option.to}];
    }
    return option.from.map((from) => ({from, to: option.to}));
  }

  return redirectsOption.flatMap(optionToRedirects);
}

// Create redirects from the "createRedirects" fn provided by the user
function createCreateRedirectsOptionRedirects(
  paths: string[],
  createRedirects: PluginOptions['createRedirects'],
): RedirectItem[] {
  function createPathRedirects(path: string): RedirectItem[] {
    const fromsMixed: string | string[] = createRedirects?.(path) ?? [];

    const froms: string[] =
      typeof fromsMixed === 'string' ? [fromsMixed] : fromsMixed;

    return froms.map((from) => ({from, to: path}));
  }

  return paths.flatMap(createPathRedirects);
}
