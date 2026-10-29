/**
 * @vitest-environment node
 */
import {describe, expect, it, vi} from 'vitest';
import {guessMaxImageWidth, fallbackParams} from '../components/helpers';

describe('guessMaxImageWidth', () => {
  const expected = 0;
  it(`Should return ${expected} when run in the node environment`, () => {
    const result = guessMaxImageWidth({width: 100});
    expect(result).toEqual(expected);
  });
});

describe('FallbackParams', () => {
  const props = {
    srcSet: [
      {
        format: 'webp',
      },
      {
        format: 'jpeg',
      },
      {
        format: 'png',
      },
    ],
    getUrl: vi.fn(),
  };

  it('Should return an object when run in the node environment', () => {
    const result = fallbackParams(props);
    expect(result).not.toEqual({});
    expect(props.getUrl).toHaveBeenCalledWith({
      format: 'jpeg',
    });
    expect(props.getUrl).toHaveBeenCalledWith({
      format: 'png',
    });
    expect(result.ssr).toEqual(true);
  });
});
