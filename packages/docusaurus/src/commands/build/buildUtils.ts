/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {BuildCLIOptions} from './build';

/**
 * We disable locale path localization if CLI has a single "--locale" option
 * yarn build --locale fr => baseUrl=/ instead of baseUrl=/fr/
 * By default, this makes it easier to support multi-domain deployments
 * See https://docusaurus.io/docs/i18n/tutorial#multi-domain-deployment
 */
export function isAutomaticBaseUrlLocalizationDisabled(
  cliOptions: BuildCLIOptions,
): boolean {
  return cliOptions.locale?.length === 1;
}
