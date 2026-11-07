/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import HtmlNavbarItem from '../HtmlNavbarItem';

describe('HtmlNavbarItem', () => {
  it('renders a div for desktop top-level item', () => {
    const {container} = render(
      <HtmlNavbarItem value="<span>Custom HTML</span>" />,
    );
    const element = container.firstElementChild!;
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveClass('navbar__item');
    expect(element).not.toHaveClass('menu__list-item');
    expect(element.innerHTML).toBe('<span>Custom HTML</span>');
  });

  it('renders an li for desktop dropdown item', () => {
    const {container} = render(
      <HtmlNavbarItem value="<span>Dropdown HTML</span>" isDropdownItem />,
    );
    const element = container.firstElementChild!;
    expect(element.tagName).toBe('LI');
    expect(element).not.toHaveClass('navbar__item');
    expect(element).not.toHaveClass('menu__list-item');
  });

  it('renders an li for mobile item', () => {
    const {container} = render(
      <HtmlNavbarItem value="<span>Mobile HTML</span>" mobile />,
    );
    const element = container.firstElementChild!;
    expect(element.tagName).toBe('LI');
    expect(element).toHaveClass('menu__list-item');
    expect(element).not.toHaveClass('navbar__item');
    expect(element.innerHTML).toBe('<span>Mobile HTML</span>');
  });

  it('renders an li for mobile dropdown item', () => {
    const {container} = render(
      <HtmlNavbarItem
        value="<span>Mobile Dropdown HTML</span>"
        mobile
        isDropdownItem
      />,
    );
    const element = container.firstElementChild!;
    expect(element.tagName).toBe('LI');
    expect(element).toHaveClass('menu__list-item');
    expect(element).not.toHaveClass('navbar__item');
  });

  it('applies custom className', () => {
    const {container} = render(
      <HtmlNavbarItem
        value="<span>Custom</span>"
        mobile
        className="custom-class"
      />,
    );
    const element = container.firstElementChild!;
    expect(element).toHaveClass('menu__list-item');
    expect(element).toHaveClass('custom-class');
  });
});
