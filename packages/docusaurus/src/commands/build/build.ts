/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger, {PerfLogger} from '@docusaurus/logger';
import {mapAsyncSequential} from '@docusaurus/utils';
import {realpath} from '@docusaurus/fs';
import {type LoadContextParams} from '../../server/site';
import {getLocaleList} from '../../server/i18n';
import {buildLocale, type BuildLocaleParams} from './buildLocale';
import {loadSiteConfig} from '../../server/config';

export type BuildCLIOptions = Pick<LoadContextParams, 'config' | 'outDir'> & {
  locale?: [string, ...string[]];
  minify?: boolean;
  dev?: boolean;
};

export async function build(
  siteDirParam: string = '.',
  cliOptions: Partial<BuildCLIOptions> = {},
): Promise<void> {
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  if (cliOptions.dev) {
    logger.info`Building in dev mode`;
    process.env.BABEL_ENV = 'development';
    process.env.NODE_ENV = 'development';
  }

  const siteDir = await realpath(siteDirParam);

  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => process.exit());
  });

  const locales = await PerfLogger.async('Get locales to build', () =>
    getLocalesToBuild({siteDir, cliOptions}),
  );

  if (locales.length > 1) {
    logger.info`Website will be built for all these locales: ${locales}`;
  }

  await PerfLogger.async(`Build`, () =>
    mapAsyncSequential(locales, async (locale) => {
      await tryToBuildLocale({siteDir, locale, cliOptions});
    }),
  );

  logger.info`Use code=${'npm run serve'} command to test your build locally.`;
}

// We need the default locale to always be the 1st in the list. If we build it
// last, it would "erase" the localized sites built in sub-folders
function orderLocales({
  locales,
  defaultLocale,
}: {
  locales: [string, ...string[]];
  defaultLocale: string;
}): [string, ...string[]] {
  if (locales.includes(defaultLocale)) {
    return [
      defaultLocale,
      ...locales.filter((locale) => locale !== defaultLocale),
    ];
  } else {
    return locales;
  }
}

async function getLocalesToBuild({
  siteDir,
  cliOptions,
}: {
  siteDir: string;
  cliOptions: BuildCLIOptions;
}): Promise<[string, ...string[]]> {
  const {siteConfig} = await loadSiteConfig({
    siteDir,
    customConfigFilePath: cliOptions.config,
  });

  const locales =
    cliOptions.locale ??
    getLocaleList({
      i18nConfig: siteConfig.i18n,
      currentLocale: siteConfig.i18n.defaultLocale, // Awkward but ok
    });

  return orderLocales({
    locales: locales as [string, ...string[]],
    defaultLocale: siteConfig.i18n.defaultLocale,
  });
}

async function tryToBuildLocale(params: BuildLocaleParams) {
  try {
    await PerfLogger.async(`${logger.name(params.locale)}`, async () => {
      // Note: I tried to run buildLocale in worker_threads (still sequentially)
      // It didn't work and I got SIGSEGV / SIGBUS errors
      // See https://x.com/sebastienlorber/status/1848413716372480338
      await runBuildLocaleTask(params);
    });
  } catch (err) {
    throw new Error(
      logger.interpolate`Unable to build website for locale name=${params.locale}.`,
      {
        cause: err,
      },
    );
  }
}

async function runBuildLocaleTask(params: BuildLocaleParams) {
  // Note: I tried to run buildLocale task in worker_threads (sequentially)
  // It didn't work and I got SIGSEGV / SIGBUS errors
  // Goal was to isolate memory of each localized site build
  // See also https://x.com/sebastienlorber/status/1848413716372480338
  //
  // Running in child_process worked but is more complex and requires
  // specifying the memory of the child process + weird logging issues to fix
  //
  // Note in the future we could try to enable concurrent localized site builds
  await buildLocale(params);
}
