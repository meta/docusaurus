/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import browserslist from 'browserslist';
import semver from 'semver';
import {browserslistToTargets, type TransformOptions} from 'lightningcss';

// Used when the site doesn't provide its own Browserslist config
// See https://web.dev/baseline
const DefaultBrowserslistQueries = ['baseline widely available'];

/**
 * The targets the client or server bundle is compiled for, like
 * `['chrome 120', 'firefox 115']` or `['node 24.11.1']`
 */
export function getTargets({isServer}: {isServer: boolean}): string[] {
  return isServer ? getServerTargets() : getClientTargets();
}

export function getClientQueries(): string[] {
  return (
    browserslist.loadConfig({path: process.cwd()}) ?? DefaultBrowserslistQueries
  );
}

/**
 * The browsers that the client queries match, like
 * `['chrome 120', 'firefox 115']`
 */
function getClientTargets(): string[] {
  return browserslist(getClientQueries());
}

// SWC skips all transforms for Node versions newer than its Browserslist data
// See https://github.com/swc-project/swc/pull/11457
export function getServerTargets(): string[] {
  // Escape hatch env variable
  if (process.env.DOCUSAURUS_SERVER_NODE_TARGET) {
    return [`node ${process.env.DOCUSAURUS_SERVER_NODE_TARGET}`];
  }
  // SWC panics on pre-release versions like "27.0.0-rc.1"
  const nodeVersion = semver.coerce(process.versions.node)!.version;
  return [`node ${nodeVersion}`];
}

// LightningCSS doesn't expose any type for minimizer-webpack-plugin setup
// So we derive it ourselves
// see https://lightningcss.dev/docs.html#with-webpack
type LightningCssMinimizerOptions = Omit<
  TransformOptions<never>,
  'filename' | 'code'
>;

export function getLightningCssMinimizerOptions(): LightningCssMinimizerOptions {
  return {targets: browserslistToTargets(getClientTargets())};
}
