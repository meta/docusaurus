/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {getCopyPlugin} from '@docusaurus/bundler';
import {fs, pathExists} from '@docusaurus/fs';
import type {Props} from '@docusaurus/types';
import type {WebpackPluginInstance} from 'webpack';

export async function createStaticDirectoriesCopyPlugin({
  props,
}: {
  props: Props;
}): Promise<WebpackPluginInstance | undefined> {
  const CopyPlugin = await getCopyPlugin({
    currentBundler: props.currentBundler,
  });

  const {
    siteDir,
    siteConfig: {staticDirectories: staticDirectoriesOption},
  } = props;

  // The staticDirectories option can contain empty directories, or non-existent
  // directories (e.g. user deleted `static`). Instead of issuing an error, we
  // just silently filter them out, because user could have never configured it
  // in the first place (the default option should always "work").
  const staticDirectories: string[] = (
    await Promise.all(
      staticDirectoriesOption.map(async (dir) => {
        const staticDir = path.resolve(siteDir, dir);
        if (
          (await pathExists(staticDir)) &&
          (await fs.readdir(staticDir)).length > 0
        ) {
          return staticDir;
        }
        return '';
      }),
    )
  ).filter(Boolean);

  if (staticDirectories.length === 0) {
    return undefined;
  }

  // Webpack's built-in CopyPlugin lets the last pattern win, whereas Rspack
  // and copy-webpack-plugin keep the first. Preserve the directory priority.
  if (props.currentBundler.name === 'webpack') {
    staticDirectories.reverse();
  }

  return new CopyPlugin({
    patterns: staticDirectories.map((dir) => ({
      from: dir,
      to: '.',
      info: {
        // Prevents Webpack from minimizing static files (js/css)
        // see https://github.com/facebook/docusaurus/pull/10658
        // see https://github.com/webpack-contrib/copy-webpack-plugin#skip-running-javascript-files-through-a-minimizer
        minimized: true,
      },
    })),
  });
}
