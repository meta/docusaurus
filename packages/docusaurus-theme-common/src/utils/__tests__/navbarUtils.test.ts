/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  splitNavbarItems,
  isItemActive,
  containsActiveItems,
} from '../navbarUtils';

describe('splitNavbarItems', () => {
  it('splits items by position', () => {
    const items = [
      {label: 'Docs', position: 'left' as const},
      {label: 'Blog', position: 'right' as const},
      {label: 'Community'},
    ];
    const [leftItems, rightItems] = splitNavbarItems(items);
    expect(leftItems).toEqual([{label: 'Docs', position: 'left'}]);
    expect(rightItems).toEqual([
      {label: 'Blog', position: 'right'},
      {label: 'Community'},
    ]);
  });
});

describe('isItemActive', () => {
  it('matches exact to path', () => {
    expect(isItemActive({to: '/docs/intro'}, '/docs/intro')).toBe(true);
    expect(isItemActive({to: '/docs/intro'}, '/docs/intro/')).toBe(true);
    expect(isItemActive({to: '/docs/intro/'}, '/docs/intro')).toBe(true);
    expect(isItemActive({to: '/DOCS/intro'}, '/docs/intro')).toBe(true);
    expect(isItemActive({to: '/docs/intro'}, '/docs/other')).toBe(false);
  });

  it('matches activeBasePath', () => {
    expect(isItemActive({activeBasePath: '/docs'}, '/docs/some-page')).toBe(
      true,
    );
    expect(isItemActive({activeBasePath: '/docs'}, '/blog/some-page')).toBe(
      false,
    );
  });

  it('matches activeBaseRegex', () => {
    expect(
      isItemActive({activeBaseRegex: '^/community/.*'}, '/community/team'),
    ).toBe(true);
    expect(
      isItemActive({activeBaseRegex: '^/community/.*'}, '/docs/intro'),
    ).toBe(false);
  });

  it('delegates to custom isActive function', () => {
    expect(isItemActive({to: '/docs', isActive: () => true}, '/other')).toBe(
      true,
    );
    expect(isItemActive({to: '/docs', isActive: () => false}, '/docs')).toBe(
      false,
    );
  });

  it('passes full router location to custom isActive function', () => {
    const location = {
      pathname: '/baseUrl/docs',
      search: '?version=v2',
      hash: '#section',
      state: null,
      key: 'key1',
    };
    const isActiveMock = (
      _match: unknown,
      loc: {pathname: string; search?: string; hash?: string},
    ) => loc.search === '?version=v2' && loc.pathname === '/baseUrl/docs';

    expect(
      isItemActive(
        {to: '/docs', isActive: isActiveMock},
        '/docs',
        location as never,
      ),
    ).toBe(true);
  });

  it('matches nested items', () => {
    expect(
      isItemActive(
        {
          items: [{to: '/docs/intro'}, {to: '/docs/advanced'}],
        },
        '/docs/advanced',
      ),
    ).toBe(true);
    expect(
      isItemActive(
        {
          items: [{to: '/docs/intro'}, {to: '/docs/advanced'}],
        },
        '/blog',
      ),
    ).toBe(false);
  });
});

describe('containsActiveItems', () => {
  it('returns true if any child is active', () => {
    const items = [
      {to: '/docs/intro'},
      {to: '/docs/advanced'},
      {activeBasePath: '/tutorials'},
    ];
    expect(containsActiveItems(items, '/docs/advanced')).toBe(true);
    expect(containsActiveItems(items, '/tutorials/step-1')).toBe(true);
    expect(containsActiveItems(items, '/blog')).toBe(false);
  });

  it('passes location to child items with isActive', () => {
    const location = {
      pathname: '/docs/intro',
      search: '?filter=special',
      hash: '',
      state: null,
      key: 'key1',
    };
    const items = [
      {
        to: '/docs/intro',
        isActive: (_match: unknown, loc: {pathname: string; search?: string}) =>
          loc.search === '?filter=special',
      },
    ];
    expect(containsActiveItems(items, '/docs/intro', location as never)).toBe(
      true,
    );
    expect(
      containsActiveItems(items, '/docs/intro', {
        ...location,
        search: '',
      } as never),
    ).toBe(false);
  });

  it('returns false for empty items array', () => {
    expect(containsActiveItems([], '/docs/intro')).toBe(false);
  });
});
