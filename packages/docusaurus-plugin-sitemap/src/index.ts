/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import logger from '@docusaurus/logger';
import {outputFile} from '@docusaurus/fs';
import createSitemap from './createSitemap';
import type {PluginOptions, Options} from './options';
import type {LoadContext, Plugin} from '@docusaurus/types';

const PluginName = 'docusaurus-plugin-sitemap';

export default function pluginSitemap(
  context: LoadContext,
  options: PluginOptions,
): Plugin<void> | null {
  if (context.siteConfig.future.experimental_router === 'hash') {
    logger.warn(
      `${PluginName} does not support the Hash Router and will be disabled.`,
    );
    return null;
  }

  return {
    name: PluginName,

    async postBuild({siteConfig, routes, outDir, routesBuildMetadata}) {
      if (siteConfig.noIndex) {
        return;
      }
      // Generate sitemap.
      const generatedSitemap = await createSitemap({
        siteConfig,
        routes,
        routesBuildMetadata,
        options,
      });
      if (!generatedSitemap) {
        return;
      }

      // Write sitemap file.
      const sitemapPath = path.join(outDir, options.filename);
      try {
        await outputFile(sitemapPath, generatedSitemap);
      } catch (err) {
        logger.error('Writing sitemap failed.');
        throw err;
      }
    },
  };
}

export {validateOptions} from './options';
export type {PluginOptions, Options};
