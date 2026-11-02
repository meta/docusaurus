/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
import {describe, expect, it, vi, afterEach} from 'vitest';
import type {ReactNode} from 'react';
import {render, screen, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {MemoryRouter} from 'react-router-dom';
import {Context} from '@docusaurus/core/src/client/docusaurusContext';
import DropdownNavbarItemDesktop from '../DropdownNavbarItem/Desktop';
import DropdownNavbarItemMobile from '../DropdownNavbarItem/Mobile';
import type {DocusaurusContext} from '@docusaurus/types';

window.docusaurus = {
  prefetch: vi.fn(),
  preload: vi.fn(),
};

function TestProviders({
  children,
  pathname = '/',
}: {
  children?: ReactNode;
  pathname?: string;
}) {
  const context = {
    siteConfig: {
      baseUrl: '/',
      future: {
        // eslint-disable-next-line camelcase
        experimental_router: 'browser',
      },
    },
  } as unknown as DocusaurusContext;

  return (
    <Context value={context}>
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    </Context>
  );
}

describe('DropdownNavbarItem', () => {
  afterEach(cleanup);

  const defaultItems = [
    {label: 'Intro', to: '/docs/intro'},
    {label: 'Advanced', to: '/docs/advanced'},
  ];

  it('renders dropdown with inactive parent when no child item matches', () => {
    render(
      <TestProviders pathname="/blog">
        <DropdownNavbarItemDesktop label="Docs" items={defaultItems} />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link');
    expect(dropdownLink).not.toHaveClass('navbar__link--active');
  });

  it('renders dropdown with active parent when a child item matches pathname', () => {
    render(
      <TestProviders pathname="/docs/intro">
        <DropdownNavbarItemDesktop label="Docs" items={defaultItems} />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link');
    expect(dropdownLink).toHaveClass('navbar__link--active');
  });

  it('renders dropdown with active parent when matching trailing slash', () => {
    render(
      <TestProviders pathname="/docs/intro/">
        <DropdownNavbarItemDesktop label="Docs" items={defaultItems} />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link--active');
  });

  it('renders active parent when child matches activeBasePath', () => {
    const items = [{label: 'Tutorials', activeBasePath: '/tutorials'}];

    render(
      <TestProviders pathname="/tutorials/getting-started">
        <DropdownNavbarItemDesktop label="Learn" items={items} />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Learn'});
    expect(dropdownLink).toHaveClass('navbar__link--active');
  });

  it('renders active parent when child matches activeBaseRegex', () => {
    const items = [{label: 'Community', activeBaseRegex: '^/community/.*'}];

    render(
      <TestProviders pathname="/community/team">
        <DropdownNavbarItemDesktop label="Community" items={items} />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Community'});
    expect(dropdownLink).toHaveClass('navbar__link--active');
  });

  it('renders active parent when dropdown has "to" and is on child path', () => {
    render(
      <TestProviders pathname="/docs/advanced">
        <DropdownNavbarItemDesktop
          label="Docs"
          to="/docs"
          items={defaultItems}
        />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link--active');
  });

  it('renders active parent when dropdown has "to" and is on own path', () => {
    render(
      <TestProviders pathname="/docs">
        <DropdownNavbarItemDesktop
          label="Docs"
          to="/docs"
          items={defaultItems}
        />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link--active');
  });

  it('does not render active class when isActive returns false', () => {
    render(
      <TestProviders pathname="/docs/intro">
        <DropdownNavbarItemDesktop
          label="Docs"
          items={defaultItems}
          isActive={() => false}
        />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link');
    expect(dropdownLink).not.toHaveClass('navbar__link--active');
  });

  it('respects custom activeClassName', () => {
    render(
      <TestProviders pathname="/docs/intro">
        <DropdownNavbarItemDesktop
          label="Docs"
          items={defaultItems}
          activeClassName="my-custom-active-class"
        />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link');
    expect(dropdownLink).toHaveClass('my-custom-active-class');
    expect(dropdownLink).not.toHaveClass('navbar__link--active');
  });

  it('renders active parent when child isActive inspects router location search', () => {
    const items = [
      {
        label: 'Search Item',
        to: '/docs/intro',
        isActive: (_match: unknown, location: {search: string}) =>
          location.search === '?filter=active',
      },
    ];

    render(
      <TestProviders pathname="/docs/intro?filter=active">
        <DropdownNavbarItemDesktop label="Docs" items={items} />
      </TestProviders>,
    );

    const dropdownLink = screen.getByRole('button', {name: 'Docs'});
    expect(dropdownLink).toHaveClass('navbar__link--active');
  });

  it('expands mobile dropdown when child isActive inspects router location search', () => {
    const items = [
      {
        label: 'Search Item',
        to: '/docs/intro',
        isActive: (_match: unknown, location: {search: string}) =>
          location.search === '?filter=active',
      },
    ];

    const {container} = render(
      <TestProviders pathname="/docs/intro?filter=active">
        <DropdownNavbarItemMobile label="Docs" items={items} />
      </TestProviders>,
    );

    const listItem = container.querySelector('li.menu__list-item');
    expect(listItem).not.toHaveClass('menu__list-item--collapsed');
  });
});
