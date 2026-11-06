/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {StaticRouter} from 'react-router-dom';
import {ScrollControllerProvider} from '@docusaurus/theme-common/internal';
import LocaleDropdownNavbarItem from '../index';

const {useDocusaurusContextMock} = vi.hoisted(() => ({
  useDocusaurusContextMock: vi.fn(),
}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: useDocusaurusContextMock,
}));

async function renderDropdown({
  mobile,
  currentLocale = 'en',
}: {
  mobile: boolean;
  currentLocale?: 'en' | 'fr';
}) {
  const baseUrl = currentLocale === 'en' ? '/' : '/fr/';
  const context = {
    siteConfig: {
      url: 'https://example.com',
      baseUrl,
      future: {experimental_router: 'browser'},
    },
    i18n: {
      currentLocale,
      defaultLocale: 'en',
      locales: ['en', 'fr', 'de'],
      localeConfigs: {
        en: {
          label: 'English',
          htmlLang: 'en',
          baseUrl: '/',
          url: 'https://example.com',
        },
        fr: {
          label: 'French',
          htmlLang: 'fr',
          baseUrl: '/fr/',
          url: 'https://example.com',
        },
        de: {
          label: 'German',
          htmlLang: 'de',
          baseUrl: '/de/',
          url: 'https://de.example.com',
        },
      },
    },
  };
  useDocusaurusContextMock.mockReturnValue(context);
  window.docusaurus = {prefetch: vi.fn(), preload: vi.fn()};
  const result = render(
    <StaticRouter location={`${baseUrl}docs?existing=1#heading`}>
      <ScrollControllerProvider>
        <LocaleDropdownNavbarItem
          mobile={mobile}
          items={[]}
          queryString="?persistLocale=true"
          dropdownItemsBefore={[{label: 'Help', to: '/help'}]}
          dropdownItemsAfter={[
            {label: 'Contribute', href: 'https://example.com/contribute'},
          ]}
        />
      </ScrollControllerProvider>
    </StaticRouter>,
  );
  if (mobile) {
    fireEvent.click(result.getByRole('button', {name: 'Languages'}));
    await result.findByRole('link', {name: 'English'});
  }
  return result;
}

describe.each([false, true])(
  'LocaleDropdownNavbarItem (mobile=%s)',
  (mobile) => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}));
    });

    afterEach(async () => {
      cleanup();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    });
    it.each(['en', 'fr'] as const)(
      'disables unavailable languages in development when serving %s',
      async (currentLocale) => {
        vi.stubEnv('NODE_ENV', 'development');
        const {getByRole} = await renderDropdown({mobile, currentLocale});
        const unavailableLanguages =
          currentLocale === 'en' ? ['French', 'German'] : ['English', 'German'];
        for (const name of unavailableLanguages) {
          const link = getByRole('link', {name});
          expect(link).toHaveAttribute('aria-disabled', 'true');
          expect(link).not.toHaveAttribute('href');
          expect(link).toHaveAttribute('tabindex', '-1');
          expect(fireEvent.click(link)).toBe(false);
        }
        const current = getByRole('link', {
          name: currentLocale === 'en' ? 'English' : 'French',
        });
        expect(current).not.toHaveAttribute('aria-disabled');
        expect(current).toHaveClass(
          mobile ? 'menu__link--active' : 'dropdown__link--active',
        );
        expect(current).toHaveAttribute(
          'href',
          `${currentLocale === 'en' ? '/' : '/fr/'}docs?existing=1&persistLocale=true#heading`,
        );
        expect(getByRole('link', {name: 'Help'})).toHaveAttribute(
          'href',
          `${currentLocale === 'en' ? '/' : '/fr/'}help`,
        );
        expect(getByRole('link', {name: /^Contribute/})).toHaveAttribute(
          'href',
          'https://example.com/contribute',
        );
      },
    );

    it('preserves production language URLs, query strings, fragments, and custom items', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const {getByRole} = await renderDropdown({mobile});
      const french = getByRole('link', {name: 'French'});
      expect(french).toHaveAttribute(
        'href',
        '/fr/docs?existing=1&persistLocale=true#heading',
      );
      expect(french).not.toHaveAttribute('aria-disabled');
      expect(french).not.toHaveAttribute('tabindex', '-1');
      expect(getByRole('link', {name: 'German'})).toHaveAttribute(
        'href',
        'https://de.example.com/de/docs?existing=1&persistLocale=true#heading',
      );
      expect(getByRole('link', {name: 'Help'})).toHaveAttribute(
        'href',
        '/help',
      );
      expect(getByRole('link', {name: /^Contribute/})).toHaveAttribute(
        'href',
        'https://example.com/contribute',
      );
    });
  },
);
