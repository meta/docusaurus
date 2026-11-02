// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import React from 'react';
import {render, waitFor} from '@testing-library/react';
import ClientLifecyclesDispatcher from '../ClientLifecyclesDispatcher';
import type {Location} from 'history';

vi.mock('@generated/client-modules', () => ({
  default: [],
}));

function makeLocation(partial: Partial<Location>): Location {
  return {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'k',
    ...partial,
  } as Location;
}

function renderNavigation(previousLocation: Location, location: Location) {
  return render(
    <ClientLifecyclesDispatcher
      location={location}
      previousLocation={previousLocation}>
      <div />
    </ClientLifecyclesDispatcher>,
  );
}

describe('ClientLifecyclesDispatcher', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    Element.prototype.scrollIntoView ??= () => {};

    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('scrolls to the anchor when the target element already exists', () => {
    const target = document.createElement('div');
    target.id = 'target';
    document.body.append(target);

    renderNavigation(
      makeLocation({pathname: '/a'}),
      makeLocation({pathname: '/b', hash: '#target'}),
    );

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the anchor element does not exist', () => {
    expect(() => {
      renderNavigation(
        makeLocation({pathname: '/a'}),
        makeLocation({pathname: '/b', hash: '#missing'}),
      );
    }).not.toThrow();

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls to the top when navigating without a hash', () => {
    renderNavigation(
      makeLocation({pathname: '/a', hash: '#old'}),
      makeLocation({pathname: '/b'}),
    );

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when only the query string changes', () => {
    const previousLocation = makeLocation({
      pathname: '/a',
      search: '?page=1',
      hash: '#target',
    });

    const location = makeLocation({
      pathname: '/a',
      search: '?page=2',
      hash: '#target',
    });

    renderNavigation(previousLocation, location);

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not manually scroll on the initial page load', () => {
    render(
      <ClientLifecyclesDispatcher
        location={makeLocation({
          pathname: '/docs/intro',
          hash: '#target',
        })}
        previousLocation={null}>
        <div />
      </ClientLifecyclesDispatcher>,
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls to an encoded anchor', () => {
    const target = document.createElement('div');
    target.id = 'hello world';
    document.body.append(target);

    renderNavigation(
      makeLocation({pathname: '/a'}),
      makeLocation({
        pathname: '/b',
        hash: '#hello%20world',
      }),
    );

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('scrolls when the anchor appears after the initial navigation lifecycle', async () => {
    renderNavigation(
      makeLocation({pathname: '/a'}),
      makeLocation({
        pathname: '/b',
        hash: '#late-anchor',
      }),
    );

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();

    const target = document.createElement('div');
    target.id = 'late-anchor';
    document.body.append(target);

    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });
});
