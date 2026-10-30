/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {getLeafRouteRouterPath} from '../routeUtils';

describe('getLeafRouteRouterPath', () => {
  it('keeps the path of exact routes', () => {
    expect(getLeafRouteRouterPath({path: '/', exact: true})).toBe('/');
    expect(getLeafRouteRouterPath({path: '/a/b', exact: true})).toBe('/a/b');
    expect(getLeafRouteRouterPath({path: '/a/b/', exact: true})).toBe('/a/b/');
  });

  it('adds a splat to the path of non-exact routes', () => {
    expect(getLeafRouteRouterPath({path: '/'})).toBe('/*');
    expect(getLeafRouteRouterPath({path: '/a/b'})).toBe('/a/b/*');
    expect(getLeafRouteRouterPath({path: '/a/b/', exact: false})).toBe(
      '/a/b/*',
    );
  });

  it('keeps the path of splat routes', () => {
    expect(getLeafRouteRouterPath({path: '*'})).toBe('*');
    expect(getLeafRouteRouterPath({path: '/a/*'})).toBe('/a/*');
  });
});
