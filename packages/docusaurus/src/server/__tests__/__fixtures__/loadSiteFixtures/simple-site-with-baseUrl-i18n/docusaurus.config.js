/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: 'Hello',
  baseUrl: '/myBaseUrl/',
  url: 'https://docusaurus.io',
  i18n: {
    defaultLocale: 'en',
    locales: ['en','fr', 'es', 'de', 'it'],
    localeConfigs: {
      en: {
        baseUrl: '/myBaseUrl/',
      },
      fr: {
        baseUrl: 'myBaseUrl/fr',
      },
      es: {
        url: 'https://es.docusaurus.io',
        // TODO it's not clear what should be the inferred outDir in this case
        baseUrl: 'es',
      },
      de: {
        // TODO it's not clear what should be the inferred outDir in this case
        baseUrl: 'WHATEVER/de',
      },
      it: {
        url: 'https://it.docusaurus.io',
        // TODO it's not clear what should be the inferred outDir in this case
        baseUrl: '',
      },
    }
  }
};
