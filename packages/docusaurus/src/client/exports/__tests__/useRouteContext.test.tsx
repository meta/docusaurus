/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {RouteContextProvider} from '../../routeContext';
import useRouteContext from '../useRouteContext';

describe('useRouteContext', () => {
  it('throws when there is no route context at all', () => {
    expect(
      () => renderHook(() => useRouteContext()).result.current,
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unexpected: no Docusaurus route context found]`,
    );
  });
  it('returns merged route contexts', () => {
    expect(
      renderHook(() => useRouteContext(), {
        wrapper: ({children}) => (
          <RouteContextProvider
            value={{plugin: {id: 'test', name: 'test'}, data: {some: 'data'}}}>
            <RouteContextProvider value={{data: {someMore: 'data'}}}>
              {children}
            </RouteContextProvider>
          </RouteContextProvider>
        ),
      }).result.current,
    ).toEqual({
      data: {some: 'data', someMore: 'data'},
      plugin: {id: 'test', name: 'test'},
    });
  });
});
