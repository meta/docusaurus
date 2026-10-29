/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable camelcase */

import {describe, expect, it} from 'vitest';
import vm from 'node:vm';
import {DEFAULT_PARSE_FRONT_MATTER} from '@docusaurus/utils';
import {serializeJS} from '../serializeJS';

// Evaluates the generated code, the same way the bundler would
function evaluate(code: string): unknown {
  return vm.runInThisContext(`(${code})`);
}

function roundTrip<T>(value: T): T {
  return evaluate(serializeJS(value)) as T;
}

describe('serializeJS', () => {
  describe('primitives', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['true', true],
      ['false', false],
      ['zero', 0],
      ['integer', 42],
      ['negative integer', -42],
      ['float', 3.14],
      ['negative float', -0.5],
      ['large number', 12345678901234567000],
      ['small number', 1e-7],
      ['max safe integer', Number.MAX_SAFE_INTEGER],
      ['NaN', NaN],
      ['Infinity', Infinity],
      ['-Infinity', -Infinity],
      ['-0', -0],
    ])('%s', (_label, value) => {
      expect(roundTrip(value)).toBe(value);
    });
  });

  describe('strings', () => {
    it.each([
      ['empty', ''],
      ['simple', 'hello world'],
      ['single quotes', "it's 'quoted'"],
      ['double quotes', 'say "hello"'],
      // eslint-disable-next-line no-template-curly-in-string
      ['backticks and template syntax', '`${process.exit()}`'],
      ['backslashes', String.raw`C:\path\to\file \n \u0041 \\`],
      ['line feeds', 'line1\nline2\n'],
      ['carriage returns', 'line1\r\nline2'],
      ['tabs', '\tindented\t'],
      ['other escape sequences', '\b\f\v'],
      ['NUL character', 'a\0b'],
      ['NUL character followed by digit', 'a\x001'],
      ['C0 control characters', '\x01\x02\x1B\x1F'],
      ['DEL character', 'a\x7Fb'],
      ['line/paragraph separators', 'a\u2028b\u2029c'],
      ['HTML', '<script>alert("xss")</script><!-- comment -->'],
      ['non-latin text', 'Café 日本語 한국어'],
      ['emojis (surrogate pairs)', '🦖 👨‍👩‍👧 🏳️‍🌈'],
      ['lone high surrogate', 'a\uD83Db'],
      ['lone low surrogate', 'a\uDE00b'],
      ['BOM and zero-width chars', '\uFEFFa\u200Bb\u200Dc'],
      ['number-like', '42'],
      ['keyword-like', 'undefined'],
    ])('%s', (_label, value) => {
      expect(roundTrip(value)).toBe(value);
    });

    it('escapes line terminators', () => {
      // U+2028/U+2029 are valid in string literals since ES2019
      expect(serializeJS('line1\nline2\r')).not.toMatch(/[\n\r]/);
    });
  });

  describe('dates', () => {
    it('serializes date', () => {
      const date = new Date('2021-01-02T10:20:30.456Z');
      const result = roundTrip(date);
      expect(result).toBeInstanceOf(Date);
      expect(result).not.toBe(date);
      expect(result.toISOString()).toBe('2021-01-02T10:20:30.456Z');
    });

    it('serializes invalid date', () => {
      const result = roundTrip(new Date('invalid'));
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeNaN();
    });
  });

  describe('arrays', () => {
    it.each([
      ['empty', []],
      ['strings', ['a', 'b', 'c']],
      ['mixed', [1, 'two', true, null, undefined, NaN, {three: 3}]],
      ['nested', [[], [[]], [1, [2, [3, [4]]]]]],
      ['objects', [{a: 1}, {b: [2]}, {}]],
    ])('%s', (_label, value) => {
      expect(roundTrip(value)).toEqual(value);
    });

    it('preserves undefined items', () => {
      const result = roundTrip([undefined, 1, undefined]);
      expect(result).toHaveLength(3);
      expect(0 in result).toBe(true);
      expect(2 in result).toBe(true);
    });
  });

  describe('objects', () => {
    it('serializes empty object', () => {
      expect(roundTrip({})).toEqual({});
    });

    it('serializes nested objects', () => {
      const value = {a: {b: {c: {d: {e: 'deep'}}}}, f: {}};
      expect(roundTrip(value)).toEqual(value);
    });

    it('serializes any key', () => {
      const value = {
        simple: 1,
        camelCase: 2,
        snake_case: 3,
        $dollar: 4,
        _underscore: 5,
        'kebab-case': 6,
        'with space': 7,
        'with.dot': 8,
        'with:colon': 9,
        "it's": 10,
        'say "hi"': 11,
        '': 12,
        '0': 13,
        '42': 14,
        '1.5': 15,
        '-1': 16,
        '007': 17,
        '1e3': 18,
        default: 19,
        class: 20,
        function: 21,
        constructor: 22,
        toString: 23,
        hasOwnProperty: 24,
        undefined: 25,
        NaN: 26,
        clé: 27,
        日本語: 28,
        '🦖': 29,
        'line\nbreak': 30,
        'back\\slash': 31,
      };
      const result = roundTrip(value);
      expect(result).toEqual(value);
      expect(Object.keys(result)).toEqual(Object.keys(value));
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    it('preserves key order', () => {
      const value = {z: 1, a: 2, m: 3, b: {y: 1, x: 2}};
      const result = roundTrip(value);
      expect(Object.keys(result)).toEqual(['z', 'a', 'm', 'b']);
      expect(Object.keys(result.b)).toEqual(['y', 'x']);
    });

    it('preserves keys with undefined values', () => {
      // Common with parseFrontMatter:
      // frontMatter.description = frontMatter.description?.replaceAll(...)
      const result = roundTrip({title: 'Title', description: undefined});
      expect(result).toHaveProperty('description', undefined);
      expect(Object.keys(result)).toEqual(['title', 'description']);
    });

    it('serializes __proto__ key as own property', () => {
      const value = JSON.parse('{"a": 1, "__proto__": {"polluted": true}}');
      expect(Object.hasOwn(value, '__proto__')).toBe(true);
      const result = roundTrip(value);
      expect(Object.keys(result)).toEqual(['a', '__proto__']);
      expect(
        Object.getOwnPropertyDescriptor(result, '__proto__')?.value,
      ).toEqual({polluted: true});
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(result).not.toHaveProperty('polluted');
    });

    it('ignores non-enumerable properties', () => {
      const value = {a: 1};
      Object.defineProperty(value, 'hidden', {value: 2, enumerable: false});
      expect(roundTrip(value)).toEqual({a: 1});
    });

    it('serializes class instances as plain objects', () => {
      class Point {
        x: number;
        y: number;
        constructor(x: number, y: number) {
          this.x = x;
          this.y = y;
        }
      }
      const result = roundTrip(new Point(1, 2));
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(result).toEqual({x: 1, y: 2});
    });

    it('serializes null-prototype objects', () => {
      const value = Object.assign(Object.create(null), {a: 1, b: 'two'});
      expect({...roundTrip(value)}).toEqual({a: 1, b: 'two'});
    });

    it('serializes shared references', () => {
      // YAML anchors/aliases produce shared references
      const shared = {x: 1, list: [1, 2]};
      const value = {a: shared, b: shared, c: [shared, shared]};
      const result = roundTrip(value);
      expect(result).toEqual(value);
    });
  });

  describe('other values', () => {
    it.each([
      ['bigint', 42n],
      [
        'Map',
        new Map<unknown, unknown>([
          ['a', 1],
          [{b: 2}, [3]],
        ]),
      ],
      ['Set', new Set([1, 'two', {three: 3}])],
      ['RegExp', /^reg.?exp$/gi],
      ['global symbol', Symbol.for('test')],
    ])('serializes %s', (_label, value) => {
      expect(roundTrip(value)).toEqual(value);
    });

    it.each([
      ['function', () => {}],
      ['local symbol', Symbol('test')],
    ])('throws for %s', (_label, value) => {
      expect(() => serializeJS({a: {b: [1, value]}})).toThrow();
    });

    it('throws for circular references', () => {
      const value: {[key: string]: unknown} = {a: {b: [1]}};
      (value.a as {b: unknown[]}).b.push(value);
      expect(() => serializeJS(value)).toThrow('Found circular reference');
    });
  });

  describe('output format', () => {
    it('serializes front matter', () => {
      expect(
        serializeJS({
          title: 'My Doc',
          description: 'A "great" doc',
          sidebar_position: 2,
          draft: false,
          pagination_next: null,
          tags: ['a', 'b'],
          'custom-key': {nested: true},
          last_update: {date: new Date('2021-01-02T00:00:00.000Z')},
        }),
      ).toMatchInlineSnapshot(`
        "{
          "title": "My Doc",
          "description": "A \\"great\\" doc",
          "sidebar_position": 2,
          "draft": false,
          "pagination_next": null,
          "tags": ["a", "b"],
          "custom-key": {
            "nested": true
          },
          "last_update": {
            "date": new Date(1609545600000)
          }
        }"
      `);
    });

    it('serializes content title', () => {
      expect(serializeJS('Hello `world`')).toMatchInlineSnapshot(
        `""Hello \`world\`""`,
      );
      expect(serializeJS(undefined)).toMatchInlineSnapshot(`"undefined"`);
    });
  });

  describe('front matter parsed by default parser', () => {
    async function parse(fileContent: string) {
      const {frontMatter} = await DEFAULT_PARSE_FRONT_MATTER({
        filePath: 'doc.md',
        fileContent,
      });
      return frontMatter;
    }

    it('round-trips complex YAML front matter', async () => {
      const frontMatter = await parse(`---
id: my-doc
title: "My doc: it's \\"great\\""
description: >
  A long description
  on multiple lines
sidebar_label: Doc 🦖
sidebar_position: 1.5
sidebar_class_name: ''
hide_title: true
draft: no
pagination_next: null
pagination_prev: ~
date: 2021-01-02
datetime: 2021-01-02T10:20:30Z
tags: [a, b, 'c d']
keywords:
  - k1
  - k2
last_update:
  date: 2021-01-02
  author: Seb
toc_min_heading_level: 2
hex: 0x1F
octal: 0o17
inf: .inf
negInf: -.inf
nan: .nan
big: 12345678901234567890
anchor: &anchor {x: 1, y: [1, 2]}
alias: *anchor
merged: {<<: *anchor, z: 3}
'quoted key': 1
default: 2
123: 3
__proto__: {polluted: true}
multiline: |
  line1
  line2 'single' "double" \\ \` \${x} </script>
---

# Content
`);
      const result = roundTrip(frontMatter);
      expect(result).toEqual(frontMatter);
      expect(Object.keys(result)).toEqual(Object.keys(frontMatter));
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    it('round-trips JSON front matter', async () => {
      const frontMatter = await parse(`---json
{"title": "JSON", "nested": {"list": [1, "two", null, true]}}
---
`);
      expect(roundTrip(frontMatter)).toEqual({
        title: 'JSON',
        nested: {list: [1, 'two', null, true]},
      });
    });
  });
});
