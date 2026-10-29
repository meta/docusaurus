/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {usePrevious, useShallowMemoObject} from '../reactUtils';

describe('usePrevious', () => {
  it('returns the previous value of a variable', () => {
    const {result, rerender} = renderHook((val) => usePrevious(val), {
      initialProps: 1,
    });
    expect(result.current).toBeUndefined();
    rerender(2);
    expect(result.current).toBe(1);
    rerender(3);
    expect(result.current).toBe(2);
  });
});

describe('useShallowMemoObject', () => {
  it('can memoize object', () => {
    const someObj = {hello: 'world'};
    const someArray = ['hello', 'world'];

    const obj1 = {a: 1, b: '2', someObj, someArray};
    const {result, rerender} = renderHook<object, object>(
      (val) => useShallowMemoObject(val),
      {
        initialProps: obj1,
      },
    );
    expect(result.current).toBe(obj1);

    const obj2 = {a: 1, b: '2', someObj, someArray};
    rerender(obj2);
    expect(result.current).toBe(obj1);

    const obj3 = {a: 1, b: '2', someObj, someArray};
    rerender(obj3);
    expect(result.current).toBe(obj1);

    const obj4 = {b: '2', a: 1, someObj, someArray};
    rerender(obj4);
    expect(result.current).toBe(obj1);

    const obj5 = {b: '2', a: 1, someObj, someArray};
    rerender(obj5);
    expect(result.current).toBe(obj1);

    const obj6 = {b: 1, a: '2', someObj, someArray};
    rerender(obj6);
    expect(result.current).toBe(obj6);
    expect(result.current).not.toBe(obj5);

    const obj7 = {b: 1, a: '2', someObj: {...someObj}, someArray};
    rerender(obj7);
    expect(result.current).toBe(obj7);
    expect(result.current).not.toBe(obj6);

    const obj8 = {...obj7};
    rerender(obj8);
    expect(result.current).toBe(obj7);

    const obj9 = {...obj7, another: true};
    rerender(obj9);
    expect(result.current).toBe(obj9);
    expect(result.current).not.toBe(obj7);
  });
});
