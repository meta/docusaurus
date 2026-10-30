/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import {createMemoryRouter, matchRoutes, type Location} from 'react-router';
import normalizeLocation, {patchHtmlRoutes} from '../normalizeLocation';
import {routeObjects} from '../routeObjects';

vi.mock('react-router', {spy: true});
vi.mock('@generated/routes', () => import('./__mocks__/@generated/routes'));

describe('normalizeLocation', () => {
  it('rewrites locations with index.html', () => {
    expect(
      normalizeLocation({
        pathname: '/index.html',
      } as Location),
    ).toEqual({
      pathname: '/',
    });

    expect(
      normalizeLocation({
        pathname: '/docs/introduction/index.html',
        search: '?search=foo',
        hash: '#features',
      } as Location),
    ).toEqual({
      pathname: '/docs/introduction',
      search: '?search=foo',
      hash: '#features',
    });

    expect(
      normalizeLocation({
        pathname: '/index.html',
        search: '',
        hash: '#features',
      } as Location),
    ).toEqual({
      pathname: '/',
      search: '',
      hash: '#features',
    });
  });

  it('removes html extension', () => {
    expect(
      normalizeLocation({
        pathname: '/docs/installation.html',
      } as Location),
    ).toEqual({
      pathname: '/docs/installation',
    });
    expect(
      normalizeLocation({
        pathname: '/docs/introduction/foo.html',
        search: '',
        hash: '#bar',
      } as Location),
    ).toEqual({
      pathname: '/docs/introduction/foo',
      search: '',
      hash: '#bar',
    });
  });

  it('does not strip extension if the route location has one', () => {
    expect(normalizeLocation({pathname: '/page.html'} as Location)).toEqual({
      pathname: '/page.html',
    });
  });

  it('leaves pathnames untouched', () => {
    vi.mocked(matchRoutes).mockClear();

    expect(
      normalizeLocation({
        pathname: '/docs/introduction',
        search: '',
        hash: '#features',
      } as Location),
    ).toEqual({
      pathname: '/docs/introduction',
      search: '',
      hash: '#features',
    });

    // For the sake of testing memoization
    expect(
      normalizeLocation({
        pathname: '/docs/introduction',
        search: '',
        hash: '#features',
      } as Location),
    ).toEqual({
      pathname: '/docs/introduction',
      search: '',
      hash: '#features',
    });
    expect(matchRoutes).toHaveBeenCalledTimes(1);

    expect(
      normalizeLocation({
        pathname: '/',
      } as Location),
    ).toEqual({
      pathname: '/',
    });
  });
});

describe('patchHtmlRoutes', () => {
  async function getLeafRoute(pathname: string) {
    const router = createMemoryRouter([{id: 'root', children: routeObjects}], {
      initialEntries: [pathname],
      patchRoutesOnNavigation: patchHtmlRoutes('root'),
    });
    await vi.waitFor(() => expect(router.state.initialized).toBe(true));
    const {path, handle} = router.state.matches.at(-1)!.route;
    return {path, patched: handle === undefined};
  }

  it('adds routes for .html paths', async () => {
    await expect(getLeafRoute('/docs/installation.html')).resolves.toEqual({
      path: '/docs/installation.html',
      patched: true,
    });
    await expect(
      getLeafRoute('/docs/installation/index.html'),
    ).resolves.toEqual({path: '/docs/installation/index.html', patched: true});
  });

  it('does not patch routes registered with an .html extension', async () => {
    await expect(getLeafRoute('/page.html')).resolves.toEqual({
      path: '/page.html',
      patched: false,
    });
  });
});
