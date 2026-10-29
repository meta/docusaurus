/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import type {ReactNode} from 'react';
import {renderHook} from '@testing-library/react';
import {RouteContextProvider} from '@docusaurus/core/src/client/routeContext';
import {useDocsVersion} from '../docsVersion';
import type {PropVersionMetadata} from '@docusaurus/plugin-content-docs';

function testVersion(data?: Partial<PropVersionMetadata>): PropVersionMetadata {
  return {
    version: 'versionName',
    label: 'Version Label',
    className: 'version className',
    badge: true,
    banner: 'unreleased',
    docs: {},
    docsSidebars: {},
    isLast: false,
    pluginId: 'default',
    noIndex: false,
    ...data,
  };
}

function TestRouteContextProvider({
  children,
  version,
}: {
  children: ReactNode;
  version?: PropVersionMetadata;
}) {
  return (
    <RouteContextProvider
      value={{
        plugin: {id: 'default', name: 'docusaurus-plugin-content-docs'},
        data: {docsVersion: version},
      }}>
      {children}
    </RouteContextProvider>
  );
}

describe('useDocsVersion', () => {
  it('throws if version metadata is missing', () => {
    expect(
      () =>
        renderHook(() => useDocsVersion(), {
          wrapper: ({children}) => (
            <TestRouteContextProvider>{children}</TestRouteContextProvider>
          ),
        }).result.current,
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: useDocsVersion() can't be called on the current route because the docs version metadata could not be found in route context]`,
    );
  });

  it('reads value from route context', () => {
    const version = testVersion();
    const {result} = renderHook(() => useDocsVersion(), {
      wrapper: ({children}) => (
        <TestRouteContextProvider version={version}>
          {children}
        </TestRouteContextProvider>
      ),
    });
    expect(result.current).toBe(version);
  });
});
