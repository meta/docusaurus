/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {addLeadingSlash, removePrefix} from '@docusaurus/utils-common';
import logger from '@docusaurus/logger';
import collectRedirects from './collectRedirects';
import writeRedirectFiles, {
  toRedirectFiles,
  type RedirectFile,
} from './writeRedirectFiles';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {PluginContext, RedirectItem} from './types';
import type {PluginOptions, Options} from './options';

const PluginName = 'docusaurus-plugin-client-redirects';

export default function pluginClientRedirectsPages(
  context: LoadContext,
  options: PluginOptions,
): Plugin<void> | null {
  const {trailingSlash} = context.siteConfig;
  const router = context.siteConfig.future.experimental_router;

  if (router === 'hash') {
    logger.warn(
      `${PluginName} does not support the Hash Router and will be disabled.`,
    );
    return null;
  }

  return {
    name: PluginName,
    async postBuild(props) {
      const pluginContext: PluginContext = {
        relativeRoutesPaths: props.routesPaths.map(
          (path) => `${addLeadingSlash(removePrefix(path, props.baseUrl))}`,
        ),
        baseUrl: props.baseUrl,
        outDir: props.outDir,
        options,
        siteConfig: props.siteConfig,
      };

      const redirects: RedirectItem[] = collectRedirects(
        pluginContext,
        trailingSlash,
      );

      const redirectFiles: RedirectFile[] = toRedirectFiles(
        redirects,
        pluginContext,
        trailingSlash,
      );

      // Write files only at the end: make code more easy to test without IO
      await writeRedirectFiles(redirectFiles);
    },
  };
}

export {validateOptions} from './options';
export type {PluginOptions, Options};
