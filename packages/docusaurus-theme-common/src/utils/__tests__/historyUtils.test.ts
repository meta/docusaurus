/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {mergeSearchParams, mergeSearchStrings} from '../historyUtils';

describe('mergeSearchParams', () => {
  it('can append search params', () => {
    expect(
      mergeSearchParams(
        [
          new URLSearchParams('?key1=val1&key2=val2'),
          new URLSearchParams('key2=val2-bis&key3=val3'),
          new URLSearchParams(''),
          new URLSearchParams('?key3=val3-bis&key4=val4'),
        ],
        'append',
      ).toString(),
    ).toBe(
      'key1=val1&key2=val2&key2=val2-bis&key3=val3&key3=val3-bis&key4=val4',
    );
  });

  it('can overwrite search params', () => {
    expect(
      mergeSearchParams(
        [
          new URLSearchParams('?key1=val1&key2=val2'),
          new URLSearchParams('key2=val2-bis&key3=val3'),
          new URLSearchParams(''),
          new URLSearchParams('?key3=val3-bis&key4=val4'),
        ],
        'set',
      ).toString(),
    ).toBe('key1=val1&key2=val2-bis&key3=val3-bis&key4=val4');
  });
});

describe('mergeSearchStrings', () => {
  it('can append search params', () => {
    expect(
      mergeSearchStrings(
        [
          '?key1=val1&key2=val2',
          'key2=val2-bis&key3=val3',
          '',
          '?key3=val3-bis&key4=val4',
        ],
        'append',
      ),
    ).toBe(
      '?key1=val1&key2=val2&key2=val2-bis&key3=val3&key3=val3-bis&key4=val4',
    );
  });

  it('can overwrite search params', () => {
    expect(
      mergeSearchStrings(
        [
          '?key1=val1&key2=val2',
          'key2=val2-bis&key3=val3',
          '',
          '?key3=val3-bis&key4=val4',
        ],
        'set',
      ),
    ).toBe('?key1=val1&key2=val2-bis&key3=val3-bis&key4=val4');
  });

  it('automatically adds ? if there are params', () => {
    expect(mergeSearchStrings(['key1=val1'], 'append')).toBe('?key1=val1');
  });

  it('automatically removes ? if there are no params', () => {
    expect(mergeSearchStrings([undefined, ''], 'append')).toBe('');
  });
});
