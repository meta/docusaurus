/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import useGlobalData, {
  useAllPluginInstancesData,
  usePluginData,
} from '../useGlobalData';
import {Context} from '../../docusaurusContext';
import type {DocusaurusContext} from '@docusaurus/types';

describe('useGlobalData', () => {
  it('returns global data from context', () => {
    expect(
      renderHook(() => useGlobalData(), {
        wrapper: ({children}) => (
          <Context
            value={{globalData: {foo: 'bar'}} as unknown as DocusaurusContext}>
            {children}
          </Context>
        ),
      }).result.current,
    ).toEqual({foo: 'bar'});
  });
});

describe('useAllPluginInstancesData', () => {
  it('returns plugin data namespace', () => {
    expect(
      renderHook(() => useAllPluginInstancesData('foo'), {
        wrapper: ({children}) => (
          <Context
            value={
              {
                globalData: {foo: {default: 'default', bar: 'bar'}},
              } as unknown as DocusaurusContext
            }>
            {children}
          </Context>
        ),
      }).result.current,
    ).toEqual({default: 'default', bar: 'bar'});
  });

  it('throws when plugin data not found', () => {
    expect(
      () =>
        renderHook(() => useAllPluginInstancesData('bar', {failfast: true}), {
          wrapper: ({children}) => (
            <Context
              value={
                {
                  globalData: {foo: {default: 'default', bar: 'bar'}},
                } as unknown as DocusaurusContext
              }>
              {children}
            </Context>
          ),
        }).result.current,
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Docusaurus plugin global data not found for "bar" plugin.]`,
    );
  });
});

describe('usePluginData', () => {
  it('returns plugin instance data', () => {
    expect(
      renderHook(() => usePluginData('foo', 'bar'), {
        wrapper: ({children}) => (
          <Context
            value={
              {
                globalData: {foo: {default: 'default', bar: 'bar'}},
              } as unknown as DocusaurusContext
            }>
            {children}
          </Context>
        ),
      }).result.current,
    ).toBe('bar');
  });

  it('defaults to default ID', () => {
    expect(
      renderHook(() => usePluginData('foo'), {
        wrapper: ({children}) => (
          <Context
            value={
              {
                globalData: {foo: {default: 'default', bar: 'bar'}},
              } as unknown as DocusaurusContext
            }>
            {children}
          </Context>
        ),
      }).result.current,
    ).toBe('default');
  });

  it('throws when plugin instance data not found', () => {
    expect(
      () =>
        renderHook(() => usePluginData('foo', 'baz', {failfast: true}), {
          wrapper: ({children}) => (
            <Context
              value={
                {
                  globalData: {foo: {default: 'default', bar: 'bar'}},
                } as unknown as DocusaurusContext
              }>
              {children}
            </Context>
          ),
        }).result.current,
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Docusaurus plugin global data not found for "foo" plugin with id "baz".]`,
    );
  });
});
