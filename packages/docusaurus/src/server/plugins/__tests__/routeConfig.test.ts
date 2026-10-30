/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {
  aliasModulePath,
  aliasRouteModulePaths,
  applyRouteTrailingSlash,
  sortRoutes,
} from '../routeConfig';
import type {RouteConfig} from '@docusaurus/types';
import type {ApplyTrailingSlashParams} from '@docusaurus/utils-common';

function route(routePath: string, subRoutes?: string[]): RouteConfig {
  const result: RouteConfig = {path: routePath, component: 'any'};

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

const siteDir = path.resolve('/site');
const generatedFilesDir = path.join(siteDir, '.docusaurus');
const aliasContext = {siteDir, generatedFilesDir};

describe('aliasModulePath', () => {
  it('aliases absolute paths inside generatedFilesDir', () => {
    expect(
      aliasModulePath(
        path.join(generatedFilesDir, 'my-plugin', 'default', 'data.json'),
        aliasContext,
      ),
    ).toBe('@generated/my-plugin/default/data.json');
  });

  it('aliases absolute paths inside siteDir', () => {
    expect(
      aliasModulePath(path.join(siteDir, 'src', 'Comp.tsx'), aliasContext),
    ).toBe('@site/src/Comp.tsx');
  });

  it('keeps absolute paths outside siteDir', () => {
    const outsidePath = path.resolve('/node_modules/some-theme/Comp.js');
    expect(aliasModulePath(outsidePath, aliasContext)).toBe(outsidePath);
  });

  it('keeps absolute paths of a sibling dir sharing the siteDir prefix', () => {
    const siblingPath = path.resolve('/site-other/Comp.js');
    expect(aliasModulePath(siblingPath, aliasContext)).toBe(siblingPath);
  });

  it('keeps non-absolute paths', () => {
    expect(aliasModulePath('@theme/DocItem', aliasContext)).toBe(
      '@theme/DocItem',
    );
    expect(aliasModulePath('@site/docs/hello.md', aliasContext)).toBe(
      '@site/docs/hello.md',
    );
    expect(aliasModulePath('~blog/default/data.json', aliasContext)).toBe(
      '~blog/default/data.json',
    );
    expect(aliasModulePath('some-package/Comp', aliasContext)).toBe(
      'some-package/Comp',
    );
  });
});

describe('aliasRouteModulePaths', () => {
  const dataPath = (name: string) =>
    path.join(generatedFilesDir, 'my-plugin', 'default', name);

  it('aliases all the module paths of a route tree', () => {
    const routeConfig: RouteConfig = {
      path: '/page',
      component: path.join(siteDir, 'src', 'Layout.tsx'),
      context: {plugin: dataPath('__plugin.json')},
      routes: [
        {
          path: '/page/sub',
          component: '@theme/SubPage',
          modules: {
            data: dataPath('data.json'),
            items: [
              {
                content: {
                  __import: true,
                  path: path.join(siteDir, 'blog', 'post.md'),
                  query: {truncated: true},
                },
              },
            ],
          },
        },
      ],
    };

    expect(aliasRouteModulePaths(routeConfig, aliasContext))
      .toMatchInlineSnapshot(`
      {
        "component": "@site/src/Layout.tsx",
        "context": {
          "plugin": "@generated/my-plugin/default/__plugin.json",
        },
        "path": "/page",
        "routes": [
          {
            "component": "@theme/SubPage",
            "modules": {
              "data": "@generated/my-plugin/default/data.json",
              "items": [
                {
                  "content": {
                    "__import": true,
                    "path": "@site/blog/post.md",
                    "query": {
                      "truncated": true,
                    },
                  },
                },
              ],
            },
            "path": "/page/sub",
          },
        ],
      }
    `);
  });

  it('keeps routes that are already aliased unchanged', () => {
    const routeConfig: RouteConfig = {
      path: '/page',
      component: '@theme/Page',
      exact: true,
      modules: {data: '@generated/my-plugin/default/data.json'},
      context: {plugin: '@generated/my-plugin/default/__plugin.json'},
    };

    // The key order matters: route hashes are computed from JSON.stringify()
    expect(
      JSON.stringify(aliasRouteModulePaths(routeConfig, aliasContext)),
    ).toBe(JSON.stringify(routeConfig));
  });
});
