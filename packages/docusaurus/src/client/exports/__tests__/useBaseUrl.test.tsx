/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {fromPartial} from '@total-typescript/shoehorn';
import useBaseUrl, {addBaseUrl, useBaseUrlUtils} from '../useBaseUrl';
import {Context} from '../../docusaurusContext';
import type {DocusaurusContext, FutureConfig} from '@docusaurus/types';
import type {BaseUrlOptions} from '@docusaurus/useBaseUrl';

type AddBaseUrlParams = Parameters<typeof addBaseUrl>[0];

const future: FutureConfig = fromPartial({
  experimental_router: 'browser',
});

const forcePrepend = {forcePrependBaseUrl: true};

// TODO migrate more tests here, it's easier to test a pure function
describe('addBaseUrl', () => {
  function baseTest(params: Partial<AddBaseUrlParams>) {
    return addBaseUrl({
      siteUrl: 'https://docusaurus.io',
      baseUrl: '/baseUrl/',
      url: 'hello',
      router: 'browser',
      ...params,
    });
  }

  describe('with browser router', () => {
    function test(params: {
      url: AddBaseUrlParams['url'];
      baseUrl: AddBaseUrlParams['baseUrl'];
      options?: AddBaseUrlParams['options'];
    }) {
      return baseTest({
        ...params,
        router: 'browser',
      });
    }

    it('/baseUrl/ + hello', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: 'hello',
        }),
      ).toBe('/baseUrl/hello');
    });

    it('/baseUrl/ + hello - absolute option', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: 'hello',
          options: {absolute: true},
        }),
      ).toBe('https://docusaurus.io/baseUrl/hello');
    });

    it('/baseUrl/ + /hello', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: '/hello',
        }),
      ).toBe('/baseUrl/hello');
    });

    it('/baseUrl/ + /hello - absolute option', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: '/hello',
          options: {absolute: true},
        }),
      ).toBe('https://docusaurus.io/baseUrl/hello');
    });

    it('/ + hello', () => {
      expect(
        test({
          baseUrl: '/',
          url: 'hello',
        }),
      ).toBe('/hello');
    });

    it('/ + hello - absolute', () => {
      expect(
        test({
          baseUrl: '/',
          url: 'hello',
          options: {absolute: true},
        }),
      ).toBe('https://docusaurus.io/hello');
    });

    it('/ + /hello', () => {
      expect(
        test({
          baseUrl: '/',
          url: '/hello',
        }),
      ).toBe('/hello');
    });

    it('/ + /hello - absolute', () => {
      expect(
        test({
          baseUrl: '/',
          url: '/hello',
          options: {absolute: true},
        }),
      ).toBe('https://docusaurus.io/hello');
    });
  });

  describe('with hash router', () => {
    function test(params: {
      url: AddBaseUrlParams['url'];
      baseUrl: AddBaseUrlParams['baseUrl'];
      options?: AddBaseUrlParams['options'];
    }) {
      return baseTest({
        ...params,
        router: 'hash',
      });
    }

    it('/baseUrl/ + hello', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: 'hello',
        }),
      ).toBe('./hello');
    });

    it('/baseUrl/ + hello - absolute option', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: 'hello',
          options: {absolute: true},
        }),
      ).toBe('./hello');
    });

    it('/baseUrl/ + /hello', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: '/hello',
        }),
      ).toBe('./hello');
    });

    it('/baseUrl/ + /hello - absolute option', () => {
      expect(
        test({
          baseUrl: '/baseUrl/',
          url: '/hello',
          options: {absolute: true},
        }),
      ).toBe('./hello');
    });

    it('/ + hello', () => {
      expect(
        test({
          baseUrl: '/',
          url: 'hello',
        }),
      ).toBe('./hello');
    });

    it('/ + hello - absolute', () => {
      expect(
        test({
          baseUrl: '/',
          url: 'hello',
          options: {absolute: true},
        }),
      ).toBe('./hello');
    });

    it('/ + /hello', () => {
      expect(
        test({
          baseUrl: '/',
          url: 'hello',
          options: {absolute: true},
        }),
      ).toBe('./hello');
    });

    it('/ + /hello - absolute', () => {
      expect(
        test({
          baseUrl: '/',
          url: 'hello',
          options: {absolute: true},
        }),
      ).toBe('./hello');
    });
  });

  /*

src
:
"img/docusaurus.svg"
srcDark
:
"img/docusaurus_keytar.svg"
   */
});

describe('useBaseUrl', () => {
  const createUseBaseUrlMock =
    (context: DocusaurusContext) => (url: string, options?: BaseUrlOptions) =>
      renderHook(() => useBaseUrl(url, options), {
        wrapper: ({children}) => <Context value={context}>{children}</Context>,
      }).result.current;
  it('works with empty base URL', () => {
    const mockUseBaseUrl = createUseBaseUrlMock({
      siteConfig: {
        baseUrl: '/',
        url: 'https://docusaurus.io',
        future,
      },
    } as DocusaurusContext);

    expect(mockUseBaseUrl('hello')).toBe('/hello');
    expect(mockUseBaseUrl('/hello')).toBe('/hello');
    expect(mockUseBaseUrl('hello/')).toBe('/hello/');
    expect(mockUseBaseUrl('/hello/')).toBe('/hello/');
    expect(mockUseBaseUrl('hello/foo')).toBe('/hello/foo');
    expect(mockUseBaseUrl('/hello/foo')).toBe('/hello/foo');
    expect(mockUseBaseUrl('hello/foo/')).toBe('/hello/foo/');
    expect(mockUseBaseUrl('/hello/foo/')).toBe('/hello/foo/');
    expect(mockUseBaseUrl('https://github.com')).toBe('https://github.com');
    expect(mockUseBaseUrl('//reactjs.org')).toBe('//reactjs.org');
    expect(mockUseBaseUrl('//reactjs.org', forcePrepend)).toBe('//reactjs.org');
    expect(mockUseBaseUrl('https://site.com', forcePrepend)).toBe(
      'https://site.com',
    );
    expect(mockUseBaseUrl('/hello/foo', {absolute: true})).toBe(
      'https://docusaurus.io/hello/foo',
    );
    expect(mockUseBaseUrl('#hello')).toBe('#hello');
  });

  it('works with non-empty base URL', () => {
    const mockUseBaseUrl = createUseBaseUrlMock({
      siteConfig: {
        baseUrl: '/docusaurus/',
        url: 'https://docusaurus.io',
        future,
      },
    } as DocusaurusContext);

    expect(mockUseBaseUrl('')).toBe('');
    expect(mockUseBaseUrl('hello')).toBe('/docusaurus/hello');
    expect(mockUseBaseUrl('/hello')).toBe('/docusaurus/hello');
    expect(mockUseBaseUrl('hello/')).toBe('/docusaurus/hello/');
    expect(mockUseBaseUrl('/hello/')).toBe('/docusaurus/hello/');
    expect(mockUseBaseUrl('hello/foo')).toBe('/docusaurus/hello/foo');
    expect(mockUseBaseUrl('/hello/foo')).toBe('/docusaurus/hello/foo');
    expect(mockUseBaseUrl('hello/foo/')).toBe('/docusaurus/hello/foo/');
    expect(mockUseBaseUrl('/hello/foo/')).toBe('/docusaurus/hello/foo/');
    expect(mockUseBaseUrl('https://github.com')).toBe('https://github.com');
    expect(mockUseBaseUrl('//reactjs.org')).toBe('//reactjs.org');
    expect(mockUseBaseUrl('//reactjs.org', forcePrepend)).toBe('//reactjs.org');
    expect(mockUseBaseUrl('/hello', forcePrepend)).toBe('/docusaurus/hello');
    expect(mockUseBaseUrl('https://site.com', forcePrepend)).toBe(
      'https://site.com',
    );
    expect(mockUseBaseUrl('/hello/foo', {absolute: true})).toBe(
      'https://docusaurus.io/docusaurus/hello/foo',
    );
    expect(mockUseBaseUrl('/docusaurus')).toBe('/docusaurus/');
    expect(mockUseBaseUrl('/docusaurus/')).toBe('/docusaurus/');
    expect(mockUseBaseUrl('/docusaurus/hello')).toBe('/docusaurus/hello');
    expect(mockUseBaseUrl('#hello')).toBe('#hello');
  });
});

describe('useBaseUrlUtils().withBaseUrl()', () => {
  const mockUseBaseUrlUtils = (context: DocusaurusContext) =>
    renderHook(() => useBaseUrlUtils(), {
      wrapper: ({children}) => <Context value={context}>{children}</Context>,
    }).result.current;
  it('empty base URL', () => {
    const {withBaseUrl} = mockUseBaseUrlUtils({
      siteConfig: {
        baseUrl: '/',
        url: 'https://docusaurus.io',
        future,
      },
    } as DocusaurusContext);

    expect(withBaseUrl('hello')).toBe('/hello');
    expect(withBaseUrl('/hello')).toBe('/hello');
    expect(withBaseUrl('hello/')).toBe('/hello/');
    expect(withBaseUrl('/hello/')).toBe('/hello/');
    expect(withBaseUrl('hello/foo')).toBe('/hello/foo');
    expect(withBaseUrl('/hello/foo')).toBe('/hello/foo');
    expect(withBaseUrl('hello/foo/')).toBe('/hello/foo/');
    expect(withBaseUrl('/hello/foo/')).toBe('/hello/foo/');
    expect(withBaseUrl('https://github.com')).toBe('https://github.com');
    expect(withBaseUrl('//reactjs.org')).toBe('//reactjs.org');
    expect(withBaseUrl('//reactjs.org', forcePrepend)).toBe('//reactjs.org');
    expect(withBaseUrl('https://site.com', forcePrepend)).toBe(
      'https://site.com',
    );
    expect(withBaseUrl('/hello/foo', {absolute: true})).toBe(
      'https://docusaurus.io/hello/foo',
    );
    expect(withBaseUrl('#hello')).toBe('#hello');
  });

  it('non-empty base URL', () => {
    const {withBaseUrl} = mockUseBaseUrlUtils({
      siteConfig: {
        baseUrl: '/docusaurus/',
        url: 'https://docusaurus.io',
        future,
      },
    } as DocusaurusContext);

    expect(withBaseUrl('hello')).toBe('/docusaurus/hello');
    expect(withBaseUrl('/hello')).toBe('/docusaurus/hello');
    expect(withBaseUrl('hello/')).toBe('/docusaurus/hello/');
    expect(withBaseUrl('/hello/')).toBe('/docusaurus/hello/');
    expect(withBaseUrl('hello/foo')).toBe('/docusaurus/hello/foo');
    expect(withBaseUrl('/hello/foo')).toBe('/docusaurus/hello/foo');
    expect(withBaseUrl('hello/foo/')).toBe('/docusaurus/hello/foo/');
    expect(withBaseUrl('/hello/foo/')).toBe('/docusaurus/hello/foo/');
    expect(withBaseUrl('https://github.com')).toBe('https://github.com');
    expect(withBaseUrl('//reactjs.org')).toBe('//reactjs.org');
    expect(withBaseUrl('//reactjs.org', forcePrepend)).toBe('//reactjs.org');
    expect(withBaseUrl('https://site.com', forcePrepend)).toBe(
      'https://site.com',
    );
    expect(withBaseUrl('/hello/foo', {absolute: true})).toBe(
      'https://docusaurus.io/docusaurus/hello/foo',
    );
    expect(withBaseUrl('/docusaurus')).toBe('/docusaurus/');
    expect(withBaseUrl('/docusaurus/')).toBe('/docusaurus/');
    expect(withBaseUrl('/docusaurus/hello')).toBe('/docusaurus/hello');
    expect(withBaseUrl('#hello')).toBe('#hello');
  });
});
