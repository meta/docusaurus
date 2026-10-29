/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {StaticRouter} from 'react-router-dom';
import {Context} from '@docusaurus/core/src/client/docusaurusContext';
import {fromPartial} from '@total-typescript/shoehorn';
import {useAlternatePageUtils} from '../useAlternatePageUtils';
import type {DocusaurusContext} from '@docusaurus/types';

describe('useAlternatePageUtils', () => {
  const createTestUtils = (context: DocusaurusContext) => {
    return {
      forLocation: (location: string) => {
        return renderHook(() => useAlternatePageUtils(), {
          wrapper: ({children}) => (
            <Context value={context}>
              <StaticRouter location={location}>{children}</StaticRouter>
            </Context>
          ),
        }).result.current;
      },
    };
  };

  it('works for baseUrl: / and currentLocale === defaultLocale', () => {
    const testUtils = createTestUtils(
      fromPartial({
        siteConfig: {
          url: 'https://example.com',
          baseUrl: '/',
        },
        i18n: {
          defaultLocale: 'en',
          currentLocale: 'en',
          localeConfigs: {
            en: {
              url: 'https://example.com',
              baseUrl: '/',
            },
            'zh-Hans': {
              url: 'https://zh.example.com',
              baseUrl: '/zh-Hans-baseUrl/',
            },
          },
        },
      }),
    );

    expect(
      testUtils.forLocation('/').createUrl({
        locale: 'zh-Hans',
        fullyQualified: false,
      }),
    ).toBe('/zh-Hans-baseUrl/');
    expect(
      testUtils.forLocation('/foo').createUrl({
        locale: 'zh-Hans',
        fullyQualified: false,
      }),
    ).toBe('/zh-Hans-baseUrl/foo');
    expect(
      testUtils.forLocation('/foo').createUrl({
        locale: 'zh-Hans',
        fullyQualified: true,
      }),
    ).toBe('https://zh.example.com/zh-Hans-baseUrl/foo');
  });

  it('works for baseUrl: / and currentLocale !== defaultLocale', () => {
    const testUtils = createTestUtils(
      fromPartial({
        siteConfig: {
          url: 'https://zh.example.com',
          baseUrl: '/zh-Hans-baseUrl/',
        },
        i18n: {
          defaultLocale: 'en',
          currentLocale: 'zh-Hans',
          localeConfigs: {
            en: {url: 'https://example.com', baseUrl: '/'},
            'zh-Hans': {
              url: 'https://zh.example.com',
              baseUrl: '/zh-Hans-baseUrl/',
            },
          },
        },
      }),
    );

    expect(
      testUtils.forLocation('/zh-Hans-baseUrl/').createUrl({
        locale: 'en',
        fullyQualified: false,
      }),
    ).toBe('/');
    expect(
      testUtils.forLocation('/zh-Hans-baseUrl/foo').createUrl({
        locale: 'en',
        fullyQualified: false,
      }),
    ).toBe('/foo');
    expect(
      testUtils.forLocation('/zh-Hans-baseUrl/foo').createUrl({
        locale: 'en',
        fullyQualified: true,
      }),
    ).toBe('https://example.com/foo');
  });

  it('works for non-root base URL and currentLocale === defaultLocale', () => {
    const testUtils = createTestUtils(
      fromPartial({
        siteConfig: {baseUrl: '/en/', url: 'https://example.com'},
        i18n: {
          defaultLocale: 'en',
          currentLocale: 'en',
          localeConfigs: {
            en: {url: 'https://example.com', baseUrl: '/base/'},
            'zh-Hans': {
              url: 'https://zh.example.com',
              baseUrl: '/zh-Hans-baseUrl/',
            },
          },
        },
      }),
    );
    expect(
      testUtils.forLocation('/en/').createUrl({
        locale: 'zh-Hans',
        fullyQualified: false,
      }),
    ).toBe('/zh-Hans-baseUrl/');
    expect(
      testUtils.forLocation('/en/foo').createUrl({
        locale: 'zh-Hans',
        fullyQualified: false,
      }),
    ).toBe('/zh-Hans-baseUrl/foo');
    expect(
      testUtils.forLocation('/en/foo').createUrl({
        locale: 'zh-Hans',
        fullyQualified: true,
      }),
    ).toBe('https://zh.example.com/zh-Hans-baseUrl/foo');
  });

  it('works for non-root base URL and currentLocale !== defaultLocale', () => {
    const testUtils = createTestUtils(
      fromPartial({
        siteConfig: {
          baseUrl: '/zh-Hans-baseUrl/',
          url: 'https://zh.example.com',
        },
        i18n: {
          defaultLocale: 'en',
          currentLocale: 'zh-Hans',
          localeConfigs: {
            en: {url: 'https://en.example.com', baseUrl: '/en/'},
            'zh-Hans': {
              url: 'https://zh.example.com',
              baseUrl: '/zh-Hans-baseUrl/',
            },
          },
        },
      }),
    );

    expect(
      testUtils.forLocation('/zh-Hans-baseUrl/').createUrl({
        locale: 'en',
        fullyQualified: false,
      }),
    ).toBe('/en/');
    expect(
      testUtils.forLocation('/zh-Hans-baseUrl/foo').createUrl({
        locale: 'en',
        fullyQualified: false,
      }),
    ).toBe('/en/foo');
    expect(
      testUtils.forLocation('/zh-Hans-baseUrl/foo').createUrl({
        locale: 'en',
        fullyQualified: true,
      }),
    ).toBe('https://en.example.com/en/foo');
  });
});
