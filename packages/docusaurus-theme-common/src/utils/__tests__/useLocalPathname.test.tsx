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
import {useLocalPathname} from '../useLocalPathname';
import type {DocusaurusContext} from '@docusaurus/types';

describe('useLocalPathname', () => {
  const createUseLocalPathnameMock =
    (context: DocusaurusContext) => (location: string) =>
      renderHook(() => useLocalPathname(), {
        wrapper: ({children}) => (
          <Context value={context}>
            <StaticRouter location={location}>{children}</StaticRouter>
          </Context>
        ),
      }).result.current;
  it('works for baseUrl: /', () => {
    const mockUseLocalPathname = createUseLocalPathnameMock({
      siteConfig: {baseUrl: '/'},
    } as DocusaurusContext);
    expect(mockUseLocalPathname('/foo')).toBe('/foo');
  });

  it('works for non-root baseUrl', () => {
    const mockUseLocalPathname = createUseLocalPathnameMock({
      siteConfig: {baseUrl: '/base/'},
    } as DocusaurusContext);
    expect(mockUseLocalPathname('/base/foo')).toBe('/foo');
  });
});
