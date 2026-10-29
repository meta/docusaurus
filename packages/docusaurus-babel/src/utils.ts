/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {BABEL_CONFIG_FILE_NAME} from '@docusaurus/utils';
import {pathExists} from '@docusaurus/fs';
import type {TransformOptions} from '@babel/core';

export async function getCustomBabelConfigFilePath(
  siteDir: string,
): Promise<string | undefined> {
  const customBabelConfigurationPath = path.join(
    siteDir,
    BABEL_CONFIG_FILE_NAME,
  );
  return (await pathExists(customBabelConfigurationPath))
    ? customBabelConfigurationPath
    : undefined;
}

/**
 * Returns the options to pass to Babel.
 * @param configFile the site's custom Babel config file, if any. Without it,
 * the Docusaurus Babel preset is used.
 */
export function getBabelOptions({
  isServer,
  configFile,
}: {
  isServer?: boolean;
  configFile?: string;
} = {}): TransformOptions {
  const caller = {name: isServer ? 'server' : 'client'};
  if (configFile) {
    return {
      babelrc: false,
      configFile,
      caller,
    };
  }
  return {
    presets: [require.resolve('@docusaurus/babel/preset')],
    babelrc: false,
    configFile: false,
    caller,
  };
}
