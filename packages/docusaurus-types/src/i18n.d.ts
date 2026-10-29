/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {DeepRequired} from 'utility-types';

export type I18nLocaleConfig = {
  /** The label displayed for this locale in the locales dropdown. */
  label: string;
  /**
   * BCP 47 language tag to use in:
   * - `<html lang="...">` (or any other DOM tag name)
   * - `<link ... hreflang="...">`
   */
  htmlLang: string;
  /** Used to select the locale's CSS and html meta attribute. */
  direction: 'ltr' | 'rtl';
  /**
   * The [calendar](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar)
   * used to calculate the date era. Note that it doesn't control the actual
   * string displayed: `MM/DD/YYYY` and `DD/MM/YYYY` are both gregory. To choose
   * the format (`DD/MM/YYYY` or `MM/DD/YYYY`), set your locale name to `en-GB`
   * or `en-US` (`en` means `en-US`).
   */
  calendar: string;
  /**
   * Root folder that all plugin localization folders of this locale are
   * relative to. Will be resolved against `i18n.path`. Defaults to the locale's
   * name.
   */
  path: string;
  /**
   * Should we attempt to translate this locale?
   * By default, it will only be run if the `./i18n/<locale>` exists.
   */
  translate: boolean;

  /**
   * For i18n sites deployed to distinct domains, it is recommended to configure
   * a site url on a per-locale basis.
   */
  url: string;

  /**
   * An explicit baseUrl to use for this locale, overriding the default one:
   * Default values:
   * - Default locale: `/${siteConfig.baseUrl}/`
   * - Other locales: `/${siteConfig.baseUrl}/<locale>/`
   *
   * Exception: when using the CLI with a single `--locale` parameter, the
   * `/<locale>/` path segment is not included. This is a better default for
   * sites looking to deploy each locale to a different subdomain, such as
   * `https://<locale>.docusaurus.io`
   */
  baseUrl: string;
};

export type I18nConfig = {
  /**
   * The locale that:
   * 1. Does not have its name in the base URL
   * 2. Gets started with `docusaurus start` without `--locale` option
   * 3. Will be used for the `<link hrefLang="x-default">` tag
   */
  defaultLocale: string;
  /**
   * Root folder which all locale folders are relative to. Can be absolute or
   * relative to the config file. e.g. `i18n`
   */
  path: string;
  /** List of locales deployed on your site. Must contain `defaultLocale`. */
  locales: [string, ...string[]];
  /** Individual options for each locale. */
  localeConfigs: {[locale: string]: Partial<I18nLocaleConfig>};
};

export type I18n = DeepRequired<I18nConfig> & {currentLocale: string};

/**
 * Inspired by Chrome JSON, because it's a widely supported i18n format
 * @see https://developer.chrome.com/apps/i18n-messages
 * @see https://support.crowdin.com/file-formats/chrome-json/
 * @see https://www.applanga.com/docs/formats/chrome_i18n_json
 * @see https://docs.transifex.com/formats/chrome-json
 * @see https://help.phrase.com/help/chrome-json-messages
 */
export type TranslationMessage = {message: string; description?: string};
export type TranslationFileContent = {[msgId: string]: TranslationMessage};
/**
 * An abstract representation of how a translation file exists on disk. The core
 * would handle the file reading/writing; plugins just need to deal with
 * translations in-memory.
 */
export type TranslationFile = {
  /**
   * Relative to the directory where it's expected to be found. For plugin
   * files, it's relative to `i18n/<locale>/<pluginName>/<pluginId>`. Should NOT
   * have any extension.
   */
  path: string;
  content: TranslationFileContent;
};

export type CodeTranslations = {[msgId: string]: string};
