/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {applyRouteTrailingSlash, sortRoutes} from '../routeConfig';
import type {RouteConfig} from '@docusaurus/types';
import type {ApplyTrailingSlashParams} from '@docusaurus/utils-common';

function route(path: string, subRoutes?: string[]): RouteConfig {
  const result: RouteConfig = {path, component: 'any'};

  if (subRoutes) {
    result.routes = subRoutes.map((subRoute) => route(subRoute));
  }

  return result;
}

function params(
  trailingSlash: boolean | undefined,
  baseUrl: string = '/',
): ApplyTrailingSlashParams {
  return {trailingSlash, baseUrl};
}

describe('applyRouteTrailingSlash', () => {
  it('apply to empty', () => {
    expect(applyRouteTrailingSlash(route(''), params(true))).toEqual(
      route('/'),
    );
    expect(applyRouteTrailingSlash(route(''), params(false))).toEqual(
      route(''),
    );
    expect(applyRouteTrailingSlash(route(''), params(undefined))).toEqual(
      route(''),
    );
  });

  it('apply to /', () => {
    expect(applyRouteTrailingSlash(route('/'), params(true))).toEqual(
      route('/'),
    );
    expect(applyRouteTrailingSlash(route('/'), params(false))).toEqual(
      route('/'),
    );
    expect(applyRouteTrailingSlash(route('/'), params(undefined))).toEqual(
      route('/'),
    );
  });

  it('apply to /abc', () => {
    expect(applyRouteTrailingSlash(route('/abc'), params(true))).toEqual(
      route('/abc/'),
    );
    expect(applyRouteTrailingSlash(route('/abc'), params(false))).toEqual(
      route('/abc'),
    );
    expect(applyRouteTrailingSlash(route('/abc'), params(undefined))).toEqual(
      route('/abc'),
    );
  });

  it('apply to /abc/', () => {
    expect(applyRouteTrailingSlash(route('/abc/'), params(true))).toEqual(
      route('/abc/'),
    );
    expect(applyRouteTrailingSlash(route('/abc/'), params(false))).toEqual(
      route('/abc'),
    );
    expect(applyRouteTrailingSlash(route('/abc/'), params(undefined))).toEqual(
      route('/abc/'),
    );
  });

  it('apply to /abc?search#anchor', () => {
    expect(
      applyRouteTrailingSlash(route('/abc?search#anchor'), params(true)),
    ).toEqual(route('/abc/?search#anchor'));
    expect(
      applyRouteTrailingSlash(route('/abc?search#anchor'), params(false)),
    ).toEqual(route('/abc?search#anchor'));
    expect(
      applyRouteTrailingSlash(route('/abc?search#anchor'), params(undefined)),
    ).toEqual(route('/abc?search#anchor'));
  });

  it('apply to /abc/?search#anchor', () => {
    expect(
      applyRouteTrailingSlash(route('/abc/?search#anchor'), params(true)),
    ).toEqual(route('/abc/?search#anchor'));
    expect(
      applyRouteTrailingSlash(route('/abc/?search#anchor'), params(false)),
    ).toEqual(route('/abc?search#anchor'));
    expect(
      applyRouteTrailingSlash(route('/abc/?search#anchor'), params(undefined)),
    ).toEqual(route('/abc/?search#anchor'));
  });

  it('not apply to /abc/?search#anchor when baseUrl=/abc/', () => {
    const baseUrl = '/abc/';
    expect(
      applyRouteTrailingSlash(
        route('/abc/?search#anchor'),
        params(true, baseUrl),
      ),
    ).toEqual(route('/abc/?search#anchor'));
    expect(
      applyRouteTrailingSlash(
        route('/abc/?search#anchor'),
        params(false, baseUrl),
      ),
    ).toEqual(route('/abc/?search#anchor'));
    expect(
      applyRouteTrailingSlash(
        route('/abc/?search#anchor'),
        params(undefined, baseUrl),
      ),
    ).toEqual(route('/abc/?search#anchor'));
  });

  it('apply to subroutes', () => {
    expect(
      applyRouteTrailingSlash(
        route('/abc', ['/abc/1', '/abc/2']),
        params(true),
      ),
    ).toEqual(route('/abc/', ['/abc/1/', '/abc/2/']));
    expect(
      applyRouteTrailingSlash(
        route('/abc', ['/abc/1', '/abc/2']),
        params(false),
      ),
    ).toEqual(route('/abc', ['/abc/1', '/abc/2']));
    expect(
      applyRouteTrailingSlash(
        route('/abc', ['/abc/1', '/abc/2']),
        params(undefined),
      ),
    ).toEqual(route('/abc', ['/abc/1', '/abc/2']));
  });

  it('apply for complex case', () => {
    expect(
      applyRouteTrailingSlash(
        route('/abc?search#anchor', ['/abc/1?search', '/abc/2#anchor']),
        params(true),
      ),
    ).toEqual(
      route('/abc/?search#anchor', ['/abc/1/?search', '/abc/2/#anchor']),
    );
  });

  it('apply for complex case with baseUrl', () => {
    const baseUrl = '/abc/';
    expect(
      applyRouteTrailingSlash(
        route('/abc/?search#anchor', ['/abc/1?search', '/abc/2#anchor']),
        params(false, baseUrl),
      ),
    ).toEqual(route('/abc/?search#anchor', ['/abc/1?search', '/abc/2#anchor']));
  });
});

describe('sortRoutes', () => {
  it('sorts route config correctly', () => {
    const routes: RouteConfig[] = [
      {
        path: '/',
        component: '',
        routes: [
          {path: '/someDoc', component: ''},
          {path: '/someOtherDoc', component: ''},
        ],
      },
      {
        path: '/',
        component: '',
      },
      {
        path: '/',
        component: '',
        routes: [{path: '/subroute', component: ''}],
      },
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
      {
        path: '/some-page',
        component: '',
      },
    ];

    expect(sortRoutes(routes, '/')).toMatchSnapshot();
  });

  it('sorts route config recursively', () => {
    const routes: RouteConfig[] = [
      {
        path: '/docs',
        component: '',
        routes: [
          {
            path: '/docs/tags',
            component: '',
            exact: true,
          },
          {
            path: '/docs',
            component: '',
            routes: [
              {
                path: '/docs/doc1',
                component: '',
                exact: true,
              },
              {
                path: '/docs/doc2',
                component: '',
                exact: true,
              },
            ],
          },
          {
            path: '/docs/tags/someTag',
            component: '',
            exact: true,
          },
        ],
      },
      {
        path: '/some/page',
        component: '',
        exact: true,
      },
    ];

    expect(sortRoutes(routes, '/')).toMatchSnapshot();
  });

  it('sorts route config given a baseURL', () => {
    const baseURL = '/latest/';
    const routes: RouteConfig[] = [
      {
        path: baseURL,
        component: '',
        routes: [
          {path: `${baseURL}someDoc`, component: ''},
          {path: `${baseURL}someOtherDoc`, component: ''},
        ],
      },
      {
        path: `${baseURL}example`,
        component: '',
      },
      {
        path: `${baseURL}docs`,
        component: '',
        routes: [
          {path: `${baseURL}docs/someDoc`, component: ''},
          {path: `${baseURL}docs/someOtherDoc`, component: ''},
        ],
      },
      {
        path: `${baseURL}community`,
        component: '',
      },
      {
        path: `${baseURL}some-page`,
        component: '',
      },
      {
        path: `${baseURL}`,
        component: '',
      },
    ];

    expect(sortRoutes(routes, baseURL)).toMatchSnapshot();
  });

  it('sorts parent route configs when one included in another', () => {
    const r1: RouteConfig = {
      path: '/one',
      component: '',
      routes: [{path: `/one/myDoc`, component: ''}],
    };
    const r2: RouteConfig = {
      path: '/',
      component: '',
      routes: [{path: `/someDoc`, component: ''}],
    };
    const r3: RouteConfig = {
      path: '/one/another',
      component: '',
      routes: [{path: `/one/another/myDoc`, component: ''}],
    };

    expect(sortRoutes([r1, r2, r3], '/')).toEqual([r3, r1, r2]);
    expect(sortRoutes([r3, r1, r2], '/')).toEqual([r3, r1, r2]);
  });
});
