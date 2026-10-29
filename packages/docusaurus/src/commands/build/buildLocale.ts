/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import {compile, registerBundlerTracing} from '@docusaurus/bundler';
import logger, {PerfLogger} from '@docusaurus/logger';
import {fs} from '@docusaurus/fs';
import {loadSite} from '../../server/site';
import {handleBrokenLinks} from '../../server/brokenLinks';
import {createBuildClientConfig} from '../../webpack/client';
import createServerConfig from '../../webpack/server';
import {
  createConfigureWebpackUtils,
  executePluginsConfigureWebpack,
} from '../../webpack/configure';
import {executeSSG} from '../../ssg/ssgExecutor';
import clearPath from '../utils/clearPath';
import {isAutomaticBaseUrlLocalizationDisabled} from './buildUtils';
import type {BuildCLIOptions} from './build';
import type {SiteCollectedData} from '../../common';
import type {
  ConfigureWebpackUtils,
  LoadedPlugin,
  Props,
} from '@docusaurus/types';

export type BuildLocaleParams = {
  siteDir: string;
  locale: string;
  cliOptions: Partial<BuildCLIOptions>;
};

const SkipBundling = process.env.DOCUSAURUS_SKIP_BUNDLING === 'true';
const ReturnAfterLoading = process.env.DOCUSAURUS_RETURN_AFTER_LOADING === 'true';
const ExitAfterLoading = process.env.DOCUSAURUS_EXIT_AFTER_LOADING === 'true';
const ExitAfterBundling = process.env.DOCUSAURUS_EXIT_AFTER_BUNDLING === 'true';

export async function buildLocale({
  siteDir,
  locale,
  cliOptions,
}: BuildLocaleParams): Promise<void> {
  // Temporary workaround to unlock the ability to translate the site config
  // We'll remove it if a better official API can be designed
  // See https://github.com/facebook/docusaurus/issues/4542
  process.env.DOCUSAURUS_CURRENT_LOCALE = locale;

  logger.info`name=${`[${locale}]`} Creating an optimized production build...`;

  const site = await PerfLogger.async('Load site', () =>
    loadSite({
      siteDir,
      outDir: cliOptions.outDir,
      config: cliOptions.config,
      locale,
      automaticBaseUrlLocalizationDisabled: isAutomaticBaseUrlLocalizationDisabled(cliOptions),
    }),
  );

  if (ReturnAfterLoading) {
    return;
  }
  if (ExitAfterLoading) {
    return process.exit(0);
  }

  const {props} = site;
  const {outDir, plugins, siteConfig} = props;

  const router = siteConfig.future.experimental_router;

  const configureWebpackUtils = await createConfigureWebpackUtils({
    siteDir: props.siteDir,
    siteConfig,
  });

  // We can build the 2 configs in parallel
  const [{clientConfig, clientManifestPath}, {serverConfig, serverBundlePath}] =
    await PerfLogger.async(
      `Creating ${props.currentBundler.name} bundler configs`,
      () =>
        Promise.all([
          getBuildClientConfig({
            props,
            cliOptions,
            configureWebpackUtils,
          }),
          getBuildServerConfig({
            props,
            configureWebpackUtils,
          }),

          // We also clear website/build dir
          // returns void, no useful result needed before compilation
          // See also https://github.com/facebook/docusaurus/pull/11037
          SkipBundling ? undefined : clearPath(outDir),
        ]),
    );

  if (SkipBundling) {
    console.warn(
      `Skipping the Docusaurus bundling step because DOCUSAURUS_SKIP_BUNDLING='true'`,
    );
  } else {
    const cleanupBundlerTracing = await registerBundlerTracing({
      currentBundler: props.currentBundler,
    });
    // Run webpack to build JS bundle (client) and static html files (server).
    await PerfLogger.async(`Bundling with ${props.currentBundler.name}`, () => {
      return compile({
        configs:
          // For hash router we don't do SSG and can skip the server bundle
          router === 'hash' ? [clientConfig] : [clientConfig, serverConfig],
        currentBundler: configureWebpackUtils.currentBundler,
      });
    });
    await cleanupBundlerTracing();
  }
  if (ExitAfterBundling) {
    return process.exit(0);
  }

  const {collectedData} = await PerfLogger.async('SSG', () =>
    executeSSG({
      props,
      serverBundlePath,
      clientManifestPath,
      router,
    }),
  );

  await cleanupServerBundle(serverBundlePath);

  // Plugin Lifecycle - postBuild.
  await PerfLogger.async('postBuild()', () =>
    executePluginsPostBuild({plugins, props, collectedData}),
  );

  // TODO execute this in parallel to postBuild?
  await PerfLogger.async('Broken links checker', () =>
    executeBrokenLinksCheck({props, collectedData}),
  );

  logger.success`Generated static files in path=${path.relative(
    process.cwd(),
    outDir,
  )}.`;
}

async function executePluginsPostBuild({
  plugins,
  props,
  collectedData,
}: {
  plugins: LoadedPlugin[];
  props: Props;
  collectedData: SiteCollectedData;
}) {
  const routesBuildMetadata = _.mapValues(
    collectedData,
    (d) => d.metadata.public,
  );

  await Promise.all(
    plugins.map(async (plugin) => {
      if (!plugin.postBuild) {
        return;
      }
      await plugin.postBuild({
        ...props,
        routesBuildMetadata,
        content: plugin.content,
      });
    }),
  );
}

async function executeBrokenLinksCheck({
  props: {
    routes,
    siteConfig: {onBrokenLinks, onBrokenAnchors},
  },
  collectedData,
}: {
  props: Props;
  collectedData: SiteCollectedData;
}) {
  const collectedLinks = _.mapValues(collectedData, (d) => ({
    links: d.links,
    anchors: d.anchors,
  }));
  await handleBrokenLinks({
    collectedLinks,
    routes,
    onBrokenLinks,
    onBrokenAnchors,
  });
}

async function getBuildClientConfig({
  props,
  cliOptions,
  configureWebpackUtils,
}: {
  props: Props;
  cliOptions: BuildCLIOptions;
  configureWebpackUtils: ConfigureWebpackUtils;
}) {
  const {plugins} = props;
  const result = await createBuildClientConfig({
    props,
    minify: cliOptions.minify ?? true,
    configureWebpackUtils,
  });
  let {config} = result;
  config = executePluginsConfigureWebpack({
    plugins,
    config,
    isServer: false,
    configureWebpackUtils,
  });
  return {clientConfig: config, clientManifestPath: result.clientManifestPath};
}

async function getBuildServerConfig({
  props,
  configureWebpackUtils,
}: {
  props: Props;
  configureWebpackUtils: ConfigureWebpackUtils;
}) {
  const {plugins} = props;
  const result = await createServerConfig({
    props,
    configureWebpackUtils,
  });
  let {config} = result;
  config = executePluginsConfigureWebpack({
    plugins,
    config,
    isServer: true,
    configureWebpackUtils,
  });
  return {serverConfig: config, serverBundlePath: result.serverBundlePath};
}

// Remove /build/server server.bundle.js because it is not needed.
async function cleanupServerBundle(serverBundlePath: string) {
  if (process.env.DOCUSAURUS_KEEP_SERVER_BUNDLE === 'true') {
    logger.warn(
      "Will NOT delete server bundle because DOCUSAURUS_KEEP_SERVER_BUNDLE='true'",
    );
  } else {
    await PerfLogger.async('Deleting server bundle', async () => {
      // For now we assume server entry is at the root of the server out dir
      const serverDir = path.dirname(serverBundlePath);
      await fs.rm(serverDir, {recursive: true, force: true});
    });
  }
}
