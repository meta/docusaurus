/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {ThemeClassNames} from '@docusaurus/theme-common';
import HtmlNavbarItem from '../HtmlNavbarItem';

describe('HtmlNavbarItem', () => {
  it('always has the stable theme class, regardless of context', () => {
    // See https://github.com/facebook/docusaurus/issues/12579
    // Users should be able to target a single class to style this item
    // consistently, whether it renders in the top navbar or the mobile menu.
    const cases = [
      {mobile: false, isDropdownItem: false},
      {mobile: true, isDropdownItem: false},
      {mobile: false, isDropdownItem: true},
      {mobile: true, isDropdownItem: true},
    ];

    cases.forEach(({mobile, isDropdownItem}) => {
      const {container} = render(
        <HtmlNavbarItem
          value="<span>Hello</span>"
          mobile={mobile}
          isDropdownItem={isDropdownItem}
        />,
      );
      const item = container.firstElementChild!;
      expect(item).toHaveClass(ThemeClassNames.layout.navbar.item.html);
    });
  });

  it('renders a div with navbar__item on desktop top-level', () => {
    const {container} = render(<HtmlNavbarItem value="<span>Hello</span>" />);
    const item = container.firstElementChild!;
    expect(item.tagName).toBe('DIV');
    expect(item).toHaveClass('navbar__item');
    expect(item).not.toHaveClass('menu__list-item');
  });

  it('renders a div with menu__list-item on mobile top-level', () => {
    const {container} = render(
      <HtmlNavbarItem value="<span>Hello</span>" mobile />,
    );
    const item = container.firstElementChild!;
    expect(item.tagName).toBe('DIV');
    expect(item).toHaveClass('menu__list-item');
    expect(item).not.toHaveClass('navbar__item');
  });

  it('renders a bare li on desktop dropdown items', () => {
    const {container} = render(
      <HtmlNavbarItem value="<span>Hello</span>" isDropdownItem />,
    );
    const item = container.firstElementChild!;
    expect(item.tagName).toBe('LI');
    expect(item).not.toHaveClass('navbar__item');
    expect(item).not.toHaveClass('menu__list-item');
    expect(item).toHaveClass(ThemeClassNames.layout.navbar.item.html);
  });

  it('renders a li with menu__list-item on mobile dropdown items', () => {
    const {container} = render(
      <HtmlNavbarItem value="<span>Hello</span>" mobile isDropdownItem />,
    );
    const item = container.firstElementChild!;
    expect(item.tagName).toBe('LI');
    expect(item).toHaveClass('menu__list-item');
    expect(item).not.toHaveClass('navbar__item');
  });

  it('injects the raw HTML value and forwards custom className', () => {
    const {container} = render(
      <HtmlNavbarItem value="<span>Hello</span>" className="my-custom-class" />,
    );
    const item = container.firstElementChild!;
    expect(item).toHaveClass('my-custom-class');
    expect(item.innerHTML).toBe('<span>Hello</span>');
  });
});
