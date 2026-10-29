/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {realpath} from '@docusaurus/fs';
import {loadContext} from '../server/site';
import {initPlugins} from '../server/plugins/init';
import type {Command} from 'commander';

export async function externalCommand({
  cli,
  siteDir: siteDirInput,
  config,
}: {
  cli: Command;
  siteDir: string;
  config: string | undefined;
}): Promise<void> {
  const siteDir = await realpath(siteDirInput);
  const context = await loadContext({siteDir, config});
  const plugins = await initPlugins(context);

  // Plugin Lifecycle - extendCli.
  plugins.forEach((plugin) => {
    plugin.extendCli?.(cli);
  });
}
