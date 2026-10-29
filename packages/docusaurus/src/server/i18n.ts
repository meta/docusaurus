/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import logger from '@docusaurus/logger';
import combinePromises from 'combine-promises';
import {normalizeUrl} from '@docusaurus/utils';
import {pathExists} from '@docusaurus/fs';
import type {
  I18n,
  DocusaurusConfig,
  I18nLocaleConfig,
  I18nConfig,
} from '@docusaurus/types';

function inferLanguageDisplayName(locale: string) {
  const tryLocale = (l: string) => {
    try {
      return new Intl.DisplayNames(l, {
        type: 'language',
        fallback: 'code',
      }).of(l)!;
    } catch {
      // This is to compensate "of()" that is a bit strict
      // Looks like starting Node 22, this locale throws: "en-US-u-ca-buddhist"
      // RangeError: invalid_argument
      return null;
    }
  };

  const parts = locale.split('-');

  // This is a best effort, we try various locale forms that could give a result
  return (
    tryLocale(locale) ??
    tryLocale(`${parts[0]}-${parts[1]}`) ??
    tryLocale(parts[0]!)
  );
}

function getDefaultLocaleLabel(locale: string) {
  const languageName = inferLanguageDisplayName(locale);
  if (!languageName) {
    return locale;
  }
  return (
    languageName.charAt(0).toLocaleUpperCase(locale) + languageName.substring(1)
  );
}

function getDefaultCalendar(localeStr: string) {
  const locale = new Intl.Locale(localeStr);

  // If the locale name includes -u-ca-xxx the calendar will be defined
  if (locale.calendar) {
    return locale.calendar;
  }

  // Not well-supported but server code can infer a calendar from the locale
  // See https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getCalendars
  // See https://caniuse.com/mdn-javascript_builtins_intl_locale_getcalendars
  const calendars =
    locale.getCalendars?.() ??
    // @ts-expect-error: non-std attribute (V8/Chromium/Node)
    locale.calendars;

  if (calendars instanceof Array && calendars[0]) {
    return calendars[0];
  }

  return 'gregory';
}

function getDefaultDirection(localeStr: string) {
  const locale = new Intl.Locale(localeStr);
  // see https://github.com/tc39/proposal-intl-locale-info
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo
  return locale.getTextInfo().direction ?? 'ltr';
}

export function getDefaultLocaleConfig(
  // Locale "key/identifier"
  // Can be anything, but usually a country / BCP47 code
  locale: string,
  // optionally provided in i18n.localConfigs, need to respect BCP47
  htmlLang?: string,
): Omit<I18nLocaleConfig, 'translate' | 'url' | 'baseUrl'> {
  try {
    return {
      label: getDefaultLocaleLabel(htmlLang ?? locale),
      direction: getDefaultDirection(htmlLang ?? locale),
      htmlLang: htmlLang ?? locale,
      calendar: getDefaultCalendar(htmlLang ?? locale),
      // Fot the i18n/<path>, we don't use htmlLang on purpose
      // see bug https://github.com/facebook/docusaurus/issues/11952
      path: locale,
    };
  } catch (e) {
    throw new Error(
      `Docusaurus couldn't infer a default locale config for ${logger.name(
        locale,
      )}.
Make sure it is a valid BCP 47 locale name (e.g. en, fr, fr-FR, etc.) and/or provide a valid BCP 47 ${logger.code(
        `siteConfig.i18n.localeConfig['${locale}'].htmlLang`,
      )} attribute.`,
      {cause: e},
    );
  }
}

export function getLocaleList({
  i18nConfig,
  currentLocale,
}: {
  i18nConfig: I18nConfig;
  currentLocale: string;
}): [string, ...string[]] {
  if (!i18nConfig.locales.includes(currentLocale)) {
    logger.warn`The locale name=${currentLocale} was not found in your Docusaurus site configuration.
We recommend adding the name=${currentLocale} to your site i18n config, but we will still try to run your site.
Declared site config locales are: ${i18nConfig.locales}`;
    return i18nConfig.locales.concat(currentLocale) as [string, ...string[]];
  }
  return i18nConfig.locales;
}

export async function loadI18n({
  siteDir,
  config,
  currentLocale,
  automaticBaseUrlLocalizationDisabled,
}: {
  siteDir: string;
  config: DocusaurusConfig;
  currentLocale: string;
  automaticBaseUrlLocalizationDisabled: boolean;
}): Promise<I18n> {
  const {i18n: i18nConfig} = config;

  const locales = getLocaleList({
    i18nConfig,
    currentLocale,
  });

  async function getFullLocaleConfig(
    locale: string,
  ): Promise<I18nLocaleConfig> {
    const localeConfigInput = i18nConfig.localeConfigs[locale] ?? {};
    const localeConfig: Omit<
      I18nLocaleConfig,
      'translate' | 'url' | 'baseUrl'
    > = {
      ...getDefaultLocaleConfig(locale, localeConfigInput.htmlLang),
      ...localeConfigInput,
    };

    // By default, translations will be enabled if i18n/<locale> dir exists
    async function inferTranslate() {
      const localizationDir = path.resolve(
        siteDir,
        i18nConfig.path,
        localeConfig.path,
      );
      return pathExists(localizationDir);
    }

    function getInferredBaseUrl(): string {
      const addLocaleSegment =
        locale !== i18nConfig.defaultLocale &&
        !automaticBaseUrlLocalizationDisabled;

      return normalizeUrl([
        '/',
        config.baseUrl,
        addLocaleSegment ? locale : '',
        '/',
      ]);
    }

    const translate = localeConfigInput.translate ?? (await inferTranslate());

    const url =
      typeof localeConfigInput.url !== 'undefined'
        ? localeConfigInput.url
        : config.url;

    const baseUrl =
      typeof localeConfigInput.baseUrl !== 'undefined'
        ? normalizeUrl(['/', localeConfigInput.baseUrl, '/'])
        : getInferredBaseUrl();

    return {
      ...localeConfig,
      translate,
      url,
      baseUrl,
    };
  }

  const localeConfigs = await combinePromises(
    Object.fromEntries(
      locales.map((locale) => [locale, getFullLocaleConfig(locale)]),
    ),
  );

  return {
    defaultLocale: i18nConfig.defaultLocale,
    locales,
    path: i18nConfig.path,
    currentLocale,
    localeConfigs,
  };
}
