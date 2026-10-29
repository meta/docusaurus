/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';
import {render, act, fireEvent} from '@testing-library/react';
import {Details} from '../index';

function renderDetails(props: {open?: boolean} = {}) {
  const {container} = render(
    <Details summary="the summary" {...props}>
      the content
    </Details>,
  );
  return container.querySelector('details')!;
}

// jsdom doesn't fire the native toggle event on open changes: simulate the
// browser behavior manually
function setOpenExternally(details: HTMLDetailsElement, open: boolean) {
  act(() => {
    details.open = open;
    details.dispatchEvent(new Event('toggle'));
  });
}

describe('Details', () => {
  // Fix jsdom not implementing matchMedia()
  // See https://github.com/jsdom/jsdom/issues/3522
  // Used through Details > Collapsible > getAutoHeightDuration()
  vi.stubGlobal('matchMedia', () => {
    return {matches: true};
  });

  it('renders collapsed by default', () => {
    const details = renderDetails();
    expect(details.open).toBe(false);
    expect(details.dataset.collapsed).toBe('true');
  });

  it('renders expanded with open prop', () => {
    const details = renderDetails({open: true});
    expect(details.open).toBe(true);
    expect(details.dataset.collapsed).toBe('false');
  });

  it('expands when clicking the summary', () => {
    const details = renderDetails();
    fireEvent.click(details.querySelector('summary')!);
    expect(details.open).toBe(true);
    expect(details.dataset.collapsed).toBe('false');
  });

  it('expands when the open attribute is set externally', () => {
    // See https://github.com/facebook/docusaurus/issues/10140
    const details = renderDetails();
    setOpenExternally(details, true);
    expect(details.open).toBe(true);
    expect(details.dataset.collapsed).toBe('false');
  });

  it('collapses when the open attribute is removed externally', () => {
    const details = renderDetails({open: true});
    setOpenExternally(details, false);
    expect(details.open).toBe(false);
    expect(details.dataset.collapsed).toBe('true');
  });
});
