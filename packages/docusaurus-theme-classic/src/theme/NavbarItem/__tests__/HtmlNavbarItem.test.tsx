/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import HtmlNavbarItem from '../HtmlNavbarItem';

describe('HtmlNavbarItem', () => {
  it('renders a mobile HTML navbar item as a list item', () => {
    const {container} = render(
      <HtmlNavbarItem mobile value="<a href='/docs'>Docs</a>" />,
    );

    expect(container.firstElementChild?.tagName).toBe('LI');
    expect(screen.getByRole('link', {name: 'Docs'})).toBeInTheDocument();
  });

  it('renders a regular desktop HTML navbar item as a div', () => {
    const {container} = render(
      <HtmlNavbarItem value="<a href='/docs'>Docs</a>" />,
    );

    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders a dropdown HTML navbar item as a list item', () => {
    const {container} = render(
      <HtmlNavbarItem isDropdownItem value="<a href='/docs'>Docs</a>" />,
    );

    expect(container.firstElementChild?.tagName).toBe('LI');
  });
});
