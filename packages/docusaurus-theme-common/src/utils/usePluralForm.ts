/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// We want to ensurer a stable plural form order in all cases
// It is more convenient and natural to handle "small values" first
// See https://x.com/sebastienlorber/status/1366820663261077510
const OrderedPluralForms: Intl.LDMLPluralRule[] = [
  'zero',
  'one',
  'two',
  'few',
  'many',
  'other',
];
function sortPluralForms(
  pluralForms: Intl.LDMLPluralRule[],
): Intl.LDMLPluralRule[] {
  return OrderedPluralForms.filter((pf) => pluralForms.includes(pf));
}

type LocalePluralForms = {
  locale: string;
  pluralForms: Intl.LDMLPluralRule[];
  select: (count: number) => Intl.LDMLPluralRule;
};

// Hardcoded english/fallback implementation
const EnglishPluralForms: LocalePluralForms = {
  locale: 'en',
  pluralForms: sortPluralForms(['one', 'other']),
  select: (count) => (count === 1 ? 'one' : 'other'),
};

function createLocalePluralForms(locale: string): LocalePluralForms {
  const pluralRules = new Intl.PluralRules(locale);
  return {
    locale,
    pluralForms: sortPluralForms(
      pluralRules.resolvedOptions().pluralCategories,
    ),
    select: (count) => pluralRules.select(count),
  };
}

/**
 * Poor man's `PluralSelector` implementation, using an English fallback. We
 * want a lightweight, future-proof and good-enough solution. We don't want a
 * perfect and heavy solution.
 *
 * Docusaurus classic theme has only 2 deeply nested labels requiring complex
 * plural rules. We don't want to use `Intl` + `PluralRules` polyfills + full
 * ICU syntax (react-intl) just for that.
 *
 * Notes:
 * - 2021: 92+% Browsers support `Intl.PluralRules`, and support will increase
 * in the future
 * - NodeJS >= 13 has full ICU support by default
 * - In case of "mismatch" between SSR and Browser ICU support, React keeps
 * working!
 */
function useLocalePluralForms(): LocalePluralForms {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  return useMemo(() => {
    try {
      return createLocalePluralForms(currentLocale);
    } catch (err) {
      console.error(`Failed to use Intl.PluralRules for locale "${currentLocale}".
Docusaurus will fallback to the default (English) implementation.
Error: ${(err as Error).message}
`);
      return EnglishPluralForms;
    }
  }, [currentLocale]);
}

function selectPluralMessage(
  pluralMessages: string,
  count: number,
  localePluralForms: LocalePluralForms,
): string {
  const separator = '|';
  const parts = pluralMessages.split(separator);

  if (parts.length === 1) {
    return parts[0]!;
  }
  if (parts.length > localePluralForms.pluralForms.length) {
    console.error(
      `For locale=${localePluralForms.locale}, a maximum of ${
        localePluralForms.pluralForms.length
      } plural forms are expected (${localePluralForms.pluralForms.join(
        ',',
      )}), but the message contains ${parts.length}: ${pluralMessages}`,
    );
  }
  const pluralForm = localePluralForms.select(count);
  const pluralFormIndex = localePluralForms.pluralForms.indexOf(pluralForm);
  // In case of not enough plural form messages, we take the last one (other)
  // instead of returning undefined
  return parts[Math.min(pluralFormIndex, parts.length - 1)]!;
}

/**
 * Reads the current locale and returns an interface very similar to
 * `Intl.PluralRules`.
 */
export function usePluralForm(): {
  /**
   * Give it a `count` and it will select the relevant message from
   * `pluralMessages`. `pluralMessages` should be separated by `|`, and in the
   * order of "zero", "one", "two", "few", "many", "other". The actual selection
   * is done by `Intl.PluralRules`, which tells us all plurals the locale has
   * and which plural we should use for `count`.
   */
  selectMessage: (count: number, pluralMessages: string) => string;
} {
  const localePluralForm = useLocalePluralForms();
  return {
    selectMessage: (count: number, pluralMessages: string): string =>
      selectPluralMessage(pluralMessages, count, localePluralForm),
  };
}
