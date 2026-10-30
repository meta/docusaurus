/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import {matchRouteConfigs} from '../routeObjects';

vi.mock('@generated/routes', () => ({
  default: [
    {
      path: '/docs/',
      component: '',
      routes: [
        {
          path: '/docs',
          component: '',
          routes: [
            {path: '/docs', exact: true, component: ''},
            {path: '/docs/intro', exact: true, component: ''},
          ],
        },
      ],
    },
    {path: '/app', component: ''},
    {path: '*', component: ''},
  ],
}));

function matchPaths(pathname: string) {
  return matchRouteConfigs(pathname).map((route) => route.path);
}

describe('matchRouteConfigs', () => {
  it('matches nested routes', () => {
    expect(matchPaths('/docs')).toEqual(['/docs/', '/docs', '/docs']);
    expect(matchPaths('/docs/')).toEqual(['/docs/', '/docs', '/docs']);
    expect(matchPaths('/docs/intro')).toEqual([
      '/docs/',
      '/docs',
      '/docs/intro',
    ]);
  });

  it('matches subpaths of non-exact routes', () => {
    expect(matchPaths('/app')).toEqual(['/app']);
    expect(matchPaths('/app/sub/path')).toEqual(['/app']);
  });

  it('matches the catch-all route', () => {
    expect(matchPaths('/unknown')).toEqual(['*']);
    expect(matchPaths('/docs/unknown')).toEqual(['*']);
    expect(matchPaths('/docs/intro/unknown')).toEqual(['*']);
  });
});
