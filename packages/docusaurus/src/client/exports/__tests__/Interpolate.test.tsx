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
import Interpolate, {interpolate} from '../Interpolate';

describe('interpolate', () => {
  it('without placeholders', () => {
    const text = 'Hello how are you?';
    expect(interpolate(text)).toEqual(text);
  });

  it('placeholders with string values', () => {
    const text = 'Hello {name} how are you {day}?';
    const values = {name: 'Sébastien', day: 'today'};
    expect(interpolate(text, values)).toMatchInlineSnapshot(
      `"Hello Sébastien how are you today?"`,
    );
  });

  it('placeholders with string values 2', () => {
    const text = '{number} {string} {object} {array}';
    const values = {
      number: 42,
      string: 'Hello',
      object: {hello: 'world'},
      array: ['Hello'],
    };
    // @ts-expect-error: test invalid object values
    expect(interpolate(text, values)).toMatchInlineSnapshot(
      `"42 Hello [object Object] Hello"`,
    );
  });

  it('placeholders with falsy values', () => {
    const text = '{number} {string} {boolean}';
    const values = {
      number: 0,
      string: '',
      boolean: false,
    };
    // Do we need to improve the JS type -> String conversion logic here?
    expect(interpolate(text, values)).toMatchInlineSnapshot(`"0  false"`);
  });

  it('placeholders with string values mismatch', () => {
    // Should we emit warnings in such case?
    const text = 'Hello {name} how are you {unprovidedValue}?';
    const values = {name: 'Sébastien', extraValue: 'today'};
    // @ts-expect-error: test missing values
    expect(interpolate(text, values)).toMatchInlineSnapshot(
      `"Hello Sébastien how are you {unprovidedValue}?"`,
    );
  });

  it('placeholders with values not provided', () => {
    // Should we emit warnings in such case?
    const text = 'Hello {name} how are you {day}?';
    expect(interpolate(text)).toEqual(text);
    // @ts-expect-error: test missing values
    expect(interpolate(text, {})).toEqual(text);
  });

  it('placeholders with JSX values', () => {
    const text = 'Hello {name} how are you {day}?';
    const values = {name: <b>Sébastien</b>, day: <span>today</span>};
    expect(interpolate(text, values)).toMatchInlineSnapshot(`
      [
        "Hello ",
        <b>
          Sébastien
        </b>,
        " how are you ",
        <span>
          today
        </span>,
        "?",
      ]
    `);
  });

  it('placeholders with mixed vales', () => {
    const text = 'Hello {name} how are you {day}?';
    const values = {name: 'Sébastien', day: <span>today</span>};
    expect(interpolate(text, values)).toMatchInlineSnapshot(`
      [
        "Hello ",
        "Sébastien",
        " how are you ",
        <span>
          today
        </span>,
        "?",
      ]
    `);
  });

  it('acceptance test', () => {
    const text = 'Hello {name} how are you {day}? Another {unprovidedValue}!';
    const values = {
      name: 'Sébastien',
      day: <span>today</span>,
      extraUselessValue1: <div>test</div>,
      extraUselessValue2: 'hi',
    };
    // @ts-expect-error: test missing values
    expect(interpolate(text, values)).toMatchInlineSnapshot(`
      [
        "Hello ",
        "Sébastien",
        " how are you ",
        <span>
          today
        </span>,
        "? Another ",
        "{unprovidedValue}",
        "!",
      ]
    `);
  });
});

describe('<Interpolate>', () => {
  it('without placeholders', () => {
    const text = 'Hello how are you?';
    const {container} = render(<Interpolate>{text}</Interpolate>);
    expect(container).toHaveTextContent(text);
  });

  it('placeholders with string values', () => {
    const text = 'Hello {name} how are you {day}?';
    const values = {name: 'Sébastien', day: 'today'};
    const {container} = render(
      <Interpolate values={values}>{text}</Interpolate>,
    );
    expect(container).toHaveTextContent('Hello Sébastien how are you today?');
  });

  it('acceptance test', () => {
    const text = 'Hello {name} how are you {day}? Another {unprovidedValue}!';
    const values = {
      name: 'Sébastien',
      day: <span>today</span>,
      extraUselessValue1: <div>test</div>,
      extraUselessValue2: 'hi',
    };
    const {container} = render(
      <Interpolate values={values}>{text}</Interpolate>,
    );
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"Hello Sébastien how are you <span>today</span>? Another {unprovidedValue}!"`,
    );
  });

  it('rejects when children is not string', () => {
    expect(() =>
      render(
        // @ts-expect-error: test invalid children
        <Interpolate>
          <span>aaa</span>
        </Interpolate>,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: The Docusaurus <Interpolate> component only accept simple string values. Received: React element]`,
    );
    expect(() =>
      // @ts-expect-error: test invalid children
      render(<Interpolate>{null}</Interpolate>),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: The Docusaurus <Interpolate> component only accept simple string values. Received: object]`,
    );
  });
});
