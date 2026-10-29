/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {act} from 'react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {renderHook} from '@testing-library/react';
import useIsBrowser from '../useIsBrowser';

describe('useIsBrowser', () => {
  it('returns false on the server', () => {
    function Comp() {
      return <span>{String(useIsBrowser())}</span>;
    }
    expect(renderToString(<Comp />)).toBe('<span>false</span>');
  });

  it('returns true on client render', () => {
    const {result} = renderHook(() => useIsBrowser());
    expect(result.current).toBe(true);
  });

  it('returns false on hydration, then true', async () => {
    const values: boolean[] = [];
    function Comp() {
      const isBrowser = useIsBrowser();
      values.push(isBrowser);
      return <span>{String(isBrowser)}</span>;
    }
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Comp />);
    values.length = 0;

    const recoverableErrors: unknown[] = [];
    await act(async () => {
      hydrateRoot(container, <Comp />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });

    expect(recoverableErrors).toEqual([]);
    expect(values).toEqual([false, true]);
    expect(container.innerHTML).toBe('<span>true</span>');
  });
});
