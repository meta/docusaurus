import {describe, expect, it} from 'vitest';
import compose from '../components/composeStyle';

describe('composeStyle', () => {
  it('Should combine object classes into one className string', () => {
    const theme = {
      base: 'base',
      element: 'base__element',
    };
    const result = compose(theme.base, theme.element);
    expect(result.className).toEqual(`${theme.base} ${theme.element}`);
  });

  it('Should return a styles object unmodified', () => {
    const style = {
      color: 'blue',
      margin: '1em 0',
    };
    const result = compose(style);
    const expected = style;
    expect(result.style).toEqual(expected);
  });

  it('Should throw an error if given a parameter not an object or string', () => {
    const number = 1;
    try {
      compose(number);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe(`Unexpected value ${number}`);
    }
  });
});
