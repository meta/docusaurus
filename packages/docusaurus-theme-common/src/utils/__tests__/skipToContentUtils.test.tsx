/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {afterEach, describe, expect, it} from 'vitest';
import React from 'react';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter, Route, Switch, useHistory} from 'react-router-dom';
import {SkipToContentLink} from '../skipToContentUtils';
import {TitleFormatterProvider} from '../titleFormatterUtils';
import {RouteContextProvider} from '../../../../docusaurus/src/client/routeContext';
import {Context as DocusaurusContext} from '../../../../docusaurus/src/client/docusaurusContext';

describe('SkipToContentLink', () => {
  afterEach(() => {
    cleanup();
  });

  // A simple formatter that returns the title as-is, so the test does not need
  // the full Docusaurus context (siteConfig, route context, etc).
  const identityFormatter = ({
    title,
  }: {
    title: string;
    [key: string]: unknown;
  }) => title;

  function NavigateButton() {
    const history = useHistory();
    return <button onClick={() => history.push('/two')}>go to two</button>;
  }

  function PageOne() {
    return <div>Page One</div>;
  }

  function PageTwo() {
    return <div>Page Two</div>;
  }

  function renderWithTitle(title: string) {
    return render(
      <DocusaurusContext.Provider
        value={{
          siteConfig: {title: 'Docusaurus', titleDelimiter: '·'},
        }}>
        <RouteContextProvider
          value={{plugin: {id: 'test', name: 'test'}, data: {}}}>
          <TitleFormatterProvider formatter={identityFormatter}>
            <MemoryRouter initialEntries={['/one']}>
              <SkipToContentLink title={title} />
              <Switch>
                <Route path="/one" component={PageOne} />
                <Route path="/two" component={PageTwo} />
              </Switch>
              <NavigateButton />
            </MemoryRouter>
          </TitleFormatterProvider>
        </RouteContextProvider>
      </DocusaurusContext.Provider>,
    );
  }

  it('moves focus to the skip link container on route change', async () => {
    renderWithTitle('Page One Title');

    const skipLink = screen.getByText('Skip to main content');
    const container = skipLink.closest('div');
    expect(container).not.toBeNull();

    // Click the navigate button to trigger a route change
    screen.getByText('go to two').click();

    // After navigation, the focus should be on the skip link container
    await waitFor(() => {
      expect(document.activeElement).toBe(container);
    });
  });

  it('announces the page title on the skip link container when navigating', async () => {
    renderWithTitle('Page One Title');

    const skipLink = screen.getByText('Skip to main content');
    const container = skipLink.closest('div');
    expect(container).not.toBeNull();

    // Click the navigate button to trigger a route change
    screen.getByText('go to two').click();

    // The container's aria-label should be updated to the page title so the
    // screen reader announces which page the user landed on.
    await waitFor(() => {
      expect(container?.getAttribute('aria-label')).toBe('Page One Title');
    });
  });
});
