/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {flattenRoutes} from '../routeUtils';
import type {RouteConfig} from '@docusaurus/types';

describe('flattenRoutes', () => {
  it('returns flattened routes without parents', () => {
    const routes: RouteConfig[] = [
      {
        path: '/docs',
        component: '',
        routes: [
          {path: '/docs/someDoc', component: ''},
          {path: '/docs/someOtherDoc', component: ''},
        ],
      },
      {
        path: '/community',
        component: '',
      },
    ];
    expect(flattenRoutes(routes)).toEqual([
      routes[0]!.routes![0],
      routes[0]!.routes![1],
      routes[1],
    ]);
  });
});
