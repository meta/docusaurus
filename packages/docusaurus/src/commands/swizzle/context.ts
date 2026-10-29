/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {loadContext} from '../../server/site';
import {initPluginsConfigs} from '../../server/plugins/init';
import {loadPluginConfigs} from '../../server/plugins/configs';
import type {SwizzleCLIOptions, SwizzleContext, SwizzlePlugin} from './common';
import type {LoadContext} from '@docusaurus/types';

async function getSwizzlePlugins(
  context: LoadContext,
): Promise<SwizzlePlugin[]> {
  const pluginConfigs = await loadPluginConfigs(context);
  const pluginConfigInitResults = await initPluginsConfigs(
    context,
    pluginConfigs,
  );

  return pluginConfigInitResults.flatMap((initResult) => {
    // Ignore self-disabling plugins returning null
    if (initResult.plugin === null) {
      return [];
    }
    return [
      // TODO this is a bit confusing, need refactor
      {
        plugin: initResult.config,
        instance: initResult.plugin,
      },
    ];
  });
}

export async function initSwizzleContext(
  siteDir: string,
  options: SwizzleCLIOptions,
): Promise<SwizzleContext> {
  const context = await loadContext({siteDir, config: options.config});
  return {
    plugins: await getSwizzlePlugins(context),
  };
}
