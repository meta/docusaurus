/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import flat from '../flat';

describe('flat', () => {
  it('nested', () => {
    expect(
      flat({
        foo: {
          bar: {
            baz: 'lorem ipsum',
          },
        },
      }),
    ).toEqual({
      'foo.bar.baz': 'lorem ipsum',
    });

    expect(
      flat({
        foo: {
          bar: 'baz',
        },
      }),
    ).toEqual({
      'foo.bar': 'baz',
    });
  });

  it('primitives', () => {
    const primitives = {
      String: 'good morning',
      Number: 1234.99,
      Boolean: true,
      Date: new Date(),
      null: null,
      undefined,
    };
    (Object.keys(primitives) as (keyof typeof primitives)[]).forEach((key) => {
      const value = primitives[key];
      expect(
        flat({
          foo: {
            bar: value as string,
          },
        }),
      ).toEqual({
        'foo.bar': value,
      });
    });
  });

  it('multiple keys', () => {
    expect(
      flat({
        foo: {
          bar: 'baz',
          endi: 'lie',
        },
      }),
    ).toEqual({
      'foo.bar': 'baz',
      'foo.endi': 'lie',
    });
  });

  it('empty object', () => {
    expect(
      flat({
        foo: {
          bar: {},
        },
      }),
    ).toEqual({
      'foo.bar': {},
    });
  });

  it('array', () => {
    expect(
      flat({
        hello: [{world: {again: 'foo'}}, {lorem: 'ipsum'}],
      }),
    ).toEqual({
      'hello.0.world.again': 'foo',
      'hello.1.lorem': 'ipsum',
    });
  });
});
