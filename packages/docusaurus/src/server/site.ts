/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {
  DEFAULT_BUILD_DIR_NAME,
  GENERATED_FILES_DIR_NAME,
  getLocaleConfig,
} from '@docusaurus/utils';
import {PerfLogger} from '@docusaurus/logger';
import combinePromises from 'combine-promises';
import {getCurrentBundler} from '@docusaurus/bundler';
import {loadSiteConfig} from './config';
import {getAllClientModules} from './clientModules';
import {loadPlugins, reloadPlugin} from './plugins/plugins';
import {loadHtmlTags} from './htmlTags';
import {createSiteMetadata, tryLoadSitePackageJson} from './siteMetadata';
import {loadI18n} from './i18n';
import {
  loadSiteCodeTranslations,
  getPluginsDefaultCodeTranslations,
} from './translations/translations';
import {generateSiteFiles} from './codegen/codegen';
import {getRoutesPaths, handleDuplicateRoutes} from './routes';
import {createSiteStorage} from './storage';
import {emitSiteMessages} from './siteMessages';
import {
  createSiteMarkdownLinks,
  updateSiteMarkdownLinks,
} from './siteMarkdownLinks';
import type {LoadPluginsResult} from './plugins/plugins';
import type {
  DocusaurusConfig,
  GlobalData,
  LoadContext,
  Props,
  PluginIdentifier,
  SiteMarkdownLinks,
} from '@docusaurus/types';

export type LoadContextParams = {
  /** Usually the CWD; can be overridden with command argument. */
  siteDir: string;
  /** Custom output directory. Can be customized with `--out-dir` option */
  outDir?: string;
  /** Custom config path. Can be customized with `--config` option */
  config?: string;
  /** Default is `i18n.defaultLocale` */
  locale?: string;

  /**
   * By default, we try to automatically infer a localized baseUrl.
   * We prepend `/<siteBaseUrl>/` with a `/<locale>/` path segment,
   * except for the default locale.
   *
   * This option permits opting out of this baseUrl localization process.
   * It is mostly useful to simplify config for multi-domain i18n deployments.
   * See https://docusaurus.io/docs/i18n/tutorial#multi-domain-deployment
   *
   * In all cases, this process doesn't happen if an explicit localized baseUrl
   * has been provided using `i18n.localeConfigs[].baseUrl`. We always use the
   * provided value over the inferred one, letting you override it.
   */
  automaticBaseUrlLocalizationDisabled?: boolean;

  /**
   * The site-wide Markdown files registry to reuse, if any.
   *
   * On site reloads (`docusaurus start`), a brand new `LoadContext` is created,
   * but the bundler config isn't recreated: the MDX loader keeps a reference to
   * the registry object it received on the initial load. We must therefore keep
   * mutating that very object instead of creating a new one.
   */
  siteMarkdownLinks?: SiteMarkdownLinks;
};

export type LoadSiteParams = LoadContextParams & {
  isReload?: boolean;
};

export type Site = {
  props: Props;
  params: LoadSiteParams;
};

/**
 * Loading context is the very first step in site building. Its params are
 * directly acquired from CLI options. It mainly loads `siteConfig` and the i18n
 * context (which includes code translations). The `LoadContext` will be passed
 * to plugin constructors.
 */
export async function loadContext(
  params: LoadContextParams,
): Promise<LoadContext> {
  const {
    siteDir,
    outDir: baseOutDir = DEFAULT_BUILD_DIR_NAME,
    locale,
    config: customConfigFilePath,
    automaticBaseUrlLocalizationDisabled,
    siteMarkdownLinks = createSiteMarkdownLinks({siteDir: params.siteDir}),
  } = params;
  const generatedFilesDir = path.resolve(siteDir, GENERATED_FILES_DIR_NAME);

  const {
    siteVersion,
    loadSiteConfig: {siteConfig: initialSiteConfig, siteConfigPath},
  } = await combinePromises({
    siteVersion: tryLoadSitePackageJson(siteDir).then((pkg) => pkg?.version),
    loadSiteConfig: loadSiteConfig({
      siteDir,
      customConfigFilePath,
    }),
  });

  // Not sure where is the best place to put this VCS initialization call?
  // The sooner is probably the better
  // Note: we don't await the result on purpose!
  // VCS initialization can be slow for large repos, and we don't want to block
  // VCS integrations should be carefully designed to avoid blocking
  PerfLogger.async('VCS init', () => {
    return initialSiteConfig.vcs.initialize({siteDir});
  });

  const currentBundler = await getCurrentBundler({
    siteConfig: initialSiteConfig,
  });

  const i18n = await loadI18n({
    siteDir,
    config: initialSiteConfig,
    currentLocale: locale ?? initialSiteConfig.i18n.defaultLocale,
    automaticBaseUrlLocalizationDisabled:
      automaticBaseUrlLocalizationDisabled ?? false,
  });

  const localeConfig = getLocaleConfig(i18n);

  // We use the baseUrl from the locale config.
  // By default, it is inferred as /<siteConfig.baseUrl>/
  // eventually including the /<locale>/ suffix
  const baseUrl = localeConfig.baseUrl;

  // TODO not ideal: we should allow configuring a custom outDir for each locale
  // The site baseUrl should be 100% decoupled from the file system output shape
  // We added this logic to restore v3 retro-compatibility, because by default
  // Docusaurus always wrote to ./build for sites having a baseUrl
  // See also https://github.com/facebook/docusaurus/issues/11433
  // This logic assumes the locale baseUrl will start with the site baseUrl
  // which is the case if an explicit locale baseUrl is not provided
  // but in practice a custom locale baseUrl could be anything now
  const outDirBaseUrl = baseUrl.replace(initialSiteConfig.baseUrl, '/');

  const outDir = path.join(path.resolve(siteDir, baseOutDir), outDirBaseUrl);

  const localizationDir = path.resolve(
    siteDir,
    i18n.path,
    getLocaleConfig(i18n).path,
  );

  const siteConfig: DocusaurusConfig = {
    ...initialSiteConfig,
    url: localeConfig.url,
    baseUrl,
  };

  const codeTranslations = await loadSiteCodeTranslations({localizationDir});

  const siteStorage = createSiteStorage(siteConfig);

  return {
    siteDir,
    siteVersion,
    siteStorage,
    generatedFilesDir,
    localizationDir,
    siteConfig,
    siteConfigPath,
    outDir,
    baseUrl,
    i18n,
    codeTranslations,
    currentBundler,
    siteMarkdownLinks,
  };
}

function createSiteProps(
  params: LoadPluginsResult & {context: LoadContext},
): Props {
  const {plugins, routes, context} = params;
  const {
    generatedFilesDir,
    siteDir,
    siteVersion,
    siteConfig,
    siteConfigPath,
    siteStorage,
    outDir,
    baseUrl,
    i18n,
    localizationDir,
    codeTranslations: siteCodeTranslations,
    currentBundler,
    siteMarkdownLinks,
  } = context;

  const {headTags, preBodyTags, postBodyTags} = loadHtmlTags({
    plugins,
    router: siteConfig.future.experimental_router,
  });

  const siteMetadata = createSiteMetadata({plugins, siteVersion});

  const codeTranslations = {
    ...getPluginsDefaultCodeTranslations({plugins}),
    ...siteCodeTranslations,
  };

  handleDuplicateRoutes(routes, siteConfig.onDuplicateRoutes);
  const routesPaths = getRoutesPaths(routes, baseUrl);

  updateSiteMarkdownLinks({siteMarkdownLinks, routes});

  return {
    siteConfig,
    siteConfigPath,
    siteMetadata,
    siteVersion,
    siteStorage,
    siteDir,
    outDir,
    baseUrl,
    i18n,
    localizationDir,
    generatedFilesDir,
    routes,
    routesPaths,
    plugins,
    headTags,
    preBodyTags,
    postBodyTags,
    codeTranslations,
    currentBundler,
    siteMarkdownLinks,
  };
}

// TODO global data should be part of site props?
async function createSiteFiles({
  site,
  globalData,
}: {
  site: Site;
  globalData: GlobalData;
}) {
  return PerfLogger.async('Create site files', async () => {
    const {
      props: {
        plugins,
        generatedFilesDir,
        siteConfig,
        siteMetadata,
        siteStorage,
        i18n,
        codeTranslations,
        routes,
        baseUrl,
      },
    } = site;
    const clientModules = getAllClientModules(plugins);
    await generateSiteFiles({
      generatedFilesDir,
      clientModules,
      siteConfig,
      siteMetadata,
      siteStorage,
      i18n,
      codeTranslations,
      globalData,
      routes,
      baseUrl,
    });
  });
}

/**
 * This is the crux of the Docusaurus server-side. It reads everything it needs—
 * code translations, config file, plugin modules... Plugins then use their
 * lifecycles to generate content and other data. It is side-effect-ful because
 * it generates temp files in the `.docusaurus` folder for the bundler.
 */
export async function loadSite(params: LoadSiteParams): Promise<Site> {
  const context = await PerfLogger.async('Load context', () =>
    loadContext(params),
  );

  const {plugins, routes, globalData} = await loadPlugins(context);

  const props = createSiteProps({plugins, routes, globalData, context});

  const site: Site = {props, params};

  await createSiteFiles({
    site,
    globalData,
  });

  // For now, we don't re-emit messages on site reloads, it's too verbose
  if (!params.isReload) {
    await emitSiteMessages({site});
  }

  return site;
}

export async function reloadSite(site: Site): Promise<Site> {
  // TODO this can be optimized, for example:
  //  - plugins loading same data as before should not recreate routes/bundles
  //  - codegen does not need to re-run if nothing changed
  return loadSite({
    ...site.params,
    isReload: true,
    // The bundler config is not recreated on reload: the MDX loader still holds
    // a reference to the previous site-wide Markdown links registry, so we have
    // to keep refreshing that same object.
    siteMarkdownLinks: site.props.siteMarkdownLinks,
  });
}

export async function reloadSitePlugin(
  site: Site,
  pluginIdentifier: PluginIdentifier,
): Promise<Site> {
  const {plugins, routes, globalData} = await reloadPlugin({
    pluginIdentifier,
    plugins: site.props.plugins,
    context: site.props,
  });

  const newProps = createSiteProps({
    plugins,
    routes,
    globalData,
    context: site.props, // Props extends Context
  });

  const newSite: Site = {
    props: newProps,
    params: site.params,
  };

  // TODO optimize, bypass useless codegen if new site is similar to old site
  await createSiteFiles({site: newSite, globalData});

  return newSite;
}
