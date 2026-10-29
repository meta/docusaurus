/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useDocsSidebar, DocsSidebarProvider} from '../docsSidebar';
import type {PropSidebar} from '@docusaurus/plugin-content-docs';

describe('useDocsSidebar', () => {
  it('throws if context provider is missing', () => {
    expect(
      () => renderHook(() => useDocsSidebar()).result.current?.items,
    ).toThrowErrorMatchingInlineSnapshot(
      `[ReactContextError: Hook useDocsSidebar is called outside the <DocsSidebarProvider>. ]`,
    );
  });

  it('reads value from context provider', () => {
    const name = 'mySidebarName';
    const items: PropSidebar = [];
    const {result} = renderHook(() => useDocsSidebar(), {
      wrapper: ({children}) => (
        <DocsSidebarProvider name={name} items={items}>
          {children}
        </DocsSidebarProvider>
      ),
    });
    expect(result.current).toBeDefined();
    expect(result.current!.name).toBe(name);
    expect(result.current!.items).toBe(items);
  });
});
