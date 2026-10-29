/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'node:url';
import _ from 'lodash';
import {normalizeUrl} from '@docusaurus/utils';
import logger, {PerfLogger} from '@docusaurus/logger';
import {realpath} from '@docusaurus/fs';
import {getHostPort} from '../../server/getHostPort';
import getHttpsConfig, {
  type HttpsConfig,
} from '../../webpack/utils/getHttpsConfig';
import {
  loadSite,
  type LoadSiteParams,
  reloadSite,
  reloadSitePlugin,
} from '../../server/site';
import {formatPluginName} from '../../server/plugins/pluginsUtils';
import type {StartCLIOptions} from './start';
import type {LoadedPlugin, RouterType} from '@docusaurus/types';

// This code was historically in CRA/react-dev-utils (deprecated in 2025)
// We internalized it, refactored and removed useless code paths
// See https://github.com/facebook/docusaurus/pull/10956
// See https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/WebpackDevServerUtils.js
function getOpenUrlOrigin(
  protocol: string,
  host: string,
  port: number,
): string {
  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
  const prettyHost = isUnspecifiedHost ? 'localhost' : host;
  const localUrlForBrowser = url.format({
    protocol,
    hostname: prettyHost,
    port,
    pathname: '/',
  });
  return localUrlForBrowser;
}

export type OpenUrlContext = {
  host: string;
  port: number;
  httpsConfig: HttpsConfig;
  getOpenUrl: ({
    baseUrl,
    router,
  }: {
    baseUrl: string;
    router: RouterType;
  }) => string;
};

export async function createOpenUrlContext({
  cliOptions,
}: {
  cliOptions: StartCLIOptions;
}): Promise<OpenUrlContext> {
  const httpsConfig = await getHttpsConfig({
    https: cliOptions.https,
    sslCert: cliOptions.sslCert,
    sslKey: cliOptions.sslKey,
  });
  const protocol = httpsConfig ? 'https' : 'http';

  const {host, port} = await getHostPort(cliOptions);
  if (port === null) {
    return process.exit();
  }

  const getOpenUrl: OpenUrlContext['getOpenUrl'] = ({baseUrl, router}) => {
    return normalizeUrl([
      getOpenUrlOrigin(protocol, host, port),
      router === 'hash' ? '/#/' : '',
      baseUrl,
    ]);
  };

  return {host, port, httpsConfig, getOpenUrl};
}

type StartParams = {
  siteDirParam: string;
  cliOptions: Partial<StartCLIOptions>;
};

async function createLoadSiteParams({
  siteDirParam,
  cliOptions,
}: StartParams): Promise<LoadSiteParams> {
  const siteDir = await realpath(siteDirParam);
  return {
    siteDir,
    config: cliOptions.config,
    locale: cliOptions.locale,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function createReloadableSite(startParams: StartParams) {
  const openUrlContext = await createOpenUrlContext(startParams);

  const loadSiteParams = await PerfLogger.async('createLoadSiteParams', () =>
    createLoadSiteParams(startParams),
  );

  let site = await PerfLogger.async('Load site', () =>
    loadSite(loadSiteParams),
  );

  const get = () => site;

  const getOpenUrl = () =>
    openUrlContext.getOpenUrl({
      baseUrl: site.props.baseUrl,
      router: site.props.siteConfig.future.experimental_router,
    });

  const printOpenUrlMessage = () => {
    logger.success`Docusaurus website is running at: url=${getOpenUrl()}`;
  };
  printOpenUrlMessage();

  const reloadBase = async () => {
    try {
      const oldSite = site;
      site = await PerfLogger.async('Reload site', () => reloadSite(site));
      if (oldSite.props.baseUrl !== site.props.baseUrl) {
        printOpenUrlMessage();
      }
    } catch (e) {
      logger.error('Site reload failure');
      console.error(e);
    }
  };

  // TODO instead of debouncing we should rather add AbortController support?
  const reload = _.debounce(reloadBase, 500);

  // TODO this could be subject to plugin reloads race conditions
  //  In practice, it is not likely the user will hot reload 2 plugins at once
  //  but we should still support it and probably use a task queuing system
  const reloadPlugin = async (plugin: LoadedPlugin) => {
    try {
      site = await PerfLogger.async(
        `Reload site plugin ${formatPluginName(plugin)}`,
        () => {
          const pluginIdentifier = {name: plugin.name, id: plugin.options.id};
          return reloadSitePlugin(site, pluginIdentifier);
        },
      );
    } catch (e) {
      logger.error(
        `Site plugin reload failure - Plugin ${formatPluginName(plugin)}`,
      );
      console.error(e);
    }
  };

  return {get, getOpenUrl, reload, reloadPlugin, openUrlContext};
}
