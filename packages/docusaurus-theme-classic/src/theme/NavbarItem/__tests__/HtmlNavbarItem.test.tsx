// @vitest-environment jsdom

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import HtmlNavbarItem from '../HtmlNavbarItem';

describe('HtmlNavbarItem', () => {
  it('renders a li element on mobile', () => {
    const {container} = render(<HtmlNavbarItem value="Example" mobile />);

    expect(container.firstElementChild?.tagName).toBe('LI');
  });

  it('renders a div element on desktop', () => {
    const {container} = render(<HtmlNavbarItem value="Example" />);

    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders a li element for dropdown items', () => {
    const {container} = render(
      <HtmlNavbarItem value="Example" isDropdownItem />,
    );

    expect(container.firstElementChild?.tagName).toBe('LI');
  });
});
